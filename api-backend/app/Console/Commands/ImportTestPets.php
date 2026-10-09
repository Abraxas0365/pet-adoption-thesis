<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Pet;
use RuntimeException;
use Throwable;

class ImportTestPets extends Command
{
    protected $signature = 'pets:import-test
        {--file= : Optional path to the CSV file}';

    protected $description = 'Import test pets from a CSV file';

    public function handle(): int
    {
        $path = $this->option('file')
            ?: database_path('seeders/data/pet_adoption_data.csv');

        if (! is_file($path) || ! is_readable($path)) {
            $this->error("CSV file not found or unreadable: {$path}");
            return self::FAILURE;
        }

        $file = fopen($path, 'r');

        if ($file === false) {
            $this->error('Could not open CSV file.');
            return self::FAILURE;
        }

        try {
            $headers = fgetcsv($file);

            if (! $headers) {
                throw new RuntimeException('CSV file is empty.');
            }

            // Remove a UTF-8 BOM if present.
            $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);

            $required = [
                'PetID', 'PetType', 'Breed', 'AgeMonths',
                'Color', 'Size', 'WeightKg', 'Vaccinated',
                'HealthCondition', 'TimeInShelterDays',
            ];

            if (array_diff($required, $headers)) {
                throw new RuntimeException(
                    'CSV headers do not match the expected dataset.'
                );
            }

            $imported = 0;
            $skipped = 0;

            DB::transaction(function () use (
                $file, $headers, &$imported, &$skipped
            ) {
                while (($values = fgetcsv($file)) !== false) {
                    if (count($values) !== count($headers)) {
                        $skipped++;
                        continue;
                    }

                    $row = array_combine($headers, $values);

                    if (
                        ! $row ||
                        trim((string) $row['PetID']) === '' ||
                        ! is_numeric($row['AgeMonths']) ||
                        ! is_numeric($row['Vaccinated']) ||
                        ! is_numeric($row['HealthCondition']) ||
                        ! in_array((string) $row['Vaccinated'], ['0', '1'], true) ||
                        ! in_array((string) $row['HealthCondition'], ['0', '1'], true) ||
                        ! is_numeric($row['TimeInShelterDays']) ||
                        ! is_numeric($row['WeightKg']) ||
                        (float) $row['WeightKg'] < 0 ||
                        (int) $row['AgeMonths'] < 0 ||
                        (int) $row['TimeInShelterDays'] < 0
                    ) {
                        $skipped++;
                        continue;
                    }

                    $petId = trim((string) $row['PetID']);

                    Pet::updateOrCreate(
                        ['external_pet_id' => $petId],
                        [
                            'name' => 'Test Pet ' . $petId,
                            'pet_type' => strtolower(trim($row['PetType'])),
                            'breed' => trim($row['Breed']) ?: null,
                            'age_months' => (int) $row['AgeMonths'],
                            'color' => strtolower(trim($row['Color'])),
                            'size' => strtolower(trim($row['Size'])),
                            'weight_kg' => (float) $row['WeightKg'],
                            'vaccinated' => (bool) (int) $row['Vaccinated'],
                            'has_medical_condition' =>
                                (bool) (int) $row['HealthCondition'],
                            'time_in_shelter_days' =>
                                (int) $row['TimeInShelterDays'],
                            'is_test_data' => true,
                            'status' => 'available',
                        ]
                    );

                    $imported++;
                }
            });

            $this->info("Processed records: {$imported}");
            $this->info("Skipped invalid rows: {$skipped}");
            $this->info(
                'Total test pets in database: ' .
                Pet::where('is_test_data', true)->count()
            );

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        } finally {
            fclose($file);
        }
    }
}
