"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Payment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Printer, CheckCircle } from "lucide-react";

export default function PatientPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-payments-my"],
    queryFn: () => apiFetch<Payment[]>("/payments/my?limit=50"),
  });

  const payments: Payment[] = (data?.data as any) || [];

  const printReceipt = (p: Payment) => {
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
      ) : payments.length === 0 ? (
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
          {payments.map((p: Payment) => (
            <Card key={p.id} className="border-emerald-500/30">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "PAID" ? "success" : "destructive"}>
                      {p.status}
                    </Badge>
                    <span className="font-semibold text-sm">
                      Invoice #{p.tranId}
                    </span>
                    {p.valId && (
                      <span className="text-xs font-mono text-muted-foreground">
                        Val: {p.valId.slice(0, 10)}...
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Trip Reference: {p.tripId ? `#${p.tripId.slice(0, 8)}` : "—"}</div>
                    {p.trip && (
                      <div>
                        Status: {p.trip.status} • Distance: {p.trip.distanceKm ? `${Number(p.trip.distanceKm).toFixed(2)} km` : "Standard flat fare"}
                      </div>
                    )}
                    <div>
                      Settled on: {p.paidAt ? new Date(p.paidAt).toLocaleString() : new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-foreground">
                      ৳{p.amount}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {p.currency} • SSLCommerz
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printReceipt(p)}
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
