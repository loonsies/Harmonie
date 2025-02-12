"use client";

import { registerUser } from "@/app/api/auth/register";
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

type RegisterFormProps = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { className?: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormProps>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmitForm = async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const user = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (user) {
      router.push("/auth/login");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create a new account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  {...register("username", {
                    required: "Username is required",
                    pattern: {
                      value: /^[a-zA-Z0-9]+$/,
                      message: "Invalid username",
                    },
                  })}
                  id="username"
                  name="username"
                  type="username"
                  autoComplete="username"
                  required
                />
                {errors.username?.message && (
                  <span className="text-red-500 text-xs">
                    {errors.username.message}
                  </span>
                )}
              </div>
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
                  required
                />
                {errors.email?.message && (
                  <span className="text-red-500 text-xs">
                    {errors.email?.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  id="password"
                  name="password"
                  type="password"
                  required
                />
                {errors.password?.message && (
                  <span className="text-red-500 text-xs">
                    {errors.password?.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  {...register("confirmPassword", {
                    required: "Confirmation password is required",
                  })}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
                {errors.password?.message && (
                  <span className="text-red-500 text-xs">
                    {errors.confirmPassword?.message}
                  </span>
                )}
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
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
