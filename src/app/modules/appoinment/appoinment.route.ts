import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AppoinmentController } from "./appoinment.controller";

const router = Router()

router.post("/", checkAuth(UserRole.PATIENT), AppoinmentController.createAppoinment)


export const AppoinmentRoute = router