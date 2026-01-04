import z from "zod";

export const createDoctorScheduleValidationSchema = z.object({
        scheduleIds: z.array(z.string())
})
