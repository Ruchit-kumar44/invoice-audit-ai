import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login";
import { SignedInRedirect } from "@/components/auth/signedInRedirect";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Enter your details to continue.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}