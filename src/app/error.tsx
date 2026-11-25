"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        {error.message || "An unexpected error occurred while communicating with the emergency dispatch server."}
      </p>
      <Button onClick={() => reset()} className="mt-6" variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
