"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Trip } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Printer } from "lucide-react";

export default function PatientPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-requests"],
    queryFn: () => apiFetch<any[]>("/emergency-requests/my"),
  });

  const requests = (data?.data as any) || [];
  const trips: Trip[] = requests
    .filter((r: any) => r.trip)
    .map((r: any) => ({
      ...r.trip,
      request: r,
    }));

  const paidTrips = trips.filter((t: Trip) => t.payment && t.payment.status === "PAID");

  const printReceipt = (trip: Trip) => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History & Tax Invoices</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review digital settlement receipts for completed ambulance trips processed through SSLCommerz.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : paidTrips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No settled payments yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Completed trips with payments settled via SSLCommerz will generate receipts here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paidTrips.map((trip: Trip) => (
            <Card key={trip.id} className="border-emerald-500/30">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">PAID</Badge>
                    <span className="font-semibold text-sm">
                      {trip.request?.emergencyType} Emergency Run
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      TranID: {trip.payment?.tranId}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Pickup: {trip.request?.pickupAddress}</div>
                    {trip.hospital && <div>Destination: {trip.hospital.name}</div>}
                    <div>
                      Ambulance: {trip.ambulance?.plateNumber} ({trip.ambulance?.type})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-foreground">
                      ৳{trip.payment?.amount || trip.fare}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Settled on {new Date(trip.payment?.paidAt || trip.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printReceipt(trip)}
                  >
                    <Printer className="h-4 w-4 mr-1.5" />
                    Print Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
