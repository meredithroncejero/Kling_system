import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
