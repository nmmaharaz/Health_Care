import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { ScheduleRoute } from "../modules/schedule/schedule.route";
import { DoctorScheduleRoute } from "../modules/doctorSchedule/doctorSchedule.route";
import { SpecialtiesRoute } from "../modules/specialties/specialties.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";
import { AppointmentRoute } from "../modules/appoinment/appointment.route";
import { PrescriptionRoute } from "../modules/prescription/prescription.route";

export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoute
    },
    {
        path: "/auth",
        route: AuthRoute
    },
    {
        path: "/schedule",
        route: ScheduleRoute
    },
    {
        path: "/doctor-schedule",
        route: DoctorScheduleRoute
    },
    {
        path: "/specialties",
        route: SpecialtiesRoute
    },
    {
        path: "/doctor",
        route: DoctorRoute
    },
    {
        path: "/appointment",
        route: AppointmentRoute
    }, 
    {
        path: "/prescription",
        route: PrescriptionRoute
    }
    
]

moduleRoutes.map((route)=>{
    router.use(route.path, route.route)
})