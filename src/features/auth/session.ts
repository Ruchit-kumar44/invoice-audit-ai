import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "@/db";

export const requireSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const requireOrgSession = cache(async () => {
  const session = await requireSession();

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    redirect("/onboarding");
  }

  const member = await prisma.member.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true, organization: { select: { name: true } } },
  });
  if (!member) {
    redirect("/onboarding");
  }

  return {
    userId: session.user.id,
    userName: session.user.name,
    organizationId,
    organizationName: member.organization.name,
    role: member.role,
  };
});

export async function redirectIfSignedIn() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }
}