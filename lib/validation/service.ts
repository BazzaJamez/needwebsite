import { z } from "zod";

/**
 * Package tier enum
 */
export const PackageTierSchema = z.enum(["basic", "standard", "premium"]);

/**
 * Package creation schema
 */
export const PackageCreateSchema = z.object({
  tier: PackageTierSchema,
  priceMinor: z.number().int().nonnegative(),
  deliveryDays: z.number().int().positive(),
  revisions: z.number().int().nonnegative(),
  features: z.array(z.string().min(1)).min(1, "At least one feature is required"),
});

/**
 * Service creation schema (matches domain model)
 */
export const ServiceCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(5000),
  tags: z
    .union([z.string(), z.array(z.string().min(1))])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        const parsed = val.split(",").map((t) => t.trim()).filter(Boolean);
        return parsed.length > 0 ? parsed : undefined;
      }
      return val;
    }),
  gallery: z.array(z.string().url()).optional(), // Image URLs (stub for now)
  packages: z
    .array(PackageCreateSchema)
    .length(3, "Exactly 3 packages are required (basic, standard, premium)")
    .refine(
      (packages) => {
        const tiers = packages.map((p) => p.tier);
        return (
          tiers.includes("basic") &&
          tiers.includes("standard") &&
          tiers.includes("premium")
        );
      },
      {
        message: "Packages must include basic, standard, and premium tiers",
      }
    ),
  isActive: z.boolean().default(false),
});

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type PackageCreateInput = z.infer<typeof PackageCreateSchema>;

/**
 * Service update schema (same as create, but fields are optional)
 */
export const ServiceUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  category: z.string().min(1, "Category is required").optional(),
  description: z.string().min(1, "Description is required").max(5000).optional(),
  tags: z
    .union([z.string(), z.array(z.string().min(1))])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        const parsed = val.split(",").map((t) => t.trim()).filter(Boolean);
        return parsed.length > 0 ? parsed : undefined;
      }
      return val;
    }),
  gallery: z.array(z.string().url()).optional(),
  packages: z
    .array(PackageCreateSchema)
    .length(3, "Exactly 3 packages are required (basic, standard, premium)")
    .refine(
      (packages) => {
        const tiers = packages.map((p) => p.tier);
        return (
          tiers.includes("basic") &&
          tiers.includes("standard") &&
          tiers.includes("premium")
        );
      },
      {
        message: "Packages must include basic, standard, and premium tiers",
      }
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;

/**
 * Service list query parameters schema
 */
export const ServiceListQuerySchema = z.object({
  q: z.string().optional(), // Search query
  category: z.string().optional(), // Filter by category
  min: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().nonnegative().optional()), // Minimum price (in minor units)
  max: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().nonnegative().optional()), // Maximum price (in minor units)
  sort: z
    .enum(["relevance", "rating", "newest", "price_asc", "price_desc"])
    .default("relevance"), // Sort order
});

export type ServiceListQueryInput = z.infer<typeof ServiceListQuerySchema>;

