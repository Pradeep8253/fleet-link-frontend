"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "@/app/components/AuthForm";
import { postJson } from "@/app/lib/api";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const emailFromLink = sp.get("email") || "";

  return (
    <div className="p-6">
      <AuthForm
        title="Reset Password"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "you@example.com",
            required: true,
          },
          {
            name: "password",
            label: "New Password",
            type: "password",
            placeholder: "Min 6 chars",
            minLength: 6,
          },
        ]}
        submitText="Reset password"
        extras={
          <div className="text-sm">
            <Link href="/auth/login" className="underline">
              Back to login
            </Link>
          </div>
        }
        onSubmit={async ({ email, password }) => {
          await postJson("/api/auth/reset-password", {
            token,
            email: email || emailFromLink,
            password,
          });
          router.push("/auth/login");
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            var urlEmail = ${JSON.stringify(emailFromLink)};
            if (!urlEmail) return;
            var input = document.querySelector('input[name="email"]');
            if (input && !input.value) input.value = urlEmail;
          })();
        `,
        }}
      />
    </div>
  );
}
