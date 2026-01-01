import { Router } from "express";
import { UserController } from "./user.controller";
import validationRequest from "../../middleware/validationRequest";
import { createPatientZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
const router = Router()

router.post("/create-patient",multerUpload.single("file"), validationRequest(createPatientZodSchema), UserController.createPatient)
router.get("/", UserController.getAllUser)

export const UserRoute = router