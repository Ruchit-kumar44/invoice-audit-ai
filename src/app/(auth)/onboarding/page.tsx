import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboardingForm";
import { requireSession } from "@/features/auth/session";

export async function OnboardingGate(){
   const session = await requireSession();

  if (session.session.activeOrganizationId) {
    redirect("/dashboard");
  }

  return <OnboardingForm />
}

export default function OnboardingPage() {

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Set up your company</h1>
        <p className="text-sm text-muted-foreground">
          One more step. Your invoices will be kept under this name.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}