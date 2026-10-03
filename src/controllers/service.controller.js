import Service from "../model/Service.model.js";

export const createService = async (req, res) => {
    try {
        const { name, description, prefix, averageServiceTime } = req.body;

        if (!name || !prefix) { 
            return res.status(400).json({ 
                success: false, 
                message: "Name and prefix are required" 
            }); 
        }

        const existingService = await Service.findOne({ 
            $or: [ 
                { name: name.trim() }, 
                { prefix: prefix.toUpperCase().trim() } 
            ] 
        });

        if (existingService) {
            return res.status(400).json({ 
                success: false, 
                message: "Service with the same name or prefix already exists" 
            });
        }

        const newService = await Service.create({
            name: name.trim(),
            description: description || "",
            prefix: prefix.toUpperCase().trim(),
            averageServiceTime: averageServiceTime || 5
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            newService
        });
    } catch (error) {
        res.status(500).json({  
            success: false,
            message: "Failed to create service",
            error: error.message
        });
    }
};


// GET ALL SERVICES
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE SERVICE
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE SERVICE
export const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE SERVICE
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};