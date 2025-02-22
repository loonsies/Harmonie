"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { userSettingsSchema } from "@/app/schemas/userSettingsSchema";
import type { TypeOf } from "zod";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";

type SettingsFormProps = TypeOf<typeof userSettingsSchema>;

export function SettingsForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const { userData, updateAvatar, updateUserData } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SettingsFormProps>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      reset({
        username: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session, reset]);

  const handleSubmitForm = async (data: SettingsFormProps) => {
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

      // Update the user data in context
      updateUserData({
        name: data.username,
        email: data.email,
      });

      toast({
        title: "Success",
        description: "Your settings have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update settings.",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true);
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Update session user image
      if (session?.user) {
        session.user.image = "default.png";
      }

      // Update avatar in navbar
      updateAvatar();

      toast({
        title: "Success",
        description: "Profile picture removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove profile picture.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image must be less than 5MB",
      });
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File must be JPEG, PNG, or GIF",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Update session user image
      if (session?.user) {
        session.user.image = `/user/${session.user.name}/avatar`;
      }

      // Update avatar in navbar
      updateAvatar();

      toast({
        title: "Success",
        description: "Profile picture updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-8">
            <div className="flex items-center gap-x-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={`/user/${session?.user?.name}/avatar?v=${userData.avatarKey}`}
                  alt="Profile picture"
                />
              </Avatar>
              <div className="space-y-1">
                <Label htmlFor="picture">Profile Picture</Label>
                <div className="flex gap-2">
                  <Input
                    id="picture"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="py-0"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    disabled={
                      !session?.user?.image ||
                      session?.user?.image === "default.png"
                    }
                    onClick={handleRemoveAvatar}
                    title="Remove profile picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Max file size: 5MB. Supported formats: JPEG, PNG, GIF
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="Your username"
                />
                {errors.username && (
                  <span className="text-red-500 text-xs">
                    {errors.username.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="Your email"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  {...register("currentPassword")}
                  id="currentPassword"
                  type="password"
                />
                {errors.currentPassword && (
                  <span className="text-red-500 text-xs">
                    {errors.currentPassword.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  {...register("newPassword")}
                  id="newPassword"
                  type="password"
                />
                {errors.newPassword && (
                  <span className="text-red-500 text-xs">
                    {errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-xs">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
