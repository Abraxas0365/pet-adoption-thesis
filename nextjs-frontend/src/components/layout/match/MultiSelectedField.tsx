"use client";

import { Fragment } from "react";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

type MultiSelectFieldProps = {
  label: string;
  description?: string;
  items: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
};

export default function MultiSelectField({
  label,
  description,
  items,
  value,
  onChange,
}: MultiSelectFieldProps) {
  const anchor = useComboboxAnchor();

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>

      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}

      <Combobox
        multiple
        autoHighlight
        items={items}
        value={value}
        onValueChange={(nextValue) =>
          onChange(Array.isArray(nextValue) ? nextValue : [])
        }
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(selectedValues) => (
              <Fragment>
                {selectedValues.map((selected: string) => (
                  <ComboboxChip key={selected}>
                    {selected.replaceAll("_", " ")}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={
                    value.length === 0
                      ? "Choose any that apply..."
                      : "Add another..."
                  }
                  className="text-foreground"
                />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No options found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                <span className="capitalize">
                  {item.replaceAll("_", " ")}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <FieldDescription>
        {value.length === 0
          ? "No preference — all options are acceptable."
          : `${value.length} selected`}
      </FieldDescription>
    </Field>
  );
}