import express, { type Request, type Response } from "express"
import cors from "cors"
import { globalError } from "./app/middleware/globalErrorHandlers.js"
import { envVars } from "./app/config/env.js"
import { router } from "./app/routes/route.js"
import cookieParser from "cookie-parser"

export const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use("/api/v1", router)



app.get("/", (req: Request, res: Response) => {
  res.send(`🚀 Server is running on port ${envVars.port}🥰🥰`);
});

app.use(globalError)