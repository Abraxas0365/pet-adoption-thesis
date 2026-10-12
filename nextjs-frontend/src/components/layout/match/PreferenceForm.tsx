
"use client";

import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

import { MATCH_OPTIONS, HOME_OPTIONS } from "@/lib/definitions";
import type {
  MatchPreferences,
  MatchPreferencesFormProps,
} from "@/types/match";
import MultiSelectField from "@/components/layout/match/MultiSelectedField";

const options = {
  species: MATCH_OPTIONS.species,
  sex: MATCH_OPTIONS.sex,
  size: MATCH_OPTIONS.size,
  color: MATCH_OPTIONS.color,
  temperament: MATCH_OPTIONS.temperament,
  activity: MATCH_OPTIONS.activityLevel,
  animals: MATCH_OPTIONS.otherAnimals,
  home: HOME_OPTIONS,
} as const;

const initialValues: MatchPreferences = {
  preferred_species: [],
  preferred_sex: [],
  preferred_size: [],
  preferred_color: [],
  preferred_temperament: [],
  preferred_activity_level: [],
  preferred_age_min: null,
  preferred_age_max: null,
  preferred_weight_min: null,
  preferred_weight_max: null,
  preferred_breed: "",
  home_type: "house",
  has_other_animals: false,
  other_animals: [],
  can_handle_medical_conditions: false,
  can_handle_special_care: false,
};

export function MatchPreferencesForm({
  onSubmit,
  isSubmitting = false,
}: MatchPreferencesFormProps) {
  const [values, setValues] =
    useState<MatchPreferences>({ ...initialValues });
  const [validationError, setValidationError] = useState<string | null>(null);

  function update<K extends keyof MatchPreferences>(
    key: K,
    value: MatchPreferences[K],
  ) {
    setValidationError(null);
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      values.preferred_age_min !== null &&
      values.preferred_age_max !== null &&
      values.preferred_age_min > values.preferred_age_max
    ) {
      setValidationError("Maximum age must be greater than or equal to minimum age.");
      return;
    }

    if (
      values.preferred_weight_min !== null &&
      values.preferred_weight_max !== null &&
      values.preferred_weight_min > values.preferred_weight_max
    ) {
      setValidationError("Maximum weight must be greater than or equal to minimum weight.");
      return;
    }

    setValidationError(null);
    void onSubmit({ ...values });
  }

  function resetForm() {
    setValidationError(null);
    setValues({ ...initialValues });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FieldSet>
        <FieldLegend>Pet preferences</FieldLegend>
        <FieldDescription>
          Choose the traits you prefer. You can select multiple
          options or leave a field empty if you have no preference.
        </FieldDescription>

        <FieldGroup className="space-y-6 grid grid-cols-3">
          <MultiSelectField
            label="Species"
            items={options.species}
            value={values.preferred_species}
            onChange={(value) =>
              update("preferred_species", value)
            }
          />

          <MultiSelectField
            label="Sex"
            items={options.sex}
            value={values.preferred_sex}
            onChange={(value) =>
              update("preferred_sex", value)
            }
          />

          <MultiSelectField
            label="Size"
            items={options.size}
            value={values.preferred_size}
            onChange={(value) =>
              update("preferred_size", value)
            }
          />

          <MultiSelectField
            label="Color"
            items={options.color}
            value={values.preferred_color}
            onChange={(value) =>
              update("preferred_color", value)
            }
          />

          <MultiSelectField
            label="Temperament"
            description="Choose any personality traits you prefer."
            items={options.temperament}
            value={values.preferred_temperament}
            onChange={(value) =>
              update("preferred_temperament", value)
            }
          />

          <MultiSelectField
            label="Activity level"
            items={options.activity}
            value={values.preferred_activity_level}
            onChange={(value) =>
              update("preferred_activity_level", value)
            }
          />

          <Field>
            <FieldLabel>Preferred breed</FieldLabel>
            <Input
              value={values.preferred_breed}
              onChange={(event) =>
                update("preferred_breed", event.target.value)
              }
              placeholder="Leave blank for any breed"
            />
          </Field>

          <Field>
            <FieldLabel>Age range (months)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Minimum"
                value={values.preferred_age_min ?? ""}
                onChange={(event) =>
                  update(
                    "preferred_age_min",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
              <Input
                type="number"
                min={0}
                placeholder="Maximum"
                value={values.preferred_age_max ?? ""}
                onChange={(event) =>
                  update(
                    "preferred_age_max",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </div>
          </Field>

          <Field>
            <FieldLabel>Weight range (kg)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                step="0.1"
                placeholder="Minimum"
                value={values.preferred_weight_min ?? ""}
                onChange={(event) =>
                  update(
                    "preferred_weight_min",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
              <Input
                type="number"
                min={0}
                step="0.1"
                placeholder="Maximum"
                value={values.preferred_weight_max ?? ""}
                onChange={(event) =>
                  update(
                    "preferred_weight_max",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="grid grid-cols-2">           
        <FieldSet>
          <FieldLegend>Living situation</FieldLegend>

          <Field>
            <FieldLabel>Home type</FieldLabel>
            <Combobox
              items={options.home}
              value={values.home_type}
              onValueChange={(nextValue) =>
                update("home_type", String(nextValue ?? "house"))
              }
            >
              <ComboboxValue />
              <ComboboxContent>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <Field>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={values.has_other_animals}
                onCheckedChange={(checked) => {
                  const hasAnimals = checked === true;

                  setValues((current) => ({
                    ...current,
                    has_other_animals: hasAnimals,
                    other_animals: hasAnimals
                      ? current.other_animals
                      : [],
                  }));
                }}
              />
              <span className="font-medium">
                I currently have other animals
              </span>
            </label>
          </Field>

          {values.has_other_animals && (
            <MultiSelectField
              label="Animals in your household"
              items={options.animals}
              value={values.other_animals}
              onChange={(value) =>
                update("other_animals", value)
              }
            />
          )}
        </FieldSet>

        <FieldSet>
          <FieldLegend>Care capabilities</FieldLegend>

          <FieldDescription>
            Indicate whether you can accommodate additional care needs.
          </FieldDescription>

          <Field>
            <label className="flex items-start gap-3">
              <Checkbox
                checked={values.can_handle_medical_conditions}
                onCheckedChange={(checked) =>
                  update(
                    "can_handle_medical_conditions",
                    checked === true,
                  )
                }
              />
              <span>
                <span className="block font-medium">
                  I can accommodate medical conditions
                </span>
                <span className="text-sm text-muted-foreground">
                  I can provide care for pets with medical needs.
                </span>
              </span>
            </label>
          </Field>

          <Field>
            <label className="flex items-start gap-3">
              <Checkbox
                checked={values.can_handle_special_care}
                onCheckedChange={(checked) =>
                  update(
                    "can_handle_special_care",
                    checked === true,
                  )
                }
              />
              <span>
                <span className="block font-medium">
                  I can provide special care
                </span>
                <span className="text-sm text-muted-foreground">
                  I can accommodate additional supervision or care needs.
                </span>
              </span>
            </label>
          </Field>
        </FieldSet>
      </div>

      {validationError ? (
        <p role="alert" className="text-sm text-destructive">
          {validationError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Finding matches..." : "Find my matches"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={resetForm}
        >
          Reset preferences
        </Button>
      </div>
    </form>
  );
} 