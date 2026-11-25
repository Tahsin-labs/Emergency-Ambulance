"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 border rounded-xl bg-card text-center space-y-4">
      <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
      <h3 className="text-xl font-bold">Failed to load patient portal data</h3>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()} variant="outline">Reload Portal</Button>
    </div>
  );
}
