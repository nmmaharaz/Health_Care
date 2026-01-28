import z from "zod";

export const createSpecialtiesZodSchema = z.object({
    title: z.string()
})