import { Router } from "express";
import { sendEmailController } from "../controllers/email.controller";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

router.post("/send-email", sendEmailController);

export default router;
