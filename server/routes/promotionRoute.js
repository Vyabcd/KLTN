import { Router } from "express";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";
import {
  createPromotion,
  getPromotion,
  getPromotions,
  setPromotion,
  updatePromotion,
} from "../controller/promotionController.js";

const router = Router();

router.post(
  "/create",
  authenticateUser,
  authorizePermissions("admin"),
  createPromotion
);
router.patch(
  "/update/:id",
  authenticateUser,
  authorizePermissions("admin"),
  updatePromotion
);
router.patch("/set-promotion", setPromotion);
router.get("/", getPromotions);
router.get("/:id", getPromotion);

export default router;
