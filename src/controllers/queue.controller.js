import Queue from "../model/Queue.model.js";
import Service from "../model/Service.model.js";
import {sendQueueTokenEmail, sendServingEmail} from "../utils/mail.js";


export const joinQueue = async (req, res) => {
    try {
        // console.log("REQ USER:", req.user)
        const { serviceId, priority } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "Service is required"
            });
        }

        // Check service
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        if (!service.isActive) {
            return res.status(400).json({
                success: false,
                message: "Service is currently unavailable"
            });
        }

        // Today's date
        const today = new Date().toISOString().split("T")[0];

        const existingQueue = await Queue.findOne({
            user: req.user._id,
            service: serviceId,
            queueDate: today,
            status: {
                $in: ["WAITING", "SERVING"]
            }
        });


        if (existingQueue) {
            return res.status(409).json({
                success: false,
                message: "You are already in this queue",
                queue: existingQueue
            });
        }

        // Find last token of today
        const lastQueue = await Queue.findOne({
            service: serviceId,
            queueDate: today
        }).sort({ createdAt: -1 });

        let nextNumber = 1;

        if (lastQueue) {
            const lastNumber = parseInt(
                lastQueue.tokenNumber.replace(service.prefix, "")
            );

            nextNumber = lastNumber + 1;
        }

        // Generate token
        const tokenNumber =
            service.prefix + String(nextNumber).padStart(3, "0");

        // Create queue entry
        const queue = await Queue.create({
            tokenNumber,
            user: req.user._id,
            service: serviceId,
            priority: priority || "NORMAL",
            queueDate: today
        });

        await sendQueueTokenEmail(req.user.email, req.user.name, tokenNumber, service.name);

        res.status(201).json({
            success: true,
            message: "Joined queue successfully",
            queue
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyToken = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const queue = await Queue.findOne({
            user: req.user._id,
            queueDate: today,
            status: {
                $in: ["WAITING", "SERVING"]
            }
        }).populate("service", "name prefix averageServiceTime");

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "You are not in any queue today"
            });
        }

        let peopleAhead = 0;

        if (queue.priority === "HIGH") {
            peopleAhead = await Queue.countDocuments({
                service: queue.service._id,
                queueDate: today,
                status: "WAITING",
                priority: "HIGH",
                createdAt: { $lt: queue.createdAt }
            });
        } else {
            const highPriorityCount = await Queue.countDocuments({
                service: queue.service._id,
                queueDate: today,
                status: "WAITING",
                priority: "HIGH"
            });

            const normalPriorityCount = await Queue.countDocuments({
                service: queue.service._id,
                queueDate: today,
                status: "WAITING",
                priority: "NORMAL",
                createdAt: { $lt: queue.createdAt }
            });

            peopleAhead = highPriorityCount + normalPriorityCount;
        }

        const averageServiceTime = queue.service.averageServiceTime || 5; // Default to 5 minutes if not set
        const estimatedWaitTime = peopleAhead * averageServiceTime;

        res.status(200).json({
            success: true,
            queue: {
                id: queue._id,
                tokenNumber: queue.tokenNumber,
                service: queue.service.name,
                status: queue.status,
                priority: queue.priority,
                peopleAhead,
                estimatedWaitTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};

export const getServiceQueue = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const today = new Date().toISOString().split("T")[0];

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        const queue = await Queue.find({
            service: serviceId,
            queueDate: today,
            status: {
                $in: ["WAITING", "SERVING"]
            }
        })
            .populate("user", "name email mobile")
            .sort({ createdAt: 1 });

        // HIGH priority first, then NORMAL
        queue.sort((a, b) => {
            if (a.priority === "HIGH" && b.priority !== "HIGH") {
                return -1;
            }

            if (a.priority !== "HIGH" && b.priority === "HIGH") {
                return 1;
            }

            return a.createdAt - b.createdAt;
        });

        res.status(200).json({
            success: true,
            service: service.name,
            total: queue.length,
            queue
        });

    } catch (error) {
        console.log("Get service queue error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const nextqueue = async (req, res) => {
    try {
        const { serviceId } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "Service ID is required"
            });
        }

        const today = new Date().toISOString().split("T")[0];

        // Check service exists
        const currentServing = await Queue.findOne({
            service: serviceId,
            queueDate: today,
            status: "SERVING"
        });

        if (currentServing) {
            return res.status(400).json({
                success: false,
                message: "There is already a customer being served for this service",
                queue: currentServing
            });
        }

        let nextCustomer = await Queue.findOne({
            service: serviceId,
            queueDate: today,
            status: "WAITING",
            priority: "HIGH"
        }).sort({
            priority: -1,
            createdAt: 1
        });

        if (!nextCustomer) {
            nextCustomer = await Queue.findOne({
                service: serviceId,
                queueDate: today,
                status: "WAITING",
                priority: "NORMAL"
            }).sort({
                priority: -1,
                createdAt: 1
            });
        }

        if (!nextCustomer) {
            return res.status(404).json({
                success: false,
                message: "No customers in the queue for this service"
            });
        }

        nextCustomer.status = "SERVING";
        nextCustomer.calledAt = new Date();


        await nextCustomer.save();

        await nextCustomer.populate("user", "name email");
        await nextCustomer.populate("service", "name");

        try {
            await sendServingEmail(
                nextCustomer.user.email,
                nextCustomer.user.name,
                nextCustomer.tokenNumber,
                nextCustomer.service.name
            );
        } catch (emailError) {
            console.log("Serving email error:", emailError.message);
        }

        res.status(200).json({
            success: true,
            message: "Next customer is being served",
            queue: {
                id: nextCustomer._id,   
                tokenNumber: nextCustomer.tokenNumber,
                service: nextCustomer.service.name,
                status: nextCustomer.status,
                priority: nextCustomer.priority,
                calledAt: nextCustomer.calledAt
            }
        });

    } catch (error) {
        console.log("Next queue error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const completeQueue = async (req, res) => {
    try {
        const { queueId } = req.params;

        if (!queueId) {
            return res.status(400).json({
                success: false,
                message: "Queue ID is required"
            });
        }

        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue entry not found"
            });
        }

        if (queue.status !== "SERVING") {
            return res.status(400).json({
                success: false,
                message: "Only customers currently being served can be marked as completed"
            });
        }

        queue.status = "COMPLETED";
        queue.completedAt = new Date();

        await queue.save();

        res.status(200).json({
            success: true,
            message: "Queue entry marked as completed",
            queue: {
                id: queue._id,
                tokenNumber: queue.tokenNumber,
                service: queue.service,
                status: queue.status,
                completedAt: queue.completedAt
            }
        });
} catch (error) {
        console.log("Complete queue error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelQueue = async (req, res) => {
    try {
        const { queueId } = req.params;

        if (!queueId) {
            return res.status(400).json({
                success: false,
                message: "Queue ID is required"
            });
        }

        const queue = await Queue.findById(queueId);

        if (!queue) {   
            return res.status(404).json({
                success: false,
                message: "Queue entry not found"
            });
        }

        if(queue.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this queue entry"
            });
        }

        if (queue.status !== "WAITING") {
            return res.status(400).json({
                success: false,
                message: "Only customers in waiting status can cancel their queue entry"
            });
        }

        queue.status = "CANCELLED";
        await queue.save();

        res.status(200).json({
            success: true,
            message: "Queue entry cancelled successfully",
            queue: {
                id: queue._id,
                tokenNumber: queue.tokenNumber,
                status: queue.status
            }
        });
    } catch (error) {
        console.log("Cancel queue error:", error.message);      

        res.status(500).json({
            success: false,
            message: error.message
        });
    }   
};

export const skipQueue = async (req, res) => {
    try {

        const { queueId } = req.params;

        if (!queueId) {
            return res.status(400).json({
                success: false,
                message: "Queue ID is required"
            });
        }

        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue entry not found"
            });
        }

        // Only SERVING customer can be skipped
        if (queue.status !== "SERVING") {
            return res.status(400).json({
                success: false,
                message: "Only serving customer can be skipped"
            });
        }

        queue.status = "SKIPPED";

        await queue.save();

        res.status(200).json({
            success: true,
            message: "Customer skipped successfully",
            queue: {
                id: queue._id,
                tokenNumber: queue.tokenNumber,
                status: queue.status,
                priority: queue.priority
            }
        });

    } catch (error) {

        console.log("Skip queue error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getQueueHistory = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const { serviceId } = req.query;

        const filter = {
            queueDate: today
        };

        if(serviceId) { 
            filter.service = serviceId;
        }

        const queue = await Queue.find(filter)
            .populate("user", "name email mobile")
            .populate("service", "name prefix")
            .sort({
                createdAt: -1
            });

        const summary = {
            total: queue.length,
            waiting: queue.filter(q => q.status === "WAITING").length,
            serving: queue.filter(q => q.status === "SERVING").length,
            completed: queue.filter(q => q.status === "COMPLETED").length,
            cancelled: queue.filter(q => q.status === "CANCELLED").length,
            skipped: queue.filter(q => q.status === "SKIPPED").length
        };
        
        res.status(200).json({
            success: true,
            date: today,
            summary,
            queue
        });

    } catch (error) {
        console.log("Queue history error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getQueueDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const queue = await Queue.find({
            queueDate: today
        })
            .populate("user", "name email mobile")
            .populate("service", "name prefix")
            .sort({ createdAt: 1 });

        const dashboard = {
            total: queue.length,

            waiting: queue.filter(
                q => q.status === "WAITING"
            ).length,

            serving: queue.filter(
                q => q.status === "SERVING"
            ).length,

            completed: queue.filter(
                q => q.status === "COMPLETED"
            ).length,

            cancelled: queue.filter(
                q => q.status === "CANCELLED"
            ).length,

            skipped: queue.filter(
                q => q.status === "SKIPPED"
            ).length
        };

        const currentlyServing = queue.find(
            q => q.status === "SERVING"
        ) || null;

        const waitingQueue = queue.filter(
            q => q.status === "WAITING"
        );

        res.status(200).json({
            success: true,
            date: today,
            dashboard,
            currentlyServing,
            waitingQueue
        });

    } catch (error) {
        console.log("Dashboard error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCustomerDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const queue = await Queue.findOne({
            user: req.user._id,
            queueDate: today,
            status: {
                $in: ["WAITING", "SERVING"]
            }
        })
            .populate("service", "name prefix averageServiceTime")
            .sort({ createdAt: -1 });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "You are not currently in any queue"
            });
        }

        let peopleAhead = 0;
        let estimatedWaitTime = 0;

        if (queue.status === "WAITING") {
            peopleAhead = await Queue.countDocuments({
                service: queue.service._id,
                queueDate: today,
                status: "WAITING",
                createdAt: {
                    $lt: queue.createdAt
                }
            });

            const averageServiceTime =
                queue.service.averageServiceTime || 5;

            estimatedWaitTime =
                peopleAhead * averageServiceTime;
        }

        res.status(200).json({
            success: true,
            dashboard: {
                tokenNumber: queue.tokenNumber,
                service: queue.service.name,
                status: queue.status,
                priority: queue.priority,
                peopleAhead,
                estimatedWaitTime,
                joinedAt: queue.createdAt,
                calledAt: queue.calledAt
            }
        });

    } catch (error) {
        console.log("Customer dashboard error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAdminDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const queue = await Queue.find({
            queueDate: today
        })
            .populate("user", "name email mobile")
            .populate("service", "name prefix")
        
        const total = queue.length;

        const waiting = queue.filter(q => q.status === "WAITING").length;
        const serving = queue.filter(q => q.status === "SERVING").length;
        const completed = queue.filter(q => q.status === "COMPLETED").length;
        const cancelled = queue.filter(q => q.status === "CANCELLED").length;
        const skipped = queue.filter(q => q.status === "SKIPPED").length;

        const currentlyServing = queue.find(q => q.status === "SERVING") || null;

        const servingstats = {};

        queue.forEach(q => {
            const serviceName = q.service?.name || "Unknown Service";

            if (!servingstats[q.service.name]) {
                servingstats[serviceName] = {
                    total: 0,
                    waiting: 0,
                    serving: 0,
                    completed: 0,
                    cancelled: 0,
                    skipped: 0
                };
            }

        servingstats[serviceName].total++;

        if (q.status === "WAITING") servingstats[serviceName].waiting++;
        if (q.status === "SERVING") servingstats[serviceName].serving++;    
        if (q.status === "COMPLETED") servingstats[serviceName].completed++;
        if (q.status === "CANCELLED") servingstats[serviceName].cancelled++;
        if (q.status === "SKIPPED") servingstats[serviceName].skipped++;

        });

        res.status(200).json({
            success: true,
            date: today,
            overall: {
                total,
                waiting,
                serving,
                completed,
                cancelled,
                skipped
            },
            currentlyServing,
            servingstats
        });
    } catch (error) {
        console.log("Admin dashboard error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};