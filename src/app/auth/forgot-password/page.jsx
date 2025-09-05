"use client";
import AuthForm from "@/app/components/AuthForm";
import { postJson } from "@/app/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="p-6">
      <AuthForm
        title="Forgot Password"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "you@example.com",
          },
        ]}
        submitText="Send reset link"
        extras={
          <div className="text-sm">
            <Link href="/auth/login" className="underline">
              Back to login
            </Link>
          </div>
        }
        onSubmit={async ({ email }) => {
          await postJson("/api/auth/forgot-password", { email });
        }}
      />
    </div>
  );
}
