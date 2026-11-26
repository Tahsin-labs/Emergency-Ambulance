"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerDriverSchema, RegisterDriverInput } from "@/schemas";
import { apiFetch } from "@/lib/api";
import { User } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserPlus, Car, Loader2, X, Shield, Phone, Mail } from "lucide-react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<{ users: User[] }>("/admin/users?limit=100"),
  });

  const users: User[] = (data?.data as any) || [];
  const filteredUsers = users.filter((u) => (!roleFilter ? true : u.role === roleFilter));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RegisterDriverInput>({
    resolver: zodResolver(registerDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+88018",
      password: "",
      licenseNumber: "DL-DHAKA-2024-",
    },
  });

  const onRegisterDriver = async (formData: RegisterDriverInput) => {
    try {
      setSaving(true);
      await apiFetch("/auth/register-driver", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success(`Driver ${formData.name} registered and onboarded successfully!`);
      reset();
      setShowDriverModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers-list"] });
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.path) setError(e.path as any, { message: e.message });
        });
      }
      toast.error(err.message || "Failed to register driver");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Account Governance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Role governance for Administrators, Ambulance Drivers, and Patients.
          </p>
        </div>
        <Button onClick={() => setShowDriverModal(true)} variant="emergency">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Onboard Ambulance Driver
        </Button>
      </div>

      {/* Role Filter Bar */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Filter Role:</span>
          <div className="flex gap-2">
            {["", "ADMIN", "DRIVER", "PATIENT"].map((role) => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(role)}
                className="text-xs h-8"
              >
                {role || "All Roles"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Register Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Car className="h-5 w-5 text-red-600" />
                Onboard Ambulance Driver
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDriverModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onRegisterDriver)} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold">Driver Full Name</label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Tariqul Islam"
                  className="mt-1"
                />
                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold">Official Driver Email</label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="driver@ambulance.com"
                  className="mt-1"
                />
                {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Contact Phone</label>
                  <Input
                    {...register("phone")}
                    placeholder="+8801811000000"
                    className="mt-1"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold">BRTA License No.</label>
                  <Input
                    {...register("licenseNumber")}
                    placeholder="DL-DHAKA-2024-004"
                    className="mt-1"
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-red-500 mt-0.5">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Portal Password</label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDriverModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="emergency" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register & Activate Driver
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Driver Details / Ambulance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="p-3 font-semibold">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3 font-mono text-xs">{u.phone || "—"}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            u.role === "ADMIN"
                              ? "destructive"
                              : u.role === "DRIVER"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {u.driver ? (
                          <div className="space-y-0.5">
                            <div className="font-mono font-medium">Lic: {u.driver.licenseNumber}</div>
                            {u.driver.ambulance ? (
                              <div className="text-emerald-600 font-semibold flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {u.driver.ambulance.plateNumber} ({u.driver.ambulance.type})
                              </div>
                            ) : (
                              <div className="text-muted-foreground italic">No ambulance assigned</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={u.status === "ACTIVE" ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {u.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
