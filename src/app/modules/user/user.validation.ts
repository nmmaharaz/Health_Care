import z from "zod"
import { Gender } from "../../../generated/prisma/enums"

export const createPatientZodSchema = z.object({
    password: z.string({ message: "Email is required" }),
    patient: z.object(
        {
            email: z.email({ message: "Email is required" }),
            name: z.string().nonempty("Name is required"),
            // profilePhoto: z.string().optional(),
            address: z.string().optional()
        }
    )
})

export const createDoctorZodSchema = z.object({
    password: z.string({
        error: "Password is required",
    }),
    doctor: z.object({
        name: z.string({
            error: "Name is required!",
        }),
        email: z.string({
            error: "Email is required!",
        }),
        contactNumber: z.string({
            error: "Contact Number is required!",
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
            error: "Reg number is required",
        }),
        experience: z.number().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),
        appointmentFee: z.number({
            error: "Appointment fee is required",
        }),
        qualification: z.string({
            error: "Qualification is required",
        }),
        currentWorkingPlace: z.string({
            error: "Current working place is required!",
        }),
        designation: z.string({
            error: "Designation is required!",
        }),
        specialties: z
            .array(
                z.string().uuid({
                    message: "Each specialty must be a valid UUID",
                })
            )
            .min(1, {
                message: "At least one specialty is required",
            })
            .optional(),
    }),
});

export const createAdminZodSchema = z.object({
    password: z.string({ message: "Email is required" }),
    admin: z.object(
        {
            name: z.string().nonempty("Name is required"),
            email: z.string().nonempty("Name is required"),
            contactNumber: z.string().nonempty("Name is required"),
        }
    )
})