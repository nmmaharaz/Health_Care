import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { DoctorController } from "./doctor.controller";

const router = Router()

router.get("/", DoctorController.getAllDoctor)

router.get("/:id", DoctorController.getSingleDoctor)

router.post("/suggestion", DoctorController.getAISuggestions);

router.patch("/:id", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), DoctorController.updateDoctorProfile)

router.delete("/:id", checkAuth(UserRole.ADMIN), DoctorController.deleteDoctor)

router.delete("/soft/:id", checkAuth(UserRole.ADMIN), DoctorController.softDeleteDoctor)


export const DoctorRoute = router