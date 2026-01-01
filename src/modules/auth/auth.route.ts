import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router()

router.post("/login", AuthController.Login)

export const AuthRoute = router