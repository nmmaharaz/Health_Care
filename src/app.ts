import express, { type Request, type Response } from "express"
import cors from "cors"
import { globalError } from "./middleware/globalErrorHandlers.js"
import { envVars } from "./config/env.js"
import { router } from "./routes/route.js"
export const app = express()
app.use(express.json())
app.use(cors())

app.use("/api/v1", router)



app.get("/", (req: Request, res: Response) => {
  res.send(`🚀 Server is running on port ${envVars.port}🥰🥰`);
});

app.use(globalError)