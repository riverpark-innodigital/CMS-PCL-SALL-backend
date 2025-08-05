const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');

exports.supplieCreate = async (req, res) => {
    try {
        const file = req.file;
        const {
            suplNmTh, suplNmEn,
            createBy, updateBy, Active,
            suplDescripTH, suplDescripEN,
            companyId, colorCode
        } = req.body;

        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const ConvertActive = (Active === 'true');
        let existingCompanyIds = [];        

        const recheckSup = await prisma.supplier.findMany({
            where: {
                SupplierNameEn: {
                    endsWith: suplNmEn,
                    mode: 'insensitive'
                },
            }
        });

        if (recheckSup.length !== 0) throw "This name already exists in the system.";

        if (companyId) {
            const companyIds = Array.isArray(companyId) ? companyId.map(id => parseInt(id)) : [parseInt(companyId)];

            const existingCompanies = await prisma.companys.findMany({
                where: { 
                    Active: true, 
                    CompanyId: { in: companyIds } 
                },
                select: { CompanyId: true }
            });

            existingCompanyIds = existingCompanies.map(c => c.CompanyId);

            if (existingCompanyIds.length !== companyIds.length) {
                return res.status(404).json({
                    message: `Company is Not Exist or Inactive.`,
                });
            }
        }
        
        let suplData = await prisma.supplier.create({
            data: {
                SupplierNameTh: suplNmTh,
                SupplierNameEn: suplNmEn,
                Active: ConvertActive,
                SupplierImage: file ? file.filename : null,
                CreateBy: UserData,
                UpdateBy: UserData,
                SupplierDescriptionTH: suplDescripTH,
                SupplierDescriptionEN: suplDescripEN,
                ColorCode: colorCode,
            }
        });

        if (companyId) {
            const supplierCompanies = existingCompanyIds.map(companyId => ({
                SupplierId: suplData.SupplierId,
                CompanyId: companyId,
                Active: true,
                CreateBy: UserData,
            }));

            await prisma.supplierCompany.createMany({
                data: supplierCompanies
            });
        }

        const getSup = await prisma.supplier.findFirst({
            where: { SupplierId: suplData.SupplierId },
            select: {
                ColorCode: true,
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                UpdateDate: true, CreateDate: true,
                SupplierCompany: {
                    select: {
                        Company: {
                            select: {
                                CompanyNameEN: true,
                                CompanyId: true,
                            }
                        }
                    }
                }
            },
        });

        const response = {
            ...getSup
        };

        return res.status(201).json({
            message: "Supplier creting successfully",
            body: response,
        });
    }
    catch(error) {
        return res.status(500).json({
            message: "Failed to Creating Supplier",
            error: error,
        });
    }
}

exports.supplieUpdate = async(req, res) => {    

    try {

        const {

            suplNmTh, suplNmEn,
            Active, updateBy,
            suplDescripTH, suplDescripEN,
            companyId, colorCode
        } = req.body;

        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const ConvertActive = (Active === 'true');
        const file = req.file;
        const suplId = parseInt(req.params.supplierID);
        let isSameCompanies = [];
        let companyIds = [];

        const suplExist = await prisma.supplier.findFirst({
            where: { SupplierId: suplId },
        });

        if(!suplExist) {

            return res.status(404).json({

                message: `Supplier's id ${suplId} is not found.`

            });

        }

        const existSupName = await prisma.supplier.findFirst({
            where: {
                SupplierNameEn: {
                    endsWith: suplNmEn,
                    mode: 'insensitive'
                },
                NOT: {
                    SupplierId: Number(suplId),
                }
            }
        });

        if (existSupName) throw "This name already exists in the system.";

        if (companyId) {
            companyIds = Array.isArray(companyId) 
            ? companyId.map(Number) 
            : companyId.split(',').map(Number);

            const existingCompanies = await prisma.companys.findMany({
                where: {
                    Active: true,
                    CompanyId: { in: companyIds.map(Number) }
                }
            });

            if (existingCompanies.length !== companyIds.length) {
                return res.status(404).json({
                    message: `Company is Not Exist or Inactive.`,
                });
            }

            const existingSupplierCompanies = await prisma.supplierCompany.findMany({
                where: { SupplierId: suplId },
                select: { CompanyId: true }
            });

            const existingCompanyIds = existingSupplierCompanies.map(s => s.CompanyId).sort();
            const newCompanyIds = companyIds.map(Number).sort();

            isSameCompanies = JSON.stringify(existingCompanyIds) === JSON.stringify(newCompanyIds);
        }

        const suplData = await prisma.supplier.update({
            where: { SupplierId: suplId },
            data: {

                SupplierNameTh: suplNmTh,
                SupplierNameEn: suplNmEn,
                SupplierImage: file ? file.filename : suplExist.SupplierImage,
                Active: ConvertActive,
                UpdateBy: UserData,
                ColorCode: colorCode,
                SupplierDescriptionTH: suplDescripTH,
                SupplierDescriptionEN: suplDescripEN
            }
        });

        if (!isSameCompanies) {
            await prisma.supplierCompany.deleteMany({
                where: { SupplierId: suplId }
            });

            const newSupplierCompanies = companyIds.map(cid => ({
                SupplierId: suplId,
                CompanyId: cid,
                Active: true,
                CreateBy: UserData,
            }));

            await prisma.supplierCompany.createMany({
                data: newSupplierCompanies
            });
        }

        const getSup = await prisma.supplier.findFirst({
            where: { SupplierId: parseInt(suplId) },
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                ColorCode: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                UpdateDate: true, CreateDate: true,
                SupplierCompany: {
                    select: {
                        Company: {
                            select: {
                                CompanyNameEN: true,
                                CompanyId: true,
                            }
                        }
                    }
                }
            },
        });

        const response = {
            ...getSup
        };

        return res.status(200).json({

            message: "Supplier Update successfully",
            body: response,

        });
        
    }
    catch(error) {
        return res.status(500).json({
            message: "Failed to Updating Supplier",
            error: error,
        });

    }

}

exports.getAllSupplier = async (req, res) => {
    try {
        
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const suplData = await prisma.supplier.findMany({
            select: {
                SupplierNameEn: true,
                SupplierId: true,
                CreateBy: true,
                SupplierImage: true,
                CreateDate: true,
                UpdateBy: true,
                UpdateDate: true,
                Active: true,
                ColorCode: true,
                SupplierDescriptionEN: true,
                SupplierCompany: {
                    select: {
                        Company: {
                            select: {
                                CompanyNameEN: true,
                                CompanyId: true,
                                BusinessUnits: {
                                    select: {
                                        businessUnitId: true,
                                        BusinessUnit: {
                                            select: {
                                                Name: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { SupplierId: 'desc' },
        });

        const favSupplierIds = await prisma.favorite.findMany({
            where: {
              ObjectType: 'Supplier',
            },
            select: {
              ObjectID: true,
              FavoriteId: true
            },
        });

        const favSupplierId = favSupplierIds.map(fav => fav.ObjectID);

        const allSupplierWithFav = suplData.map(supplier => {
            return {
                ...supplier,
                Favorited: favSupplierId.includes(supplier.SupplierId) ? 1 : 0
            };
        });

        return res.status(200).json({
            message: "Getting Suppliers successfully.",
            body: allSupplierWithFav,
        });
    } catch (error) {
        console.error("Error fetching Suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch Suppliers",
            error: error.message,
        });
    }
};

exports.getSupplieById = async (req, res) => {
    try {
        const suplId = req.params.supplierID;
        const suplData = await prisma.supplier.findFirst({
            where: { SupplierId: parseInt(suplId) },
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                ColorCode: true,
                CreateBy: true, UpdateBy: true,
                CreateDate: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                UpdateDate: true, CreateDate: true,
                SupplierCompany: {
                    select: {
                        Company: {
                            select: {
                                CompanyNameEN: true,
                                CompanyId: true,
                                BusinessUnits: {
                                    select: {
                                        businessUnitId: true,
                                        BusinessUnit: {
                                            select: {
                                                Name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!suplData) {
            return res.status(404).json({
                message: `Supplier with ID ${suplId} is not found`,
            });
        }

        return res.status(200).json({
            message: "Getting Supplie successfully",
            body: suplData,
        });

    } catch (error) {
        console.error("Error fetching Supplie:", error);
        return res.status(500).json({
            message: "Failed to fetch Supplie",
            error: error.message,
        });
    }
};

exports.delSuplById = async (req, res) => {

    try {

        const suplId = parseInt(req.params.supplierID);

        const suplData = await prisma.supplier.findUnique({
            where: { SupplierId: suplId },
            select: {
                SupplierId: true,
                SupplierNameTh: true,
                SupplierNameEn: true,
            },
        });

        if (!suplData) {
            return res.status(404).json({
                message: `Supplier with ID ${suplId} not found`,
            });
        }

        const prdExist = await prisma.product.findMany({
            where: { SupplierId: suplId },
            select: { ProductId: true }
        });

        const prdId = prdExist.map(prd => prd.ProductId);

        if(prdId.length > 0) {

            const prdFlExist = await prisma.productFolder.findMany({
                where: { ProductId: { in: prdId } },
                select: { ProductFolderId: true }
            });
    
            const folderIds = prdFlExist.map(folder => folder.ProductFolderId);

            if(folderIds.length > 0) {

                await prisma.productFile.deleteMany({
                    where: { ProductFolderId: { in: folderIds } }
                });
        
                await prisma.productFolder.deleteMany({
                    where: { ProductId: { in: prdId } }
                });
    
            }

            await prisma.productImage.deleteMany({
                where: { ProductId: { in: prdId } }
            });
    
            await prisma.product.deleteMany({
                where: { SupplierId: suplId },
            });

        }

        await prisma.supplier.delete({
            where: { SupplierId: suplId },
        });

        return res.status(200).json({
            message: `Delete supplier successfully`,
            body: suplData
        });

    } catch (error) {
        console.error("deleting supplier by ID Error :", error);
        return res.status(500).json({
            message: "Failed to delete suppliers",
            error: error.message,
        });
    }
};

exports.getSupplierByCompanyId = async (req, res) => {
    try {
        const { companyId } = req.params;

        const response = await prisma.supplierCompany.findMany({
            where: {
                CompanyId: parseInt(companyId),
                Active: true,
            },
            include: {
                Supplier: true,
            }
        })

        return sendResponse(res, "Getting Supplier by company id successfully!", response, 200);
    } catch (error) {
        return handleError(res, "Getting Supplier by company id faild", error, 500 );
    }
}

exports.getSupByProductGroup = async (req, res) => {
    try {
        const { pgroupId } = req.params;

        const response = await prisma.productGroupSup.findMany({
            where: {
                ProductGroupId: Number(pgroupId)
            },
            select: {
                ProductGroupId: true,
                Supplier: true
            }
        });

        return sendResponse(res, "Getting Supplier by product group successfully!", response, 200);
    } catch (error) {
        return handleError(res, "Getting Supplier by product group faild", error, 500);
    }
}