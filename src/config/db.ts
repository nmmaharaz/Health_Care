import { PrismaPg } from "@prisma/adapter-pg";
import { envVars } from "./env.js";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = envVars.base_url
const adapter = new PrismaPg({connectionString})
const prisma = new PrismaClient({adapter})

export default prisma