"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput, registerDriverSchema, RegisterDriverInput } from "@/schemas";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ambulance, Loader2, User, Car, ShieldAlert } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"PATIENT" | "DRIVER">("PATIENT");
  const [loading, setLoading] = useState(false);

  // Patient Registration Form
  const {
    register: registerPatient,
    handleSubmit: handleSubmitPatient,
    setError: setErrorPatient,
    formState: { errors: errorsPatient },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+88017",
      password: "",
    },
  });

  // Driver Registration Form
  const {
    register: registerDriverForm,
    handleSubmit: handleSubmitDriver,
    setError: setErrorDriver,
    formState: { errors: errorsDriver },
  } = useForm<RegisterDriverInput>({
    resolver: zodResolver(registerDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+88018",
      password: "",
      licenseNumber: "DL-DHAKA-",
    },
  });

  // Patient Submit
  const onPatientSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.errorSources && Array.isArray(json.errorSources)) {
          json.errorSources.forEach((err: any) => {
            setErrorPatient(err.path as any, { message: err.message });
          });
        }
        throw new Error(json.message || "Registration failed");
      }

      toast.success("Patient account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to register patient account");
    } finally {
      setLoading(false);
    }
  };

  // Driver Submit
  const onDriverSubmit = async (data: RegisterDriverInput) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.errorSources && Array.isArray(json.errorSources)) {
          json.errorSources.forEach((err: any) => {
            setErrorDriver(err.path as any, { message: err.message });
          });
        }
        // If 401/403: backend requires Admin token to register drivers
        if (res.status === 401 || res.status === 403) {
          throw new Error("Driver registration requires Administrator verification or login. Sign in as Admin to onboard paramedic drivers, or contact dispatch.");
        }
        throw new Error(json.message || "Driver registration failed");
      }

      toast.success("Driver account successfully registered! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to register driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 bg-muted/20">
        <Card className="w-full max-w-md shadow-lg border-red-500/10">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-1">
              <Ambulance className="h-6 w-6" />
              <span>ResQ Dispatch</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Choose your role to join the emergency medical dispatch network.
            </CardDescription>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                variant={roleTab === "PATIENT" ? "emergency" : "outline"}
                size="sm"
                className="flex items-center justify-center gap-1.5"
                onClick={() => setRoleTab("PATIENT")}
              >
                <User className="h-4 w-4" />
                <span>Patient</span>
              </Button>
              <Button
                type="button"
                variant={roleTab === "DRIVER" ? "emergency" : "outline"}
                size="sm"
                className="flex items-center justify-center gap-1.5"
                onClick={() => setRoleTab("DRIVER")}
              >
                <Car className="h-4 w-4" />
                <span>Ambulance Driver</span>
              </Button>
            </div>
          </CardHeader>

          {roleTab === "PATIENT" ? (
            /* Patient Registration Form */
            <form onSubmit={handleSubmitPatient(onPatientSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="e.g. Rahim Uddin"
                    {...registerPatient("name")}
                  />
                  {errorsPatient.name && (
                    <p className="text-xs text-red-500">{errorsPatient.name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...registerPatient("email")}
                  />
                  {errorsPatient.email && (
                    <p className="text-xs text-red-500">{errorsPatient.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+8801711000000"
                    {...registerPatient("phone")}
                  />
                  {errorsPatient.phone && (
                    <p className="text-xs text-red-500">{errorsPatient.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    {...registerPatient("password")}
                  />
                  {errorsPatient.password && (
                    <p className="text-xs text-red-500">{errorsPatient.password.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Patient Account...
                    </>
                  ) : (
                    "Register as Patient"
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>

                <GoogleAuthButton text="signup_with" />

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-600 hover:underline font-medium">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            /* Driver Registration Form */
            <form onSubmit={handleSubmitDriver(onDriverSubmit)}>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Driver onboarding links with Dhaka paramedic licensing standards. Admin authorization activates roster availability.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Driver Full Name</label>
                  <Input
                    placeholder="e.g. Karim Paramedic"
                    {...registerDriverForm("name")}
                  />
                  {errorsDriver.name && (
                    <p className="text-xs text-red-500">{errorsDriver.name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Official Driver Email</label>
                  <Input
                    type="email"
                    placeholder="driver@ambulance.com"
                    {...registerDriverForm("email")}
                  />
                  {errorsDriver.email && (
                    <p className="text-xs text-red-500">{errorsDriver.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Emergency Contact Phone</label>
                  <Input
                    placeholder="+8801811000000"
                    {...registerDriverForm("phone")}
                  />
                  {errorsDriver.phone && (
                    <p className="text-xs text-red-500">{errorsDriver.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">BRTA Commercial Driving License No.</label>
                  <Input
                    placeholder="e.g. DL-DHAKA-2024-004"
                    {...registerDriverForm("licenseNumber")}
                  />
                  {errorsDriver.licenseNumber && (
                    <p className="text-xs text-red-500">{errorsDriver.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Secure Password</label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    {...registerDriverForm("password")}
                  />
                  {errorsDriver.password && (
                    <p className="text-xs text-red-500">{errorsDriver.password.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" variant="emergency" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering Paramedic Driver...
                    </>
                  ) : (
                    "Register as Ambulance Driver"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link href="/login" className="text-red-600 hover:underline font-medium">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
