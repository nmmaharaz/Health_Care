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
    password: z.string({ message: "Email is required" }),
    doctor: z.object(
        {
            email: z.email({ message: "Email is required" }),
            name: z.string().nonempty("Name is required"),
            // profilePhoto: z.string().optional(),
            address: z.string(),
            contactNumber: z.string(),
            registrationNumber: z.string(),
            experience: z.number(),
            gender: z.enum(Object.values(Gender)).default("MALE"),
            appointmentFee: z.number(),
            qualification: z.string(),
            currentWorkingPlace: z.string(),
            designation: z.string(),

        }
    )
})

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