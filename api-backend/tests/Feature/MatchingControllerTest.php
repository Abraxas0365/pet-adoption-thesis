<?php

namespace Tests\Feature;

use App\Models\Pet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MatchingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_sends_all_available_pets_in_one_batch(): void
    {
        $availableOfficialPet = $this->createPet('official-1', 'available', false);
        $availableTestPet = $this->createPet('test-1', 'available', true);
        $unavailablePet = $this->createPet('unavailable-1', 'adopted', false);

        Http::fake([
            '*/matching/batch' => function (ClientRequest $request) {
                $body = $request->data();
                $results = array_map(
                    static fn (array $pet): array => [
                        'pet_id' => $pet['pet_id'],
                        'score' => 0.75,
                        'scores' => [
                            'weighted_cosine' => 0.5,
                            'jaccard' => 0.5,
                            'tversky' => 0.5,
                        ],
                        'final_scores' => [
                            'weighted_cosine' => 0.75,
                            'jaccard' => 0.75,
                            'tversky' => 0.75,
                        ],
                    ],
                    $body['pets'],
                );

                return Http::response([
                    'status' => 'success',
                    'message' => 'Matches generated successfully.',
                    'algorithm' => $body['algorithm'],
                    'score_scale' => '0_to_1',
                    'total' => count($results),
                    'results' => $results,
                ]);
            },
        ]);

        $response = $this->postJson('/api/matching', [
            'adopter' => [
                'preferred_sex' => ['female'],
                'preferred_size' => ['medium'],
                'preferred_color' => ['black'],
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('algorithm', 'weighted_cosine')
            ->assertJsonPath('score_scale', '0_to_1')
            ->assertJsonCount(2, 'results')
            ->assertJsonPath('results.0.score', 0.75);

        Http::assertSent(function (ClientRequest $request) use (
            $availableOfficialPet,
            $availableTestPet,
            $unavailablePet,
        ): bool {
            $body = $request->data();
            $sentPetIds = array_column($body['pets'], 'pet_id');

            return $request->url() === 'http://127.0.0.1:8001/matching/batch'
                && $body['algorithm'] === 'weighted_cosine'
                && in_array($availableOfficialPet->id, $sentPetIds, true)
                && in_array($availableTestPet->id, $sentPetIds, true)
                && ! in_array($unavailablePet->id, $sentPetIds, true)
                && count($sentPetIds) === 2;
        });
    }

    public function test_it_returns_service_failure_instead_of_a_no_match_response(): void
    {
        $this->createPet('service-failure-1', 'available', false);
        Http::fake([
            '*/matching/batch' => Http::response(['detail' => 'internal error'], 500),
        ]);

        $this->postJson('/api/matching', ['adopter' => []])
            ->assertStatus(502)
            ->assertJsonPath('status', 'error');
    }

    public function test_it_returns_empty_results_without_calling_matching_service(): void
    {
        Http::fake();

        $this->postJson('/api/matching', ['adopter' => []])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('total', 0)
            ->assertJsonPath('results', []);

        Http::assertNothingSent();
    }

    public function test_it_rejects_invalid_preference_ranges(): void
    {
        $this->postJson('/api/matching', [
            'adopter' => [
                'preferred_age_min' => 24,
                'preferred_age_max' => 12,
            ],
        ])->assertUnprocessable();
    }

    private function createPet(string $externalId, string $status, bool $isTest): Pet
    {
        return Pet::query()->create([
            'external_pet_id' => $externalId,
            'name' => 'Pet '.$externalId,
            'pet_type' => 'dog',
            'breed' => 'Aspin',
            'age_months' => 12,
            'sex' => 'male',
            'color' => 'brown',
            'size' => 'large',
            'weight_kg' => 12.5,
            'vaccinated' => true,
            'has_medical_condition' => false,
            'temperament' => ['calm'],
            'activity_level' => 'moderate',
            'is_test_data' => $isTest,
            'status' => $status,
        ]);
    }
}
