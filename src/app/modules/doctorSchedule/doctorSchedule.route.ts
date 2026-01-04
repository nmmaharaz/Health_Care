import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import validationRequest from "../../middleware/validationRequest";
import { createDoctorScheduleValidationSchema } from "./doctorSchedule.validation";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = Router()

router.post("/", checkAuth(UserRole.DOCTOR), validationRequest(createDoctorScheduleValidationSchema), DoctorScheduleController.createDoctorSchedule)


export const DoctorScheduleRoute = router