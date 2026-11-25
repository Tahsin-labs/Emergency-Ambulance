import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ambulance, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <Ambulance className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The emergency portal route you are looking for does not exist or has been relocated.
      </p>
      <Button asChild className="mt-6" variant="emergency">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Safety (Home)
        </Link>
      </Button>
    </div>
  );
}
