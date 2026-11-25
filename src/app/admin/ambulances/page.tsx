"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ambulanceSchema, AmbulanceInput } from "@/schemas";
import { apiFetch } from "@/lib/api";
import { Ambulance, AmbulanceType } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Ambulance as AmbulanceIcon, Loader2, X, RefreshCw } from "lucide-react";

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ambulances", statusFilter, typeFilter],
    queryFn: () => {
      let query = "/ambulances";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (params.toString()) query += `?${params.toString()}`;
      return apiFetch<Ambulance[]>(query);
    },
  });

  const ambulances = (data?.data as any) || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AmbulanceInput>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      plateNumber: "DHAKA-METRO-",
      type: "BASIC",
      baseFare: 1000,
      perKmRate: 40,
    },
  });

  const onSubmit = async (formData: AmbulanceInput) => {
    try {
      setCreating(true);
      await apiFetch("/ambulances", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("New ambulance successfully registered!");
      reset();
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create ambulance");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambulance Fleet Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register new emergency vehicles, assign medical tiers, and inspect active driver rosters.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="emergency">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Ambulance
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded border bg-background"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_TRIP">ON_TRIP</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Filter Tier:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs p-1.5 rounded border bg-background"
            >
              <option value="">All Tiers</option>
              <option value="BASIC">BASIC</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="ICU">ICU</option>
            </select>
          </div>

          {(statusFilter || typeFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setTypeFilter("");
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Add Ambulance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Register New Ambulance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plate Number</label>
                  <Input {...register("plateNumber")} />
                  {errors.plateNumber && (
                    <p className="text-xs text-red-500">{errors.plateNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Medical Tier</label>
                  <select
                    {...register("type")}
                    className="w-full text-sm p-2 rounded-md border bg-background"
                  >
                    <option value="BASIC">BASIC (BLS)</option>
                    <option value="ADVANCED">ADVANCED (ALS)</option>
                    <option value="ICU">ICU (Mobile ICU)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base Fare (৳)</label>
                    <Input
                      type="number"
                      {...register("baseFare", { valueAsNumber: true })}
                    />
                    {errors.baseFare && (
                      <p className="text-xs text-red-500">{errors.baseFare.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Per Km Rate (৳)</label>
                    <Input
                      type="number"
                      {...register("perKmRate", { valueAsNumber: true })}
                    />
                    {errors.perKmRate && (
                      <p className="text-xs text-red-500">{errors.perKmRate.message}</p>
                    )}
                  </div>
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
                <Button type="submit" variant="emergency" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Create Ambulance"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Ambulances Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : ambulances.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <AmbulanceIcon className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No ambulances found</h3>
            <p className="text-xs text-muted-foreground">Adjust filters or register a new unit.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Plate Number</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Base Fare</th>
                    <th className="p-3">Per Km Rate</th>
                    <th className="p-3">Assigned Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ambulances.map((a: Ambulance) => (
                    <tr key={a.id} className="hover:bg-muted/50">
                      <td className="p-3 font-bold font-mono">{a.plateNumber}</td>
                      <td className="p-3"><Badge variant="outline">{a.type}</Badge></td>
                      <td className="p-3">
                        <Badge
                          variant={
                            a.status === "AVAILABLE"
                              ? "success"
                              : a.status === "ON_TRIP"
                              ? "critical"
                              : "secondary"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="p-3">৳{a.baseFare}</td>
                      <td className="p-3">৳{a.perKmRate}</td>
                      <td className="p-3 font-medium">
                        {a.driver?.user?.name || (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
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
