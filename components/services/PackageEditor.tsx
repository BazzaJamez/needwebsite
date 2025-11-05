"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";

interface PackageEditorProps {
  tier: "basic" | "standard" | "premium";
  index: number;
}

// Form type that matches ServiceFormInput (before Zod transform)
type FormInput = {
  packages: Array<{
    tier: "basic" | "standard" | "premium";
    priceMinor: number;
    deliveryDays: number;
    revisions: number;
    features: string[];
  }>;
};

export function PackageEditor({ tier, index }: PackageEditorProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormInput>();

  const { fields, append, remove } = useFieldArray({
    name: `packages.${index}.features`,
  });

  const packageErrors = errors.packages?.[index];

  const tierLabels: Record<typeof tier, string> = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  return (
    <div className="rounded-xl border border-border bg-elev p-6 shadow-1">
      <input
        type="hidden"
        {...register(`packages.${index}.tier`)}
        value={tier}
      />
      <h3 className="mb-4 text-h4 font-semibold">{tierLabels[tier]} Package</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            label="Price (USD)"
            required
            error={packageErrors?.priceMinor?.message}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                className="pl-8"
                {...register(`packages.${index}.priceMinor`, {
                  valueAsNumber: true,
                  setValueAs: (v) => Math.round(Number(v) * 100), // Convert to cents
                })}
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField
            label="Delivery Days"
            required
            error={packageErrors?.deliveryDays?.message}
          >
            <Input
              type="number"
              min="1"
              {...register(`packages.${index}.deliveryDays`, {
                valueAsNumber: true,
              })}
              placeholder="3"
            />
          </FormField>

          <FormField
            label="Revisions"
            required
            error={packageErrors?.revisions?.message}
          >
            <Input
              type="number"
              min="0"
              {...register(`packages.${index}.revisions`, {
                valueAsNumber: true,
              })}
              placeholder="0"
            />
          </FormField>
        </div>

        <FormField
          label="Features"
          required
          error={packageErrors?.features?.message}
          description="List what's included in this package"
        >
          <div className="space-y-2">
            {fields.map((field, featureIndex) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`packages.${index}.features.${featureIndex}`)}
                  placeholder="e.g., 3 pages, responsive design"
                  className="flex-1"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(featureIndex)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append("")}
            >
              + Add Feature
            </Button>
          </div>
        </FormField>
      </div>
    </div>
  );
}

