"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  callbackUrl?: string | null;
  text?: "signin_with" | "signup_with" | "continue_with";
}

declare global {
  interface Window {
    google?: any;
    handleGoogleCredentialResponse?: (response: any) => void;
  }
}

export function GoogleAuthButton({ callbackUrl, text = "continue_with" }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { setUser, setRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "624668938027-63uvemp7u26voo5v4e71v6iooe8r2s9l.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      toast.error("No credentials received from Google");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Google sign in failed");
      }

      setUser(json.data.user);
      setRole(json.data.user.role);
      toast.success(`Welcome, ${json.data.user.name}!`);

      const role = json.data.user.role;
      let targetPath = "/patient";
      if (role === "ADMIN") targetPath = "/admin";
      else if (role === "DRIVER") targetPath = "/driver";

      if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        if (
          (callbackUrl.startsWith("/admin") && role !== "ADMIN") ||
          (callbackUrl.startsWith("/driver") && role !== "DRIVER") ||
          (callbackUrl.startsWith("/patient") && role !== "PATIENT")
        ) {
          // Keep default role dashboard
        } else {
          targetPath = callbackUrl;
        }
      }

      router.replace(targetPath);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scriptLoaded && window.google?.accounts?.id && buttonContainerRef.current) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
      });

      buttonContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text,
        shape: "rectangular",
        logo_alignment: "center",
        width: buttonContainerRef.current.clientWidth || 320,
      });
    }
  }, [scriptLoaded, text, googleClientId]);

  return (
    <div className="w-full flex flex-col items-center">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          <span>Authenticating with Google...</span>
        </div>
      )}

      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center min-h-[44px] ${loading ? "opacity-50 pointer-events-none" : ""}`}
      />
    </div>
  );
}
