import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/get-healthstatus").get(verifyJWT, healthCheck);

export default router;
