"use client";
import AuthForm from "@/app/components/AuthForm";
import { postJson, getJson } from "@/app/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await getJson("/api/auth/get"); 
        if (d?.user) {
          router.replace(redirect);
          return;
        }
      } catch {}
      setChecking(false);
    })();
  }, [redirect, router]);

  if (checking) {
    return;
  }

  return (
    <div className="p-6">
      <AuthForm
        title="Login"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "you@example.com",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "",
            minLength: 6,
          },
        ]}
        submitText="Login"
        extras={
          <div className="text-sm flex justify-between">
            <Link href="/auth/forgot-password" className="underline">
              Forgot password?
            </Link>
            <Link href="/auth/register" className="underline">
              Create account
            </Link>
          </div>
        }
        onSubmit={async ({ email, password }) => {
          await postJson("/api/auth/login", { email, password }); 
          router.push(redirect); 
        }}
      />
    </div>
  );
}
