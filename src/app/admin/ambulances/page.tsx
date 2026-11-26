"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ambulanceSchema, AmbulanceInput } from "@/schemas";
import { apiFetch } from "@/lib/api";
import { Ambulance, AmbulanceType, AmbulanceStatus, Driver } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Ambulance as AmbulanceIcon, Loader2, X, Edit, UserCheck, MapPin } from "lucide-react";

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Fetch ambulances
  const { data: ambData, isLoading } = useQuery({
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

  // Fetch drivers list to populate driver assignment dropdown
  const { data: driversData } = useQuery({
    queryKey: ["admin-drivers-list"],
    queryFn: () => apiFetch<Driver[]>("/drivers?limit=100"),
  });

  const ambulances = (ambData?.data as any) || [];
  const drivers: Driver[] = (driversData?.data as any) || [];

  // Create Form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<AmbulanceInput>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      plateNumber: "DHAKA-METRO-",
      type: "BASIC",
      baseFare: 1000,
      perKmRate: 40,
      lat: 23.7465,
      lng: 90.3748,
      driverId: null,
    },
  });

  // Edit Form state
  const [editType, setEditType] = useState<AmbulanceType>("BASIC");
  const [editStatus, setEditStatus] = useState<AmbulanceStatus>("AVAILABLE");
  const [editBaseFare, setEditBaseFare] = useState<number>(1000);
  const [editPerKmRate, setEditPerKmRate] = useState<number>(40);
  const [editLat, setEditLat] = useState<number>(23.7465);
  const [editLng, setEditLng] = useState<number>(90.3748);
  const [editDriverId, setEditDriverId] = useState<string>("");

  const openEditModal = (a: Ambulance) => {
    setEditingAmbulance(a);
    setEditType(a.type);
    setEditStatus(a.status);
    setEditBaseFare(a.baseFare);
    setEditPerKmRate(a.perKmRate);
    setEditLat((a as any).lat || 23.7465);
    setEditLng((a as any).lng || 90.3748);
    setEditDriverId(a.driver?.id || (a as any).driverId || "");
  };

  // Submit Create Ambulance
  const onAddSubmit = async (formData: AmbulanceInput) => {
    try {
      setSaving(true);
      const { driverId, ...createPayload } = formData;
      const res = await apiFetch<Ambulance>("/ambulances", {
        method: "POST",
        body: JSON.stringify(createPayload),
      });

      const newAmbulanceId = res.data?.id;

      // If a driver was selected during creation, assign via /:id/assign-driver
      if (newAmbulanceId && driverId) {
        try {
          await apiFetch(`/ambulances/${newAmbulanceId}/assign-driver`, {
            method: "PATCH",
            body: JSON.stringify({ driverId }),
          });
        } catch (assignErr: any) {
          toast.warning(`Ambulance created, but driver assignment failed: ${assignErr.message}`);
        }
      }

      toast.success("New ambulance successfully registered!");
      resetAdd();
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create ambulance");
    } finally {
      setSaving(false);
    }
  };

  // Submit Edit Ambulance
  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbulance) return;
    try {
      setSaving(true);
      // 1. Update ambulance details
      await apiFetch(`/ambulances/${editingAmbulance.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: editType,
          status: editStatus === "ON_TRIP" ? undefined : editStatus,
          baseFare: Number(editBaseFare),
          perKmRate: Number(editPerKmRate),
          lat: Number(editLat),
          lng: Number(editLng),
        }),
      });

      // 2. Assign or unassign driver if changed
      const currentDriverId = editingAmbulance.driver?.id || (editingAmbulance as any).driverId || "";
      const targetDriverId = editDriverId === "" ? null : editDriverId;

      if (targetDriverId !== (currentDriverId || null)) {
        await apiFetch(`/ambulances/${editingAmbulance.id}/assign-driver`, {
          method: "PATCH",
          body: JSON.stringify({ driverId: targetDriverId }),
        });
      }

      toast.success("Ambulance details updated successfully!");
      setEditingAmbulance(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update ambulance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambulance Fleet Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register new emergency vehicles, assign medical tiers, drivers, and coordinate GPS dispatch coordinates.
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
            <span>Filter Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs p-1.5 rounded border bg-background"
            >
              <option value="">All Types</option>
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
              className="text-xs h-8"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Add Ambulance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AmbulanceIcon className="h-5 w-5 text-red-600" />
                Register New Ambulance
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold">Plate Number</label>
                <Input
                  {...registerAdd("plateNumber")}
                  placeholder="e.g. DHAKA-METRO-CH-11-2005"
                  className="mt-1"
                />
                {errorsAdd.plateNumber && (
                  <p className="text-xs text-red-500 mt-0.5">{errorsAdd.plateNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Medical Tier</label>
                  <select
                    {...registerAdd("type")}
                    className="w-full mt-1 text-sm p-2 rounded-md border bg-background"
                  >
                    <option value="BASIC">BASIC (Standard)</option>
                    <option value="ADVANCED">ADVANCED (Life Support)</option>
                    <option value="ICU">ICU (Critical Care)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Assigned Driver</label>
                  <select
                    {...registerAdd("driverId")}
                    className="w-full mt-1 text-sm p-2 rounded-md border bg-background"
                  >
                    <option value="">-- Unassigned --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.name || "Driver"} ({d.licenseNumber}) {d.ambulance ? "• [Has Unit]" : "• [Available]"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Base Fare (৳)</label>
                  <Input
                    type="number"
                    {...registerAdd("baseFare", { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errorsAdd.baseFare && (
                    <p className="text-xs text-red-500 mt-0.5">{errorsAdd.baseFare.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold">Per KM Rate (৳)</label>
                  <Input
                    type="number"
                    {...registerAdd("perKmRate", { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errorsAdd.perKmRate && (
                    <p className="text-xs text-red-500 mt-0.5">{errorsAdd.perKmRate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Base Latitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    {...registerAdd("lat", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Base Longitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    {...registerAdd("lng", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="emergency" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ambulance Modal */}
      {editingAmbulance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Edit className="h-5 w-5 text-red-600" />
                  Edit Unit {editingAmbulance.plateNumber}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update operational status, medical tier, driver assignment, or standby GPS.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingAmbulance(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onEditSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Medical Tier</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AmbulanceType)}
                    className="w-full mt-1 text-sm p-2 rounded-md border bg-background"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold">Fleet Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AmbulanceStatus)}
                    className="w-full mt-1 text-sm p-2 rounded-md border bg-background"
                    disabled={editingAmbulance.status === "ON_TRIP"}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    {editingAmbulance.status === "ON_TRIP" && (
                      <option value="ON_TRIP">ON_TRIP (Active Emergency)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Assigned Driver</label>
                <select
                  value={editDriverId}
                  onChange={(e) => setEditDriverId(e.target.value)}
                  className="w-full mt-1 text-sm p-2 rounded-md border bg-background"
                >
                  <option value="">-- Unassigned --</option>
                  {drivers.map((d) => {
                    const isCurrent = (editingAmbulance.driver?.id || (editingAmbulance as any).driverId) === d.id;
                    const isOtherAssigned = d.ambulance && d.ambulance.id !== editingAmbulance.id;
                    return (
                      <option key={d.id} value={d.id}>
                        {d.user?.name || "Driver"} ({d.licenseNumber}) {isCurrent ? "★ [Current]" : isOtherAssigned ? `• [${d.ambulance?.plateNumber}]` : "• [Available]"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Base Fare (৳)</label>
                  <Input
                    type="number"
                    value={editBaseFare}
                    onChange={(e) => setEditBaseFare(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Per KM Rate (৳)</label>
                  <Input
                    type="number"
                    value={editPerKmRate}
                    onChange={(e) => setEditPerKmRate(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Standby Latitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editLat}
                    onChange={(e) => setEditLat(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Standby Longitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editLng}
                    onChange={(e) => setEditLng(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAmbulance(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="emergency" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
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
                    <th className="p-3 text-right">Action</th>
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
                        {a.driver?.user?.name ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{a.driver.user.name}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground italic font-normal">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(a)}
                          className="h-8 text-xs"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
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
