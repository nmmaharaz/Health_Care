import Stripe from "stripe";
import { envVars } from "./env";
export const stripe = new Stripe(envVars.stripe_api_secret as string);