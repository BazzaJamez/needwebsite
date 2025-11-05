"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/shared/FormField";
import { PackageEditor } from "@/components/services/PackageEditor";
import {
  ServiceCreateSchema,
  ServiceUpdateSchema,
  type ServiceCreateInput,
  type ServiceUpdateInput,
} from "@/lib/validation/service";

// Form input type - tags can be string (will be transformed by Zod)
// We need to match the form shape before Zod transformation
type ServiceFormInput = {
  title: string;
  category: string;
  description: string;
  tags?: string;
  gallery?: string[];
  packages: Array<{
    tier: "basic" | "standard" | "premium";
    priceMinor: number;
    deliveryDays: number;
    revisions: number;
    features: string[];
  }>;
  isActive: boolean;
};

const CATEGORIES = [
  "Web Development",
  "Design",
  "Writing",
  "Marketing",
  "Video Editing",
  "Music & Audio",
  "Programming",
  "Business",
  "Lifestyle",
  "Other",
];

interface ServiceFormProps {
  onSubmit: (
    data: ServiceCreateInput | ServiceUpdateInput
  ) => Promise<{ slug: string } | { error: string }>;
  initialData?: {
    title: string;
    category: string;
    description: string;
    tags?: string[];
    gallery?: string[];
    packages: Array<{
      tier: "basic" | "standard" | "premium";
      priceMinor: number;
      deliveryDays: number;
      revisions: number;
      features: string[];
    }>;
    isActive: boolean;
  };
  mode?: "create" | "edit";
}

export function ServiceForm({
  onSubmit,
  initialData,
  mode = "create",
}: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<ServiceFormInput>({
    resolver: zodResolver(
      mode === "create" ? ServiceCreateSchema : ServiceUpdateSchema
    ),
    defaultValues: initialData
      ? ({
          title: initialData.title,
          category: initialData.category,
          description: initialData.description,
          tags: initialData.tags?.join(", ") || "",
          gallery: initialData.gallery || [],
          packages: initialData.packages.map((pkg) => ({
            tier: pkg.tier,
            priceMinor: pkg.priceMinor / 100, // Convert from cents
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            features: pkg.features,
          })),
          isActive: initialData.isActive,
        } as ServiceFormInput)
      : ({
          title: "",
          category: "",
          description: "",
          tags: "",
          gallery: [],
          packages: [
            {
              tier: "basic",
              priceMinor: 0,
              deliveryDays: 3,
              revisions: 0,
              features: [""],
            },
            {
              tier: "standard",
              priceMinor: 0,
              deliveryDays: 5,
              revisions: 1,
              features: [""],
            },
            {
              tier: "premium",
              priceMinor: 0,
              deliveryDays: 7,
              revisions: 2,
              features: [""],
            },
          ],
          isActive: false,
        } as ServiceFormInput),
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = methods;
  
  // Debug: Log form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);
  const isActive = watch("isActive");

  const onFormSubmit = async (data: ServiceFormInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Tags are handled by Zod transform, just pass through
      const result = await onSubmit(data as ServiceCreateInput | ServiceUpdateInput);

      if ("error" in result) {
        setSubmitError(result.error);
      } else {
        if (mode === "create") {
          router.push(`/services/${result.slug}/editor`);
        } else {
          // Refresh the page to show updated data
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save service"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Info Section */}
      <section className="space-y-6">
        <h2 className="text-h2 font-semibold">Basic Information</h2>

        <FormField label="Title" required error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="e.g., Professional logo design"
          />
        </FormField>

        <FormField label="Category" required error={errors.category?.message}>
          <Select {...register("category")}>
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Description"
          required
          error={errors.description?.message}
          description="Describe what you offer and what buyers can expect"
        >
          <Textarea
            {...register("description")}
            placeholder="Provide a detailed description of your service..."
            rows={6}
          />
        </FormField>

        <FormField
          label="Tags"
          error={errors.tags?.message}
          description="Comma-separated tags to help buyers find your service"
        >
          <Input
            {...register("tags")}
            placeholder="e.g., logo, branding, vector, minimalist"
          />
        </FormField>
      </section>

      {/* Gallery Section */}
      <section className="space-y-6">
        <h2 className="text-h2 font-semibold">Gallery</h2>
        <div className="rounded-xl border border-border bg-elev p-6">
          <p className="text-sm text-muted">
            Image upload will be implemented soon. For now, you can add image URLs
            if needed.
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <section className="space-y-6">
        <h2 className="text-h2 font-semibold">Packages</h2>
        <p className="text-sm text-muted">
          Define three pricing tiers for your service
        </p>

        <div className="space-y-6">
          <PackageEditor tier="basic" index={0} />
          <PackageEditor tier="standard" index={1} />
          <PackageEditor tier="premium" index={2} />
        </div>

        {errors.packages && (
          <p className="text-sm text-danger" role="alert">
            {errors.packages.message || "Please fix package errors"}
          </p>
        )}
      </section>

      {/* Visibility Section */}
      <section className="space-y-6">
        <h2 className="text-h2 font-semibold">Visibility</h2>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setValue("isActive", e.target.checked)}
            className="h-5 w-5 rounded border-border text-accent focus:ring-2 focus:ring-accent/50"
          />
          <label htmlFor="isActive" className="text-base font-medium">
            Publish immediately
          </label>
        </div>
        <p className="text-sm text-muted">
          Uncheck to save as draft and publish later
        </p>
      </section>

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-danger bg-danger/10 p-4" role="alert">
          <p className="mb-2 text-sm font-semibold text-danger">
            Please fix the following errors:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-danger">
            {errors.title && <li>Title: {errors.title.message}</li>}
            {errors.category && <li>Category: {errors.category.message}</li>}
            {errors.description && <li>Description: {errors.description.message}</li>}
            {errors.tags && <li>Tags: {errors.tags.message}</li>}
            {errors.packages && (
              <li>
                Packages: {errors.packages.message || "Please check all package fields"}
                {Array.isArray(errors.packages) && errors.packages.map((pkgError: any, idx: number) => {
                  if (!pkgError) return null;
                  const pkgIssues: string[] = [];
                  if (pkgError.priceMinor) pkgIssues.push(`Price ${pkgError.priceMinor.message}`);
                  if (pkgError.deliveryDays) pkgIssues.push(`Delivery Days ${pkgError.deliveryDays.message}`);
                  if (pkgError.revisions) pkgIssues.push(`Revisions ${pkgError.revisions.message}`);
                  if (pkgError.features) pkgIssues.push(`Features ${pkgError.features.message}`);
                  return pkgIssues.length > 0 ? (
                    <li key={idx} className="ml-4">
                      Package {idx + 1}: {pkgIssues.join(", ")}
                    </li>
                  ) : null;
                })}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-xl border border-danger bg-danger/10 p-4" role="alert">
          <p className="text-sm text-danger">{submitError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setValue("isActive", false);
            handleSubmit(onFormSubmit)();
          }}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Publishing..."
              : "Saving..."
            : mode === "create"
            ? "Publish Service"
            : "Save Changes"}
        </Button>
      </div>
    </form>
    </FormProvider>
  );
}

