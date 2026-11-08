import { redirectIfSignedIn } from "@/features/auth/session";

export async function SignedInRedirect() {
  await redirectIfSignedIn();
  return null;
}