import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { DoctorController } from "./doctor.controller";

const router = Router()

router.get("/", checkAuth(UserRole.DOCTOR), DoctorController.getAllDoctor)

router.post("/suggestion", DoctorController.getAISuggestions);

router.patch("/:id", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), DoctorController.updateDoctorProfile)


export const DoctorRoute = router