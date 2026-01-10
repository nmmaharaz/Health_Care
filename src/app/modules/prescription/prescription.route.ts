import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { PrescriptionController } from "./prescription.controller";

const router = Router()

router.post("/", checkAuth(UserRole.DOCTOR), PrescriptionController.createPrescription)

router.get(
    '/my-prescription',
    checkAuth(UserRole.PATIENT),
    PrescriptionController.patientPrescription
)

export const PrescriptionRoute = router