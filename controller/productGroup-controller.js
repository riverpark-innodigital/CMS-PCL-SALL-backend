const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');
const fs = require('fs');

exports.prdGroupCreate = async (req, res) => {

    try {
        const {
            GroupNameEn, GroupNameTh,
            Active,
            Suppliers,
        } = req.body;
        const productgroupImage = req.file;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const ConvertActive = (Active === 'true' || Active);
        const supConverted = Suppliers.split(',');

        const existingPrdGroup = await prisma.groupProduct.findFirst({
            where: {
                GroupNameEn: {
                    endsWith: GroupNameEn,
                    mode: 'insensitive'
                },
            }
        });
        

        if (existingPrdGroup) {
            throw "this product group name is exist already.";
        }
        
        const prdGrupData = await prisma.groupProduct.create({
            data: {
                GroupNameEn: GroupNameEn,
                GroupNameTh: GroupNameTh,
                Active: ConvertActive === true ? true : false,
                CreateBy: UserData,
                UpdateBy: UserData,
                ImageName: productgroupImage.filename,
                ImageOrginalName: productgroupImage.originalname,
                ImagePath: productgroupImage.path,
            }
        });
        
        if (!prdGrupData) throw "have some problem in the creating.";

        const createSup = await prisma.productGroupSup.createMany({
            data: supConverted.map((sup) => ({
                SupplierId: Number(sup),
                ProductGroupId: Number(prdGrupData.GroupProductId),
            }))
        });

    if (!createSup) throw "have some problem in the creating.";

        const response = await prisma.groupProduct.findFirst({
            where: {
                GroupProductId: prdGrupData.GroupProductId,
            },
            include: {
                ProductGroupSup: {
                    include: {
                        Supplier: true
                    }
                },
            }
        });

        return res.status(201).json({
            message: "Product's Group creting successfully",
            body: response,
        });
    } catch(error) {
        return res.status(500).json({
            message: "Failed to Creating Product's Group",
            error: error,
        });
    }
}

exports.delProductGroupById = async (req, res) => {

    try {

        const grupId = parseInt(req.params.ProductGroupId);
        console.log(req.params);
        
        const grupData = await prisma.groupProduct.findUnique({
            where: { GroupProductId: grupId },
            select: {
                GroupProductId: true,
                GroupNameTh: true,
                GroupNameEn: true,
            },
        });

        if (!grupData) {
            return res.status(404).json({
                message: `Group with ID ${grupId} not found`,
            });
        }

        await prisma.product.updateMany({
            where: { GroupProductId: grupId },
            data: { GroupProductId: null },
        });

        await prisma.groupProduct.delete({
            where: { GroupProductId: grupId },
        });

        return res.status(200).json({
            message: `Delete Group successfully`,
            body: grupData
        });

    } catch (error) {
        console.error("deleting Group by ID Error :", error);
        return res.status(500).json({
            message: "Failed to delete Group",
            error: error.message,
        });
    }
};

exports.getAllGroup = async (req, res) => {
    try {
        
        const grupData = await prisma.groupProduct.findMany({});

        return res.status(200).json({
            message: "Getting Groups successfully.",
            body: grupData,
        });

    } catch (error) {
        console.error("Error fetching Groups:", error);
        return res.status(500).json({
            message: "Failed to fetch Groups",
            error: error.message,
        });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        
        const grupId = parseInt(req.params.ProductGroupId);
        const grupData = await prisma.groupProduct.findFirst({
            where: { GroupProductId: grupId},
            select: {
                GroupProductId: true,
                GroupNameTh: true, 
                GroupNameEn: true,
                Active: true,
                CreateBy: true, 
                UpdateBy: true,
                CreateDate: true, 
                UpdateDate: true,
                ImageName: true,
                ImagePath: true, 
                ImageOrginalName: true,
                ProductGroupSup: {
                    select: {
                        SupplierId: true,
                        Supplier: true,
                    }
                }
            },
        });

        if (!grupData) {
            return res.status(404).json({
                message: `Not found Any Group by ID ${grupId}.`,
            });
        }

        return res.status(200).json({
            message: "Getting Group by ID successfully.",
            body: grupData,
        });

    } catch (error) {
        console.error("Error fetching Group:", error);
        return res.status(500).json({
            message: "Failed to fetch Group",
            error: error.message,
        });
    }
};

exports.updateGroupById = async(req, res) => {
    try {
        const {
            GroupNameEn, GroupNameTh,
            Active, Suppliers
        } = req.body;

        const user = await DecryptToken(req);
        const UserData = user.user.fullname;   
        const productgroupImage = req?.file;
        const grupId = parseInt(req.params.ProductGroupId);
        const supConverted = Suppliers.split(',');

        const recheckName = await prisma.groupProduct.findFirst({
            where: {
                GroupNameEn: {
                    endsWith: GroupNameEn,
                    mode: 'insensitive'
                },
                NOT: {
                    GroupProductId: Number(grupId)
                }
            }
        });

        if (recheckName)  return res.status(404).json({message: `This name already exists in the system.`});

        const grupExist = await prisma.groupProduct.findFirst({
            where: { GroupProductId: grupId }
        });

        if(!grupExist) {

            return res.status(404).json({

                message: `Group's id ${grupId} is not found.`

            });

        }

        if (productgroupImage !== undefined) {
            await prisma.groupProduct.update({
                where: {
                    GroupProductId: Number(grupId),
                },
                data: {
                    ImageName: productgroupImage.filename,
                    ImageOrginalName: productgroupImage.originalname,
                    ImagePath: productgroupImage.path,
                }
            })

            await grupExist?.ImageName ? fs.unlinkSync(`./uploads/Images/${grupExist?.ImageName}`) : null;
        }  

        const grupData = await prisma.groupProduct.update({
            where: { GroupProductId: grupId },
            data: {
                GroupNameTh: GroupNameTh,
                GroupNameEn: GroupNameEn,
                Active: Active === "true",
                UpdateBy: UserData,
            }
        });
     
        await prisma.productGroupSup.deleteMany({
            where: {
                ProductGroupId: Number(grupId)
            }
        });
        
        
        const createSup = await prisma.productGroupSup.createMany({
            data: supConverted.map((sup) => ({
                SupplierId: Number(sup),
                ProductGroupId: Number(grupId),
            }))
        });

        if (!createSup) throw "have some problem in the creating.";

        const response = await prisma.groupProduct.findFirst({
            where: { GroupProductId: grupId},
            select: {
                GroupProductId: true,
                GroupNameTh: true, 
                GroupNameEn: true,
                Active: true,
                CreateBy: true, 
                UpdateBy: true,
                CreateDate: true, 
                UpdateDate: true,
                ImageName: true,
                ImagePath: true, 
                ImageOrginalName: true,
                ProductGroupSup: {
                    select: {
                        SupplierId: true,
                        Supplier: true,
                    }
                }
            },
        });

        return res.status(200).json({
            message: "Group Update successfully",
            body: response,
        });
    }
    catch(error) {

        console.error("Group Update Failed.", error);

        return res.status(500).json({

            message: "Failed to Updating Group",
            error: error.message,

        });

    }

};

exports.getProductGroupBySupId = async (req, res) => {
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

        const productGroup = await prisma.groupProduct.findMany({
            where: {
                SupplierId: Number(SupplierId),
            },
            select:{
                GroupProductId: true, GroupCode: true,
                GroupNameTh: true, GroupNameEn: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true, UpdateDate: true,
                SupplierId: true,
            }
        });

        return sendResponse(res, 'getting produt group successfully', productGroup, 200);
    } catch (error) {
        return handleError(res, error.message , error, error.status || 500);
    }
}