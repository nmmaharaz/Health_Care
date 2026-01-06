import z, { string } from "zod";

export const createSpecialtiesZodSchema = z.object({
    title: z.string()
})