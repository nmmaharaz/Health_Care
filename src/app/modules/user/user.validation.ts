import z from "zod"

export const createPatientZodSchema = z.object({
    password: z.string({ message: "Email is required" }),
    patient: z.object(
        {
            email: z.email({message:"Email is required"}),
            name: z.string().nonempty("Name is required"),
            // profilePhoto: z.string().optional(),
            address: z.string().optional()
        }
    )

})