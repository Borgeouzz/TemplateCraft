import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-1 items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-6 p-4">
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <SubmitButton pendingText="Signing In..." formAction={signInAction}>
            Sign in
          </SubmitButton>
          <FormMessage message={message} />
        </form>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link className="text-blue-600 hover:underline" href="/sign-up">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
