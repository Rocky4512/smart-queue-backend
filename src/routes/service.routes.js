import express from "express";

import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService
} from "../controllers/service.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", protect, authorizeRoles("ADMIN"), createService);

router.get("/all", protect, getAllServices);

router.get("/:id", protect, getServiceById);

router.put("/:id", protect, authorizeRoles("ADMIN"), updateService);

router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteService);

export default router;