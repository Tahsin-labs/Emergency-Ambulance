import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Please enter a valid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" }).email("Please enter a valid email address"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Enter valid Bangladesh phone number (e.g. +8801711000000 or 01711000000)"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const registerDriverSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" }).email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Enter valid Bangladesh phone number (e.g. +8801711000000 or 01711000000)")
    .optional(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  licenseNumber: z
    .string({ required_error: "License number is required" })
    .min(3, "License number must be at least 3 characters"),
});

export type RegisterDriverInput = z.infer<typeof registerDriverSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Enter valid Bangladesh phone number")
    .optional(),
});

export const emergencyRequestSchema = z.object({
  emergencyType: z.enum([
    "CARDIAC",
    "ACCIDENT",
    "STROKE",
    "BREATHING",
    "PREGNANCY",
    "BLEEDING",
    "BURN",
    "FRACTURE",
    "FEVER",
    "SEIZURE",
    "UNCONSCIOUS",
    "OTHER",
  ]),
  description: z.string().min(5, "Please describe the symptoms in at least 5 characters"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
});

export const driverAvailabilitySchema = z.object({
  isOnDuty: z.boolean({ required_error: "isOnDuty is required" }),
});

export const driverLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const ambulanceSchema = z.object({
  plateNumber: z.string().min(3, "Plate number is required"),
  type: z.enum(["BASIC", "ADVANCED", "ICU"]),
  baseFare: z.coerce.number().positive("Base fare must be a positive number").default(500),
  perKmRate: z.coerce.number().positive("Per km rate must be a positive number").default(30),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  driverId: z.string().uuid("Invalid driver ID").nullable().optional(),
});

export const ambulanceUpdateSchema = z.object({
  type: z.enum(["BASIC", "ADVANCED", "ICU"]).optional(),
  baseFare: z.coerce.number().positive().optional(),
  perKmRate: z.coerce.number().positive().optional(),
  status: z.enum(["AVAILABLE", "OFFLINE", "MAINTENANCE"]).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  driverId: z.string().uuid().nullable().optional(),
});


export const hospitalSchema = z
  .object({
    name: z.string({ required_error: "Hospital name is required" }).min(2, "Name must be at least 2 characters"),
    address: z.string({ required_error: "Address is required" }).min(3, "Address must be at least 3 characters"),
    city: z.string({ required_error: "City is required" }).min(2, "City must be at least 2 characters"),
    lat: z.coerce.number({ required_error: "Latitude is required" }).min(-90).max(90),
    lng: z.coerce.number({ required_error: "Longitude is required" }).min(-180).max(180),
    phone: z.string({ required_error: "Phone number is required" }).min(5, "Valid phone number is required"),
    specialties: z.array(z.string()).min(1, "At least one specialty is required"),
    totalBeds: z.coerce.number().int().positive("Total beds must be a positive integer"),
    availableBeds: z.coerce.number().int().min(0, "Available beds cannot be negative"),
    hasEmergency: z.coerce.boolean().default(true),
  })
  .refine((data) => data.availableBeds <= data.totalBeds, {
    message: "Available beds cannot exceed total beds",
    path: ["availableBeds"],
  });

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  comment: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type EmergencyRequestInput = z.infer<typeof emergencyRequestSchema>;
export type AmbulanceInput = z.infer<typeof ambulanceSchema>;
export type AmbulanceUpdateInput = z.infer<typeof ambulanceUpdateSchema>;
export type HospitalInput = z.infer<typeof hospitalSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
