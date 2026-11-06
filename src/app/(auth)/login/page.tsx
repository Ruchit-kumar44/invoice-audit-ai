import Link from "next/link";
import { LoginForm } from "@/components/auth/login";


export default async function LoginPage() {

  return (
    <div className="space-y-6 bg-white/7 p-5 rounded-xl">
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