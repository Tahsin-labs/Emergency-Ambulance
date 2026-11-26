"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hospitalSchema, HospitalInput } from "@/schemas";
import { apiFetch } from "@/lib/api";
import { Hospital } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Building2, Loader2, X } from "lucide-react";

export default function AdminHospitalsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hospitals"],
    queryFn: () => apiFetch<Hospital[]>("/hospitals"),
  });

  const hospitals = (data?.data as any) || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<HospitalInput>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "Dhaka",
      lat: 23.7808,
      lng: 90.4168,
      phone: "+88028144400",
      specialties: ["Cardiology", "Trauma", "ICU"],
      totalBeds: 250,
      availableBeds: 35,
      hasEmergency: true,
    },
  });

  const onSubmit = async (formData: HospitalInput) => {
    try {
      setCreating(true);
      const res = await apiFetch("/hospitals", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("New hospital registered successfully!");
      reset();
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
    } catch (err: any) {
      if (err.data?.errorSources && Array.isArray(err.data.errorSources)) {
        err.data.errorSources.forEach((source: any) => {
          setError(source.path as any, { message: source.message });
        });
      }
      toast.error(err.message || "Failed to create hospital");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Network Governance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register partner hospitals and maintain emergency room and total bed counts.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Add Partner Hospital</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital Name</label>
                  <Input placeholder="e.g. Apollo Central Hospital" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Address</label>
                  <Input placeholder="Plot 10, Road 5, Block B" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input placeholder="Dhaka" {...register("city")} />
                    {errors.city && (
                      <p className="text-xs text-red-500">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Phone</label>
                    <Input placeholder="+8801700000000" {...register("phone")} />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register("lat", { valueAsNumber: true })}
                    />
                    {errors.lat && (
                      <p className="text-xs text-red-500">{errors.lat.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register("lng", { valueAsNumber: true })}
                    />
                    {errors.lng && (
                      <p className="text-xs text-red-500">{errors.lng.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Beds</label>
                    <Input
                      type="number"
                      {...register("totalBeds", { valueAsNumber: true })}
                    />
                    {errors.totalBeds && (
                      <p className="text-xs text-red-500">{errors.totalBeds.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Beds</label>
                    <Input
                      type="number"
                      {...register("availableBeds", { valueAsNumber: true })}
                    />
                    {errors.availableBeds && (
                      <p className="text-xs text-red-500">{errors.availableBeds.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hasEmergency"
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    {...register("hasEmergency")}
                  />
                  <label htmlFor="hasEmergency" className="text-sm font-medium">
                    24/7 Emergency Room Service Active
                  </label>
                </div>
              </CardContent>

              <div className="p-6 pt-0 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Hospital"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Hospital Name</th>
                    <th className="p-3">City / Address</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Emergency Unit</th>
                    <th className="p-3">Beds Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hospitals.map((h: Hospital) => (
                    <tr key={h.id} className="hover:bg-muted/50">
                      <td className="p-3 font-semibold">{h.name}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        <span className="font-semibold text-foreground">{h.city}</span> &bull; {h.address}
                      </td>
                      <td className="p-3 font-mono text-xs">{h.phone}</td>
                      <td className="p-3">
                        <Badge variant={h.hasEmergency ? "success" : "secondary"}>
                          {h.hasEmergency ? "Active 24/7" : "No Emergency"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-600">{h.availableBeds}</span>
                        <span className="text-muted-foreground"> / {h.totalBeds} total</span>
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
