import Link from "next/link";
import { SignUpForm } from "@/components/auth/signupForm";

export default async function SignUpPage() {

  return (
    <div className="space-y-6 bg-white/7 p-5 rounded-xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your company and start auditing invoices.
        </p>
      </div>
      <SignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}