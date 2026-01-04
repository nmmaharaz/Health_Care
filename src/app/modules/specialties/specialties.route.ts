import { Router } from "express";
import { SpecialtiesController } from "./specialties.controller";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router()

router.get("/", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), SpecialtiesController.getAllSpecialties)

router.post("/", checkAuth(UserRole.ADMIN), multerUpload.single("file"), SpecialtiesController.createSpecialties)

router.delete("/:id", checkAuth(UserRole.ADMIN), SpecialtiesController.deleteSpecialties)

export const SpecialtiesRoute = router