"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { TypeOf } from "zod";
import { useToast } from "@/hooks/use-toast";
import { usernameSchema } from "@/app/schemas/usernameSchema";
import { useUser } from "@/contexts/UserContext";
import { useSession } from "next-auth/react";
import Metadata from "@/utils/metadata";

type UsernameFormProps = TypeOf<typeof usernameSchema>;

export default function NewUser() {
  const router = useRouter();
  const { toast } = useToast();
  const { updateUserData } = useUser();
  const { data: session, update: updateSession } = useSession();

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
    }
    if (session?.user?.name) {
      router.push("/");
    }
  }, [session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsernameFormProps>({
    resolver: zodResolver(usernameSchema),
  });

  const handleSubmitForm = async (data: UsernameFormProps) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Update both session and context
      await updateSession({
        name: data.username,
      });

      updateUserData({
        name: data.username,
        email: session?.user?.email || undefined,
      });

      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update settings.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center mx-auto p-4 md:p-24 max-w-[40rem]">
      <Metadata title="New User"></Metadata>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Choose your username</CardTitle>
          <CardDescription>
            Before being able to submit songs, please enter an username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <span className="text-red-500 text-xs">
                    {errors.username.message}
                  </span>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
