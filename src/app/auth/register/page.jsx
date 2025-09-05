"use client";
import AuthForm from "@/app/components/AuthForm";
import { postJson } from "@/app/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <AuthForm
        title="Register"
        fields={[
          { name: "name", label: "Full Name", placeholder: "name" },
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
            placeholder: "Min 6 chars",
            minLength: 6,
          },
        ]}
        submitText="Create account"
        extras={
          <div className="text-sm">
            <Link href="/auth/login" className="underline">
              Already have an account? Login
            </Link>
          </div>
        }
        onSubmit={async ({ name, email, password }) => {
          await postJson("/api/auth/register", { name, email, password });
          router.push("/search-vehicle");
        }}
      />
    </div>
  );
}
