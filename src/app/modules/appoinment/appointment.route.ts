import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";

const router = Router()

router.get("/get-appointments", checkAuth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.getMyAppointment)

router.post("/", checkAuth(UserRole.PATIENT), AppointmentController.createAppointment)

router.patch(
    "/status/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.updateAppointmentStatus
)

export const AppointmentRoute = router