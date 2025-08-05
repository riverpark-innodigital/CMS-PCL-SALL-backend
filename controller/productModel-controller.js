const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');

exports.prdModelCreate = async (req, res) => {

    try {
        const {
            ModelNameEn, ModelNameTh,
            Active,
            ModelCode,
            SupplierId,
        } = req.body;

        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const ConvertActive = (Active === 'true' || Active);
        const modelCode = `${Math.random().toString(36).substr(2,5).toUpperCase()}`;
        
        if (SupplierId) {
            const reCheckSup = await prisma.supplier.findFirst({
                where: { SupplierId: Number(SupplierId) },
            });
    
            if (!reCheckSup) throw "This supplier we can't find, because is not available!";
        }
        
        const prdModelData = await prisma.modelProduct.create({
            data: {
                ModelNameEn: ModelNameEn,
                ModelNameTh: ModelNameTh,
                ModelCode:  ModelCode || modelCode,
                Active: ConvertActive,
                CreateBy: UserData,
                UpdateBy: UserData,
                SupplierId: Number(SupplierId) || null,
            }
        });

        return res.status(201).json({
            message: "Product's Model creting successfully",
            body: prdModelData,
        });
    }
    catch(error) {
        return res.status(500).json({

            message: "Failed to Creating Product's Model",
            error: error,

        });

    }

}

exports.delProductModelById = async (req, res) => {
    try {

        const mdlId = parseInt(req.params.ProductModelId);
        
        const mdlData = await prisma.modelProduct.findUnique({
            where: { ModelProductId: mdlId },
            select: {
                ModelProductId: true,
                ModelNameTh: true,
                ModelNameEn: true,
                CreateDate: true, UpdateDate: true,
            },
        });

        if (!mdlData) {
            return res.status(404).json({
                message: `Model with ID ${mdlId} not found`,
            });
        }

        await prisma.product.updateMany({
            where: { ModelProductId: mdlId },
            data: { ModelProductId: null },
        });

        await prisma.modelProduct.delete({
            where: { ModelProductId: mdlId },
        });

        return res.status(200).json({
            message: `Delete Model successfully`,
            body: mdlData
        });

    } catch (error) {
        console.error("deleting Model by ID Error :", error);
        return res.status(500).json({
            message: "Failed to delete Model",
            error: error.message,
        });
    }
};

exports.getAllModel = async (req, res) => {
    try {
        
        const mdlData = await prisma.modelProduct.findMany({
            select: {
                ModelCode: true,
                ModelProductId: true,
                ModelNameTh: true, ModelNameEn: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true, UpdateDate: true,
            },
        });
        
        return res.status(200).json({
            message: "Getting Models successfully.",
            body: mdlData,
        });

    } catch (error) {
        console.error("Error fetching Models:", error);
        return res.status(500).json({
            message: "Failed to fetch Models",
            error: error.message,
        });
    }
};

exports.getModelById = async (req, res) => {
    try {
        
        const mdlId = parseInt(req.params.ProductModelId);
        const mdlData = await prisma.modelProduct.findFirst({
            where: { ModelProductId: mdlId },
            select: {
                ModelProductId: true, ModelCode: true,
                ModelNameTh: true, ModelNameEn: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true, UpdateDate: true,
                SupplierId: true,
            },
        });

        if (!mdlData) {
            return res.status(404).json({
                message: `Not found Any Model by ID ${mdlId}.`,
            });
        }

        return res.status(200).json({
            message: "Getting Model by ID successfully.",
            body: mdlData,
        });

    } catch (error) {
        console.error("Error fetching Model:", error);
        return res.status(500).json({
            message: "Failed to fetch Model",
            error: error.message,
        });
    }
};

exports.updateModelById = async(req, res) => {

    try {

        const {
            ModelCode,
            ModelNameEn, ModelNameTh,
            Active, SupplierId
        } = req.body;
        console.log(req.body,req.params);
        
        const ConvertActive = (Active === 'true' || Active);
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const mdlId = parseInt(req.params.ProductModelId);
        const mdlExist = await prisma.modelProduct.findFirst({
            where: { ModelProductId: mdlId }
        });

        if(!mdlExist) {

            return res.status(404).json({

                message: `Model's id ${mdlId} is not found.`

            });

        }

        if (SupplierId) {
            const reCheckSup = await prisma.supplier.findFirst({
                where: { SupplierId: Number(SupplierId) },
            });
    
            if (!reCheckSup) throw "This supplier we can't find, because is not available!";
        }

        const mdlData = await prisma.modelProduct.update({
            where: { ModelProductId: mdlId },
            data: {
                ModelCode: ModelCode,
                SupplierId: Number(SupplierId) || null,
                ModelNameTh: ModelNameTh,
                ModelNameEn: ModelNameEn,
                Active: ConvertActive,
                UpdateBy: UserData,
            }
        });

        return res.status(200).json({

            message: "Model Update successfully",
            body: mdlData,

        });
        
    }
    catch(error) {

        console.error("Model Update Failed.", error);

        return res.status(500).json({

            message: "Failed to Updating Model",
            error: error,

        });

    }

}

exports.getProductModelBySupId = async (req, res) => {
    try {
        const { SupplierId } = req.params;

        const reCheckSup = await prisma.supplier.count({
            where: {
                SupplierId: Number(SupplierId),
            }
        });

        if (!reCheckSup || reCheckSup === 0) {
            throw {
                message: "Supplier not found.",
                status: 404,
            }
        }

        const prdModelData = await prisma.modelProduct.findMany({
            where: {
                SupplierId: Number(SupplierId),
            },
            select: {
                ModelCode: true,
                ModelProductId: true,
                ModelNameTh: true, ModelNameEn: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true, UpdateDate: true,
            }
        });

        return sendResponse(res, 'getting produt model successfully', prdModelData, 200);
    } catch (error) {
        return handleError(res, error.message , error, error.status || 500);
    }
}