import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import validationRequest from "../../middleware/validationRequest";
import { createDoctorScheduleValidationSchema } from "./doctorSchedule.validation";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../utils/jwt/checkAuth";

const router = Router()

router.get(
    '/',
    checkAuth(...Object.values(UserRole)),
    DoctorScheduleController.getAllFromDB
);

router.get(
    '/my-schedule',
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedule
)

router.post("/", checkAuth(UserRole.DOCTOR), validationRequest(createDoctorScheduleValidationSchema), DoctorScheduleController.createDoctorSchedule)

router.delete(
    '/:id',
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.deleteFromDB
);

export const DoctorScheduleRoute = router