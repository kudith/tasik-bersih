import { z } from "zod"

export const donationSchema = z.object({
    fullName: z.string()
        .max(100, "Full name should be less than 100 characters")
        .optional(), // Make fullName optional

    phoneNumber: z.string()
        .regex(/^[0-9]+$/, "Phone number must contain only numbers")
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits"),

    email: z.string()
        .email("Please enter a valid email address"),

    donationAmount: z.number()
        .min(10000, "Minimum donation is IDR 10,000"),

    isAnonymous: z.boolean().default(false), // Default value for isAnonymous
}).refine(data => {
    // Custom validation: if isAnonymous is false, fullName must be present
    if (!data.isAnonymous && (!data.fullName || data.fullName.trim() === "")) {
        return false; // Validation fails if fullName is not provided
    }
    return true; // Validation passes
}, {
    message: "Full name is required unless donating anonymously",
    path: ["fullName"], // Set the error path to fullName
})
