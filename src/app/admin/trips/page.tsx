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
import { RefreshCw, Search, Navigation } from "lucide-react";

export default function AdminTripsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-trips", statusFilter],
    queryFn: () => {
      let endpoint = "/trips";
      if (statusFilter) endpoint += `?status=${statusFilter}`;
      return apiFetch<{ trips: Trip[] }>(endpoint);
    },
  });

  const allTrips = (data?.data as any) || [];
  const trips = allTrips.filter((t: Trip) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.request?.emergencyType?.toLowerCase().includes(term) ||
      t.patient?.name?.toLowerCase().includes(term) ||
      t.driver?.user?.name?.toLowerCase().includes(term) ||
      t.ambulance?.plateNumber?.toLowerCase().includes(term) ||
      t.request?.pickupAddress?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trips & Dispatch Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor all active and completed emergency ambulance runs across Dhaka.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, driver, plate..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded border bg-background"
            >
              <option value="">All Statuses</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="EN_ROUTE">EN_ROUTE</option>
              <option value="ARRIVED_AT_PICKUP">ARRIVED_AT_PICKUP</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="EN_ROUTE_TO_HOSPITAL">EN_ROUTE_TO_HOSPITAL</option>
              <option value="ARRIVED_AT_HOSPITAL">ARRIVED_AT_HOSPITAL</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    <th className="p-3">ID</th>
                    <th className="p-3">Emergency / Priority</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Ambulance</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trips.map((t: Trip) => (
                    <tr key={t.id} className="hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{t.id.slice(0, 8)}</td>
                      <td className="p-3">
                        <div className="font-semibold">{t.request?.emergencyType}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {t.request?.requiredType} unit
                        </div>
                      </td>
                      <td className="p-3 font-medium">{t.patient?.name || "Patient"}</td>
                      <td className="p-3">{t.driver?.user?.name || "Driver"}</td>
                      <td className="p-3 font-mono text-xs">{t.ambulance?.plateNumber}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {t.hospital?.name || "Pending triage"}
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
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">{t.fare ? `৳${t.fare}` : "—"}</td>
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
