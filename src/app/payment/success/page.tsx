"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Receipt, LayoutDashboard } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") || searchParams.get("tranId");
  const amount = searchParams.get("amount");

  return (
    <Card className="max-w-md w-full text-center border-emerald-500/30 shadow-xl">
      <CardHeader>
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl mt-4 text-emerald-700 dark:text-emerald-400 font-extrabold">
          Payment Successful!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your emergency ambulance fare has been verified and settled via SSLCommerz payment gateway.
        </p>

        {tranId && (
          <div className="bg-muted p-3 rounded-lg text-xs font-mono space-y-1">
            <div className="text-muted-foreground uppercase text-[10px]">Official Settlement ID</div>
            <div className="font-bold text-foreground">{tranId}</div>
            {amount && <div className="text-emerald-600 font-bold">Amount: ৳{amount}</div>}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/patient/payments">
              <Receipt className="mr-2 h-4 w-4" />
              View Receipt & Invoices
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patient">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Patient Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading payment confirmation...</div>}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
