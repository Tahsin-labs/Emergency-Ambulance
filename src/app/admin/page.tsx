"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DynamicBarChart, DynamicPieChart } from "@/components/charts/AdminCharts";
import {
  Users,
  Ambulance,
  CreditCard,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => apiFetch<any>("/admin/dashboard-stats"),
  });

  const raw = data?.data;

  const totalRevenue = Number(raw?.revenue?.totalPaid || 0);
  const activeTrips = Number(raw?.trips?.activeNow || 0);
  const totalAmbulances = Number(raw?.ambulances?.total || 0);
  const totalUsers = Number(raw?.users?.total || 0);

  const priorityMap = raw?.requests?.byPriority || {};
  const priorityData = [
    { name: "CRITICAL", value: priorityMap["CRITICAL"] || 0, color: "#DC2626" },
    { name: "HIGH", value: priorityMap["HIGH"] || 0, color: "#F59E0B" },
    { name: "MEDIUM", value: priorityMap["MEDIUM"] || 0, color: "#0284C7" },
    { name: "LOW", value: priorityMap["LOW"] || 0, color: "#16A34A" },
  ];

  const revenueMonthly = [
    { month: "Pending", revenue: Number(raw?.revenue?.pendingAmount || 0) },
    { month: "Paid (Settled)", revenue: totalRevenue },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Governance & Dispatch Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time oversight over ambulance fleet, emergency requests, driver availability, and revenue settlement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span>Total Revenue</span>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold">৳{totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">SSLCommerz settled</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span>Active Dispatches</span>
              <Activity className="h-4 w-4 text-red-600 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-red-600">{activeTrips}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Live ambulances on road</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span>Ambulance Fleet</span>
              <Ambulance className="h-4 w-4 text-sky-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold">{totalAmbulances}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Basic, ALS & ICU units</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
              <span>Registered Users</span>
              <Users className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold">{totalUsers}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Patients & Drivers</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts (Dynamically Loaded) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue Trend (BDT)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <DynamicBarChart data={revenueMonthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trips by Clinical Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <DynamicPieChart data={priorityData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
