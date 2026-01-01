import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { ScheduleRoute } from "../modules/schedule/schedule.route";

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
    }
]

moduleRoutes.map((route)=>{
    router.use(route.path, route.route)
})