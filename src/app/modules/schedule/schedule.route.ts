import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router()

router.get("/", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), ScheduleController.getAllSchedule)
router.post("/", ScheduleController.createSchedule)
router.delete("/:id", checkAuth(UserRole.ADMIN), ScheduleController.deleteSchedule)

export const ScheduleRoute = router