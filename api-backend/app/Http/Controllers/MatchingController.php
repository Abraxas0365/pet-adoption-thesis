<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Database\QueryException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;
use UnexpectedValueException;

class MatchingController extends Controller
{
    public function match(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'adopter' => ['required', 'array'],
            'algorithm' => ['sometimes', 'string', 'in:'.implode(',', [
                'weighted_cosine',
                'jaccard',
                'tversky',
            ])],
            'adopter.preferred_species' => ['sometimes', 'array'],
            'adopter.preferred_species.*' => ['string', 'in:dog,cat,bird,rabbit'],
            'adopter.preferred_sex' => ['sometimes', 'array'],
            'adopter.preferred_sex.*' => ['string', 'in:male,female'],
            'adopter.preferred_size' => ['sometimes', 'array'],
            'adopter.preferred_size.*' => ['string', 'in:small,medium,large'],
            'adopter.preferred_color' => ['sometimes', 'array'],
            'adopter.preferred_color.*' => ['string', 'in:black,white,brown,gray,orange,cream'],
            'adopter.preferred_temperament' => ['sometimes', 'array'],
            'adopter.preferred_temperament.*' => ['string', 'in:friendly,playful,calm,affectionate,energetic,independent,protective,shy,aggressive,patient'],
            'adopter.preferred_activity_level' => ['sometimes', 'array'],
            'adopter.preferred_activity_level.*' => ['string', 'in:low,moderate,high'],
            'adopter.preferred_breed' => ['sometimes', 'array'],
            'adopter.preferred_breed.*' => ['string', 'max:100'],
            'adopter.preferred_age_min' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'adopter.preferred_age_max' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'adopter.preferred_weight_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'adopter.preferred_weight_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'adopter.home_type' => ['sometimes', 'string', 'in:house,apartment,condo,other'],
            'adopter.has_other_animals' => ['sometimes', 'boolean'],
            'adopter.other_animals' => ['sometimes', 'array'],
            'adopter.other_animals.*' => ['string', 'in:dog,cat,bird,rabbit'],
            'adopter.can_handle_medical_conditions' => ['sometimes', 'boolean'],
            'adopter.can_handle_special_care' => ['sometimes', 'boolean'],
        ]);

        $validator->after(function ($validator) use ($request): void {
            $adopter = $request->input('adopter', []);

            if (
                is_array($adopter)
                && is_numeric($adopter['preferred_age_min'] ?? null)
                && is_numeric($adopter['preferred_age_max'] ?? null)
                && (int) $adopter['preferred_age_min'] > (int) $adopter['preferred_age_max']
            ) {
                $validator->errors()->add(
                    'adopter.preferred_age_max',
                    'The maximum preferred age must be greater than or equal to the minimum.',
                );
            }

            if (
                is_array($adopter)
                && is_numeric($adopter['preferred_weight_min'] ?? null)
                && is_numeric($adopter['preferred_weight_max'] ?? null)
                && (float) $adopter['preferred_weight_min'] > (float) $adopter['preferred_weight_max']
            ) {
                $validator->errors()->add(
                    'adopter.preferred_weight_max',
                    'The maximum preferred weight must be greater than or equal to the minimum.',
                );
            }
        });

        $validated = $validator->validate();
        $adopter = $this->normalizeAdopterPayload($validated['adopter']);
        $algorithm = $validated['algorithm'] ?? 'weighted_cosine';

        try {
            // Preferences are compatibility signals; availability is the only current hard eligibility rule.
            $eligiblePets = Pet::query()
                ->where('status', 'available')
                ->orderBy('id')
                ->get();
        } catch (QueryException $exception) {
            Log::error('Could not retrieve eligible pets for matching.', [
                'exception' => $exception,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Matching is temporarily unavailable.',
            ], 503);
        }

        if ($eligiblePets->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'No available pets to evaluate.',
                'algorithm' => $algorithm,
                'score_scale' => '0_to_1',
                'total' => 0,
                'results' => [],
            ]);
        }

        $petsPayload = $eligiblePets->map(fn (Pet $pet): array => [
            'pet_id' => (int) $pet->id,
            'name' => (string) $pet->name,
            'age' => $pet->age_months,
            'sex' => $this->normalizeNullableString($pet->sex),
            'weight' => $pet->weight_kg,
            'color' => $this->normalizeNullableString($pet->color),
            'size' => $this->normalizeNullableString($pet->size),
            'species' => strtolower((string) $pet->pet_type),
            'breed' => $this->normalizeNullableString($pet->breed),
            'temperament' => $pet->temperament === null
                ? null
                : array_map('strtolower', $pet->temperament),
            'activity_level' => $this->normalizeNullableString($pet->activity_level),
            'medical_condition' => $pet->has_medical_condition
                ? 'medical condition'
                : 'healthy',
            'vaccination_status' => $pet->vaccinated
                ? 'vaccinated'
                : 'unvaccinated',
        ])->all();

        try {
            $response = Http::connectTimeout(3)
                ->timeout(30)
                ->post(rtrim(config('services.matching.url'), '/').'/matching/batch', [
                    'adopter' => $adopter,
                    'pets' => $petsPayload,
                    'algorithm' => $algorithm,
                ]);

            if (! $response->successful()) {
                Log::warning('Matching microservice returned a non-success status.', [
                    'status' => $response->status(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'The matching service could not process this request.',
                ], 502);
            }

            $payload = $response->json();
            $rankedResults = $this->validateMatchingResponse(
                $payload,
                $eligiblePets->modelKeys(),
                $algorithm,
            );

            $petsById = $eligiblePets->keyBy('id');
            $results = array_map(function (array $ranked) use ($petsById): array {
                /** @var Pet $pet */
                $pet = $petsById->get($ranked['pet_id']);

                return [
                    'pet_id' => (int) $pet->id,
                    'name' => $pet->name,
                    'species' => $pet->pet_type,
                    'breed' => $pet->breed,
                    'age_months' => $pet->age_months,
                    'sex' => $pet->sex,
                    'image_url' => $pet->image_url,
                    'score' => $ranked['score'],
                    'scores' => $ranked['scores'],
                    'final_scores' => $ranked['final_scores'],
                ];
            }, $rankedResults);

            return response()->json([
                'status' => 'success',
                'message' => $results
                    ? 'Matches generated successfully.'
                    : 'No available pets to evaluate.',
                'algorithm' => $algorithm,
                'score_scale' => '0_to_1',
                'total' => count($results),
                'results' => $results,
            ]);
        } catch (ConnectionException $exception) {
            Log::warning('Matching microservice connection failed.', [
                'exception' => $exception,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'The matching service is temporarily unavailable.',
            ], 503);
        } catch (UnexpectedValueException $exception) {
            Log::error('Matching microservice returned an invalid response.', [
                'exception' => $exception,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'The matching service returned an invalid response.',
            ], 502);
        } catch (Throwable $exception) {
            Log::error('Matching request failed unexpectedly.', [
                'exception' => $exception,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Matching is temporarily unavailable.',
            ], 500);
        }
    }

    private function normalizeAdopterPayload(array $adopter): array
    {
        $arrayFields = [
            'preferred_species',
            'preferred_sex',
            'preferred_size',
            'preferred_color',
            'preferred_temperament',
            'preferred_activity_level',
            'preferred_breed',
            'other_animals',
        ];

        foreach ($arrayFields as $field) {
            $adopter[$field] = array_map(
                static fn (string $value): string => strtolower(trim($value)),
                $adopter[$field] ?? [],
            );
        }

        return $adopter;
    }

    private function normalizeNullableString(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return strtolower(trim($value));
    }

    /**
     * @param  array<int, int>  $eligiblePetIds
     * @return array<int, array<string, mixed>>
     */
    private function validateMatchingResponse(
        mixed $payload,
        array $eligiblePetIds,
        string $algorithm,
    ): array {
        $finalScoreKeys = [
            'weighted_cosine',
            'jaccard',
            'tversky',
        ];

        if (
            ! is_array($payload)
            || ($payload['status'] ?? null) !== 'success'
            || ($payload['algorithm'] ?? null) !== $algorithm
            || ($payload['score_scale'] ?? null) !== '0_to_1'
            || ! is_array($payload['results'] ?? null)
            || ($payload['total'] ?? null) !== count($eligiblePetIds)
            || count($payload['results']) !== count($eligiblePetIds)
        ) {
            throw new UnexpectedValueException('Malformed batch matching response.');
        }

        $seenIds = [];
        $previousScore = INF;
        $results = [];

        foreach ($payload['results'] as $result) {
            if (! is_array($result)) {
                throw new UnexpectedValueException('Malformed matching result.');
            }

            $petId = filter_var($result['pet_id'] ?? null, FILTER_VALIDATE_INT);
            $score = $result['score'] ?? null;
            $scores = $result['scores'] ?? null;
            $finalScores = $result['final_scores'] ?? null;

            if (
                $petId === false
                || ! in_array($petId, $eligiblePetIds, true)
                || in_array($petId, $seenIds, true)
                || ! $this->validScore($score)
                || ! is_array($scores)
                || ! is_array($finalScores)
            ) {
                throw new UnexpectedValueException('Malformed matching score data.');
            }

            foreach ($finalScoreKeys as $key) {
                if (
                    ! array_key_exists($key, $scores)
                    || ! $this->validScore($scores[$key])
                    || ! array_key_exists($key, $finalScores)
                    || ! $this->validScore($finalScores[$key])
                ) {
                    throw new UnexpectedValueException('Invalid algorithm score.');
                }
            }

            if (abs((float) $score - (float) $finalScores[$algorithm]) > 0.000001) {
                throw new UnexpectedValueException('Selected score does not match the requested algorithm.');
            }
            if ((float) $score > $previousScore) {
                throw new UnexpectedValueException('Matching results are not ranked by score.');
            }

            $seenIds[] = $petId;
            $previousScore = (float) $score;
            $results[] = [
                'pet_id' => $petId,
                'score' => (float) $score,
                'scores' => $scores,
                'final_scores' => $finalScores,
            ];
        }

        return $results;
    }

    private function validScore(mixed $score): bool
    {
        return is_numeric($score)
            && is_finite((float) $score)
            && (float) $score >= 0.0
            && (float) $score <= 1.0;
    }
}
