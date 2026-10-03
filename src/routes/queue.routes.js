import express from "express";
import { joinQueue, getMyToken, getServiceQueue, nextqueue, completeQueue, cancelQueue, skipQueue, getQueueHistory, getQueueDashboard, getCustomerDashboard, getAdminDashboard } from "../controllers/queue.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles} from "../middleware/role.middleware.js"

const router = express.Router();

router.post("/join", protect, joinQueue);
router.get("/my-token", protect, getMyToken);
router.get("/service/:serviceId", protect, getServiceQueue);
router.post("/next", protect, authorizeRoles("ADMIN", "STAFF"), nextqueue);
router.patch("/complete/:queueId", protect, authorizeRoles("ADMIN", "STAFF"), completeQueue);
router.patch("/cancel/:queueId", protect, cancelQueue);
router.patch("/skip/:queueId", protect, authorizeRoles("ADMIN", "STAFF"), skipQueue);
router.get("/history", protect, authorizeRoles("ADMIN", "STAFF"), getQueueHistory);
router.get("/dashboard", protect, authorizeRoles("ADMIN", "STAFF"), getQueueDashboard);
router.get("/customer-dashboard", protect, getCustomerDashboard);
router.get("/admin-dashboard", protect, authorizeRoles("ADMIN"), getAdminDashboard);

export default router;