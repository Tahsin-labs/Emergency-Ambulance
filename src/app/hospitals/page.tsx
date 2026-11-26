"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Hospital } from "@/types";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Hospital as HospitalIcon, Phone, MapPin, Search } from "lucide-react";

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => apiFetch<Hospital[]>("/hospitals"),
  });

  const allHospitals = (data?.data as any) || [];
  const hospitals = allHospitals.filter((h: Hospital) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase());
    const matchesEmergency = !emergencyOnly || h.hasEmergency;
    return matchesSearch && matchesEmergency;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <Badge variant="outline" className="mb-2">Hospital Network</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">Partner Hospitals & Bed Availability</h1>
          <p className="text-muted-foreground mt-3">
            Real-time tracking of 24/7 emergency rooms and available bed capacity across partner healthcare facilities.
          </p>
        </div>

        {/* Filter controls */}
        <div className="max-w-xl mx-auto mb-10 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hospital name, city, or address..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`whitespace-nowrap px-4 py-2 rounded-md border text-sm font-semibold transition ${
              emergencyOnly
                ? "bg-red-600 text-white border-red-600"
                : "bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            Emergency Active Only
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No matching hospitals found with the selected criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((h: Hospital) => (
              <Card key={h.id} className="shadow-sm hover:shadow transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={h.hasEmergency ? "success" : "secondary"}>
                      {h.hasEmergency ? "24/7 Emergency Unit" : "Standard Care"}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{h.city}</span>
                  </div>
                  <CardTitle className="text-xl mt-2 flex items-center gap-2">
                    <HospitalIcon className="h-5 w-5 text-red-600" />
                    {h.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                    <span>{h.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{h.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <div className="bg-muted/40 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Total Beds</div>
                      <div className="font-bold text-base text-foreground">
                        {h.totalBeds}
                      </div>
                    </div>
                    <div className="bg-muted/40 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Available Beds</div>
                      <div className="font-bold text-base text-emerald-600">
                        {h.availableBeds}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
