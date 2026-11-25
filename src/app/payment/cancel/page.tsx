"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") || searchParams.get("tranId");

  return (
    <Card className="max-w-md w-full text-center border-amber-500/30">
      <CardHeader>
        <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl mt-4 text-amber-700 dark:text-amber-400">
          Payment Cancelled
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You cancelled the checkout session on SSLCommerz. Your fare remains outstanding.
        </p>
        {tranId && (
          <div className="bg-muted p-3 rounded-lg text-xs font-mono">
            Ref: {tranId}
          </div>
        )}
        <div className="pt-2 flex justify-center gap-3">
          <Button asChild>
            <Link href="/patient/trips">
              Return to Trips <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <PaymentCancelContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
