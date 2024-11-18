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
    return !(!data.isAnonymous && (!data.fullName || data.fullName.trim() === ""));
     // Validation passes
}, {
    message: "Full name is required unless donating anonymously",
    path: ["fullName"], // Set the error path to fullName
})


export const volunteerSchema = z.object({
    fullName: z.string().optional(),
    groupName: z.string().nullable().optional(),
    groupSize: z.preprocess((val) => val === "" ? null : Number(val), z.number().min(2, "Group Size must be at least 2 person").nullable().optional()),
    address: z.string().nonempty("Address is required"),
    phoneNumber: z.string()
        .regex(/^[0-9]+$/, "Phone number must contain only numbers")
        .nonempty("Phone Number is required"),
    email: z.string().email("Invalid email address"),
    motivation: z.string().nonempty("Motivation is required"),
    event: z.string().nonempty("Event selection is required"),
}).refine((data) => {
    if (data.registrationType === "individual") {
        return !!data.fullName && !data.groupName && !data.groupSize;
    } else if (data.registrationType === "group") {
        return !!data.groupName && data.groupSize > 0 && !data.fullName;
    }
    return true;
});



export const reportSchema = z.object({
    fullName: z.string().nonempty("Full name is required"),
    phoneNumber: z.string()
        .regex(/^[0-9]+$/, "Phone number must contain only numbers")
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits"),
    email: z.string().email("Please enter a valid email address"),
    reportDestinationAddress: z.string().nonempty("Report destination address is required"),
    reportDestinationName: z.string().nonempty("Report destination name is required"),
    reportActualDate: z.string().nonempty("Report actual date is required"),
    description: z.string().nonempty("Description is required"),
    images: z.array(z.any()).min(1, "At least one image is required"),
});