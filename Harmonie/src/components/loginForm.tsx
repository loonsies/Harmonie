"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import DiscordButton from "@/components/buttons/discordButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import React from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  email: string;
  password: string;
};

const handleSubmitForm = (data: { email: string; password: string }) => {
  signIn("credentials", {
    email: data.email,
    password: data.password,
  });
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { className?: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormProps>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="mail@example.com"
                  required
                />

                {errors.email?.message && (
                  <span className="text-red-500 text-xs">
                    {errors.email?.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  id="password"
                  name="password"
                  type="password"
                  required
                />
                <span className="text-red-500 text-xs">
                  {errors.password?.message}
                </span>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  onClick={() => router.push("/auth/register")}
                  className="underline underline-offset-4 cursor-pointer"
                >
                  Sign up
                </a>
              </div>
            </div>
            <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <DiscordButton></DiscordButton>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
