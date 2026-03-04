import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";

const router = Router()

router.get(
    '/',
    checkAuth(UserRole.ADMIN),
    AppointmentController.getAllFromDB
);

router.get("/my-appointment", checkAuth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.getMyAppointment)

router.post("/", checkAuth(UserRole.PATIENT), AppointmentController.createAppointment)

router.post(
    '/pay-later',
    checkAuth(UserRole.PATIENT),
    // validationRequest(AppointmentValidation.createAppointment),
    AppointmentController.createAppointmentWithPayLater
);

router.patch(
    "/status/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.updateAppointmentStatus
)

export const AppointmentRoute = router