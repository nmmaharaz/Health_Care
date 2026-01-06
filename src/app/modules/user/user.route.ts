import { Router } from "express";
import { UserController } from "./user.controller";
import validationRequest from "../../middleware/validationRequest";
import { createAdminZodSchema, createDoctorZodSchema, createPatientZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
const router = Router()

router.post("/create-patient", multerUpload.single("file"), validationRequest(createPatientZodSchema), UserController.createPatient)

router.post("/create-doctor", checkAuth(UserRole.ADMIN), multerUpload.single("file"), validationRequest(createDoctorZodSchema), UserController.createDoctor)

router.post("/create-admin", checkAuth(UserRole.ADMIN), multerUpload.single("file"), validationRequest(createAdminZodSchema), UserController.createAdmin)

router.get("/", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), UserController.getAllUser)

export const UserRoute = router