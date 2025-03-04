"use client";

import { RegisterForm } from "@/components/registerForm";
import Metadata from "@/utils/metadata";

export default function SignIn() {
  return (
    <div>
      <Metadata title="Register"></Metadata>
      <div className="flex min-h-screen flex-col items-center mx-auto p-4 md:p-24 max-w-[40rem]">
        <RegisterForm />
      </div>
    </div>
  );
}
