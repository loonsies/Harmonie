"use client";

import { LoginForm } from "@/components/loginForm";
import Metadata from "@/utils/metadata";

export default function SignIn() {
  return (
    <div>
      <Metadata title="Sign In"></Metadata>
      <div className="flex min-h-screen flex-col items-center mx-auto p-4 md:p-24 max-w-[40rem]">
        <LoginForm />
      </div>
    </div>
  );
}
