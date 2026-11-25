"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Trip } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ambulance, Calendar, MapPin, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function DriverHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["driver-history"],
    queryFn: () => apiFetch<{ trips: Trip[] }>("/drivers/me/trips"),
  });

  const trips = (data?.data as any) || [];
  const completedTrips = trips.filter((t: Trip) => t.status === "COMPLETED");
  const totalEarnings = completedTrips.reduce((acc: number, t: Trip) => acc + (t.fare || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Driver History & Performance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review all emergency dispatches and calculated gross trip fares.
        </p>
      </div>

      {/* Driver Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex justify-between">
              <span>Completed Runs</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <div className="text-[10px] text-muted-foreground">Successful patient transfers</div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex justify-between">
              <span>Total Trip Fares</span>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">৳{totalEarnings.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Calculated across all runs</div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex justify-between">
              <span>Average Fare</span>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              ৳{completedTrips.length > 0 ? Math.round(totalEarnings / completedTrips.length) : 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Per completed emergency</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : trips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Ambulance className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="font-semibold">No historical trips found</h3>
            <p className="text-xs text-muted-foreground">
              Completed emergency assignments will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trips.map((trip: Trip) => (
            <Card key={trip.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={trip.status === "COMPLETED" ? "success" : "destructive"}>
                      {trip.status}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {trip.request?.emergencyType} Emergency
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {trip.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pickup: {trip.request?.pickupAddress}
                  </div>
                  {trip.hospital && (
                    <div className="text-xs text-muted-foreground">
                      Delivered to: <span className="font-medium text-foreground">{trip.hospital.name}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-base text-foreground">
                    {trip.fare ? `৳${trip.fare}` : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
