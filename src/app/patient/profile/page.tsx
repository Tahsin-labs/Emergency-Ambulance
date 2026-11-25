"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileInput } from "@/schemas";
import { apiFetch } from "@/lib/api";
import { User } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User as UserIcon, Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function PatientProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: () => apiFetch<User>("/users/me"),
  });

  const profile = data?.data || authUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  // Update profile handler
  const onUpdateProfile = async (formData: UpdateProfileInput) => {
    try {
      setSavingProfile(true);
      const res = await apiFetch<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      toast.success("Profile details updated successfully!");
      if (res.data) setUser(res.data);
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload avatar to Cloudinary via backend endpoint POST /users/me/avatar
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP)");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploadingAvatar(true);
      const res = await fetch("/api/proxy/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      toast.success("Profile photo updated on Cloudinary!");
      if (json.data) setUser(json.data);
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    } catch (err: any) {
      toast.error(err.message || "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Profile & Security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal details, emergency contact info, and profile avatar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Profile Photo</span>
            <Badge variant="outline">{profile?.role}</Badge>
          </CardTitle>
          <CardDescription>
            Stored securely on Cloudinary. Visible to your assigned paramedic during active dispatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-red-500 bg-muted flex items-center justify-center text-muted-foreground">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-semibold"
              disabled={uploadingAvatar}
            >
              <Camera className="h-6 w-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="font-semibold text-lg">{profile?.name}</div>
            <div className="text-xs text-muted-foreground">{profile?.email}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>
            Update your registered name and emergency mobile number.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onUpdateProfile)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input value={profile?.email || ""} disabled className="bg-muted cursor-not-allowed" />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
