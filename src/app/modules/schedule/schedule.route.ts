import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router()

router.get("/", checkAuth(UserRole.ADMIN, UserRole.DOCTOR), ScheduleController.getAllSchedule)
router.get(
    '/:id',
    checkAuth(...Object.values(UserRole)),
    ScheduleController.getSingleSchedule
);
router.post("/", checkAuth(UserRole.ADMIN), ScheduleController.createSchedule)
router.delete("/:id", checkAuth(UserRole.ADMIN), ScheduleController.deleteSchedule)

export const ScheduleRoute = router