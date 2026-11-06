import { authClient } from "@/features/auth/auth-client";
import { makeSlug } from "@/features/auth/slug";

export async function createAndActivateOrganization(
  name: string,
): Promise<{ error: string | null }> {
  const { data, error } = await authClient.organization.create({
    name,
    slug: makeSlug(name),
  });

  if (error || !data) {
    return { error: error?.message ?? "Could not create the organization." };
  }

  const { error: activeError } = await authClient.organization.setActive({
    organizationId: data.id,
  });

  if (activeError) {
    return { error: activeError.message ?? "Could not activate the organization." };
  }

  return { error: null };
}