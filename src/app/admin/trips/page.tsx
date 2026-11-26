"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Trip } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search, Navigation, Eye, X, MapPin, Phone, Hospital, User, Ambulance as AmbIcon } from "lucide-react";

export default function AdminTripsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-trips", statusFilter, priorityFilter],
    queryFn: () => {
      let endpoint = "/trips";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (params.toString()) endpoint += `?${params.toString()}`;
      return apiFetch<{ trips: Trip[] }>(endpoint);
    },
  });

  const allTrips = (data?.data as any) || [];
  const trips = allTrips.filter((t: Trip) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.request?.emergencyType?.toLowerCase().includes(term) ||
      t.request?.priority?.toLowerCase().includes(term) ||
      t.patient?.name?.toLowerCase().includes(term) ||
      t.driver?.user?.name?.toLowerCase().includes(term) ||
      t.ambulance?.plateNumber?.toLowerCase().includes(term) ||
      t.ambulance?.type?.toLowerCase().includes(term) ||
      t.request?.pickupAddress?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trips & Dispatch Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor all active and completed emergency ambulance runs, assigned drivers, priorities, and hospital transports.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, driver, plate, type..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs p-1.5 rounded border bg-background"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-1.5 rounded border bg-background"
              >
                <option value="">All Statuses</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="EN_ROUTE">EN_ROUTE</option>
                <option value="ARRIVED_AT_PICKUP">ARRIVED_AT_PICKUP</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="EN_ROUTE_TO_HOSPITAL">EN_ROUTE_TO_HOSPITAL</option>
                <option value="ARRIVED_AT_HOSPITAL">ARRIVED_AT_HOSPITAL</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trips Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : trips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Navigation className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No trips found</h3>
            <p className="text-xs text-muted-foreground">Try clearing search filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Trip ID</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Emergency Type</th>
                    <th className="p-3">Ambulance (Plate / Tier)</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Fare</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trips.map((t: Trip) => (
                    <tr key={t.id} className="hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs font-bold">{t.id.slice(0, 8)}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            t.request?.priority === "CRITICAL"
                              ? "critical"
                              : t.request?.priority === "HIGH"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {t.request?.priority || "NORMAL"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{t.request?.emergencyType}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[150px]">
                          {t.request?.pickupAddress}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-xs font-semibold">{t.ambulance?.plateNumber || "—"}</div>
                        <Badge variant="outline" className="text-[10px] mt-0.5">
                          {t.ambulance?.type || "Standard"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-sm">
                          {t.driver?.user?.name || (t.ambulance?.driver as any)?.user?.name || (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {t.driver?.user?.phone || (t.ambulance?.driver as any)?.user?.phone || ""}
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        <div>{t.patient?.name || t.request?.patientName || "Patient"}</div>
                        <div className="text-[10px] text-muted-foreground">{t.patient?.phone || t.request?.patientPhone || ""}</div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            t.status === "COMPLETED"
                              ? "success"
                              : t.status === "CANCELLED"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {t.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">{t.fare ? `৳${t.fare}` : "—"}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTrip(t)}
                          className="h-8 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
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

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-red-600" />
                  Trip #{selectedTrip.id.slice(0, 8)} Incident Report
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Status: {selectedTrip.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant={selectedTrip.request?.priority === "CRITICAL" ? "critical" : "warning"} className="text-xs">
                    Priority: {selectedTrip.request?.priority}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTrip(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Emergency Request Details */}
              <div className="p-3 bg-muted/40 rounded-lg space-y-2 border">
                <div className="text-xs font-bold text-muted-foreground uppercase">Emergency Description</div>
                <div className="font-semibold text-base text-red-600">{selectedTrip.request?.emergencyType} Emergency</div>
                <div className="text-xs text-muted-foreground">{selectedTrip.request?.description}</div>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{selectedTrip.request?.pickupAddress}</span>
                </div>
              </div>

              {/* Units & Paramedics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <AmbIcon className="h-3.5 w-3.5" /> Ambulance Unit
                  </div>
                  <div className="font-mono font-bold">{selectedTrip.ambulance?.plateNumber || "—"}</div>
                  <div className="text-xs text-muted-foreground">Tier: {selectedTrip.ambulance?.type}</div>
                  <div className="text-xs text-muted-foreground">Base: ৳{selectedTrip.ambulance?.baseFare}</div>
                </div>

                <div className="p-3 border rounded-lg space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Assigned Paramedic
                  </div>
                  <div className="font-semibold">
                    {selectedTrip.driver?.user?.name || (selectedTrip.ambulance?.driver as any)?.user?.name || "Unassigned"}
                  </div>
                  <div className="text-xs text-red-600 font-bold">
                    {selectedTrip.driver?.user?.phone || (selectedTrip.ambulance?.driver as any)?.user?.phone || "—"}
                  </div>
                </div>
              </div>

              {/* Destination Hospital & Financials */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Hospital className="h-3.5 w-3.5" /> Destination Hospital
                  </div>
                  <div className="font-semibold text-xs">{selectedTrip.hospital?.name || "Pending Selection"}</div>
                  <div className="text-[11px] text-muted-foreground">{selectedTrip.hospital?.address || "—"}</div>
                </div>

                <div className="p-3 border rounded-lg space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Trip Financials</div>
                  <div className="text-xl font-extrabold text-foreground">৳{selectedTrip.fare || 0}</div>
                  <div className="text-xs text-muted-foreground">
                    Distance: {selectedTrip.distanceKm ? `${Number(selectedTrip.distanceKm).toFixed(2)} km` : "Flat base"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedTrip(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
