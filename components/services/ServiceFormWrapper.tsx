"use client";

import { ServiceForm } from "./ServiceForm";
import { createServiceAction } from "@/app/(app)/services/new/actions";
import type { ServiceCreateInput, ServiceUpdateInput } from "@/lib/validation/service";

interface ServiceFormWrapperProps {
  mode?: "create" | "edit";
  initialData?: Parameters<typeof ServiceForm>[0]["initialData"];
  updateAction?: (slug: string, data: ServiceUpdateInput) => Promise<{ slug: string } | { error: string }>;
  slug?: string; // For edit mode
}

export function ServiceFormWrapper({ mode = "create", initialData, updateAction, slug }: ServiceFormWrapperProps) {
  const handleSubmit = async (
    data: ServiceCreateInput | ServiceUpdateInput
  ): Promise<{ slug: string } | { error: string }> => {
    if (mode === "create") {
      return await createServiceAction(data as ServiceCreateInput);
    }
    
    if (mode === "edit" && updateAction && slug) {
      return await updateAction(slug, data as ServiceUpdateInput);
    }
    
    return { error: "Edit mode requires updateAction and slug" };
  };

  return <ServiceForm onSubmit={handleSubmit} initialData={initialData} mode={mode} />;
}
