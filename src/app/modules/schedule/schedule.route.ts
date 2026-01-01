import { Router } from "express";
import { ScheduleController } from "./schedule.controller";

const router = Router()

router.get("/", ScheduleController.getAllSchedule)
router.post("/", ScheduleController.createSchedule)

export const ScheduleRoute = router