const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const setResponse = require('../hooks/sendResponse');
const handleError = require('../hooks/handleError');
const { getUserByUsername } = require('../service/user-service');
const { getRoleByRoleId } = require('../service/role-service');
const { GetGroupPermissionByUserId } = require('./../service/permission-service');

exports.addView = async(req, res) => {

    try {

        const { ObjectId, ObjectType } = req.body;
        const data = await DecryptToken(req);
        const UserData = data.user.id;

        const viewData = await prisma.objectView.create({

            data: {
                UserID: UserData,
                ObjectID: parseInt(ObjectId),
                ObjectType: ObjectType,
                Active: true
            }

        });

        return res.status(201).json({

            message: "Add View successfully",
            body: viewData,

        });

    }
    catch(error) {

        console.error("Add View Fail: ", error);
        return res.status(500).json({

            message: "Failed to Add View",
            error: error.message,

        });

    }

}

exports.getProductsTotal = async(req, res) => {

    try {

        const prdTotal = await prisma.product.count();

        return res.status(201).json({

            message: "get all amount of products",
            body: prdTotal

        });

    }
    catch(error) {

        console.error("get all amount of products Fail: ", error);
        return res.status(500).json({

            message: "Failed to get all amount of products",
            error: error.message,

        });

    }

}

exports.getSuppliersTotal = async(req, res) => {

    try {

        const suplData = await prisma.supplier.count();

        return res.status(201).json({

            message: "get all amount of suppliers",
            body: suplData

        });

    }
    catch(error) {

        console.error("get all amount of suppliers Fail: ", error);
        return res.status(500).json({

            message: "Failed to get all amount of suppliers",
            error: error.message,

        });

    }

}

exports.getTop5Suppliers = async(req, res) => {

    try {

        const allSuplData = await prisma.supplier.findMany({

            select: {

                SupplierId: true,
                SupplierImage: true,
                _count: {
                    select:
                        { Product: true }
                }

            }

        });

        const suplIds =  await prisma.objectView.groupBy({

            by: ['ObjectID'],
            where: {
                ObjectType: 'supplier',
            },
            _count: {
                ObjectViewId: true,
            },
            orderBy: {
                _count: {
                    ObjectID: 'desc',
                },
            },
            take: 5
    
        });

        const suplIdsArray = suplIds.map(item => item.ObjectID);
        const suplDataFilter = allSuplData.filter(data => suplIdsArray.includes(data.SupplierId));

        const suplData = suplDataFilter.map(data => {

            const matchedSuplId = suplIds.find(item => item.ObjectID === data.SupplierId);

            return {
                ...data,
                userAccess: matchedSuplId ? matchedSuplId._count.ObjectViewId : 0,
                products: data._count.Product,
                _count: undefined,
                SupplierId: undefined
            }

        });

        const sortedResults = suplData.sort((a, b) => b.userAccess - a.userAccess);
        
        return res.status(201).json({

            message: "getting top 5 suppliers",
            body: sortedResults

        });

    }
    catch(error) {

        console.error("Get top 5 supplier Fail: ", error);
        return res.status(500).json({

            message: "Failed to Get top 5 suppliers",
            error: error.message,

        });

    }

}

exports.getMostViewProduct = async(req, res) => {
    try {
        const userData = await DecryptToken(req);
        const dataUser = await getUserByUsername(userData.user.username);
        const dataRole = await getRoleByRoleId(dataUser.role);
        const userRole = dataRole.nameEng;

        let whereClause = {};
        let productWhereClause = {};

        if (userRole === 'Sale') {
            whereClause = { UserID: userData.user.id };
            productWhereClause = { CreateBy: dataUser.fullname };
        } else if (userRole === 'Sale Manager') {
            const data = await GetGroupPermissionByUserId(dataUser.id);
            const teamLdapIds = data.member?.map(m => m.ldapId) || [];
            const teamNames = data.member?.map(m => m.name) || [];

            whereClause = { UserID: { in: teamLdapIds } };
            productWhereClause = { CreateBy: { in: teamNames } };
        }

        const allPrdData = await prisma.product.findMany({
            where: { ...productWhereClause },
            select: {
                ProductId: true,
                ProductImage: true,
                Supplier: {
                    select: {
                        SupplierImage: true
                    }
                },
                ProductNameTh: true,
                ProductNameEn: true,
            }
        });

        const prdIds =  await prisma.objectView.groupBy({

            by: ['ObjectID'],
            where: {
                ...whereClause,
                ObjectType: 'product',
            },
            _count: {
                ObjectViewId: true,
            },
            orderBy: {
                _count: {
                    ObjectID: 'desc',
                },
            },
            take: 1
    
        });

        const prdIdsArray = prdIds.map(item => item.ObjectID);
        const prdDataFilter = allPrdData.filter(data => prdIdsArray.includes(data.ProductId));

        const prdData = prdDataFilter.map(data => {

            const matchedPrdId = prdIds.find(item => item.ObjectID === data.ProductId);

            return {
                ...data,
                SupplierImage: data.Supplier.SupplierImage,
                views: matchedPrdId ? matchedPrdId._count.ObjectViewId : 0,
                ProductId: undefined,
                Supplier: undefined
            }

        });

        return res.status(201).json({

            message: "getting the most viewed product",
            body: prdData

        });

    }
    catch(error) {

        console.error("get the most viewed product Fail: ", error);
        return res.status(500).json({

            message: "Failed to get the most viewed product",
            error: error.message,

        });

    }

}

exports.getProductsDashBoard = async(req, res) => {
    try {

        const allPrdData = await prisma.product.findMany({
            select: {
                ProductId: true,
                ProductNo: true,
                ProductImage: true,
                ProductNameTh: true,
                ProductNameEn: true,
                CreateDate: true,
                UpdateDate: true,
                Supplier: {
                    select: {
                        SupplierImage: true,
                        SupplierNameTh: true,
                        SupplierNameEn: true
                    }
                },
                GroupProduct: {
                    select: {
                        GroupNameEn: true,
                    }
                }
            },
            orderBy: {
                ProductId: 'desc',
            },
        });

        const prdData =  await prisma.objectView.groupBy({

            by: ['ObjectID'],
            where: {
                ObjectType: 'product',
            },
            _count: {
                ObjectViewId: true,
            },
            orderBy: {
                _count: {
                    ObjectID: 'desc',
                },
            },
    
        });

        const prdDataAdjusted = prdData.map((item) => ({
            ObjectID: item.ObjectID,
            views: item._count.ObjectViewId
        }));

        const combinedResults = allPrdData.map(product => {
            const viewData = prdDataAdjusted.find(item => item.ObjectID === product.ProductId);
            return {
                ProductId: product.ProductId,
                ProductNo: product.ProductNo,
                ProductGroup: product.GroupProduct.GroupNameEn,
                ProductImage: product.ProductImage,
                ProductnameTh: product.ProductNameTh,
                ProductnameEn: product.ProductNameEn,
                SupplierImage: product.Supplier.SupplierImage,
                SupplierNameTh: product.Supplier.SupplierNameTh,
                SupplierNameEn: product.Supplier.SupplierNameEn,
                CreatedData: product.CreateDate,
                UpdatedDate: product.UpdateDate,
                views: viewData ? viewData.views : 0
            };
        });

        const sortedResults = combinedResults.sort((a, b) => b.views - a.views);

        return res.status(201).json({

            message: "All the Products, Suplliers",
            body: sortedResults

        });

    }
    catch(error) {

        console.error("Get Total Fail: ", error);
        return res.status(500).json({

            message: "Failed to Get Total",
            error: error.message,

        });

    }

};


exports.getProductOverview = async (req, res) => {
    try {
        const userData = await DecryptToken(req);
        const dataUser = await getUserByUsername(userData.user.username);
        const dataRole = await getRoleByRoleId(dataUser.role);
        const userRole = dataRole.nameEng;

        if (userRole === 'Sale') {
            whereClause = { CreateBy: dataUser.fullname };
        } else if (userRole === 'Sale Manager') {
            const data = await GetGroupPermissionByUserId(dataUser.id);
            const teamMembers = data.member?.map(m => m.name) || [];
            whereClause = {
                CreateBy: {
                in: teamMembers
                }
            };
        } else if (userRole === 'Administrator') {
            whereClause = {};
        }
        const result = [];

        const response = await prisma.product.findMany({
            where: {
                ...whereClause,
                Active: true,
            },
            select: {
                ProductId: true,
                SupplierId: true,
                GroupProductId: true,
                ModelProductId: true,
                ProductNameEn: true,
                ProductImage: true,
                Active: true,
                Supplier: {
                    select: {
                        SupplierId: true,
                        SupplierNameEn: true,
                        SupplierImage: true,
                    }
                },
                GroupProduct: {
                    select: {
                        GroupProductId: true,
                        GroupNameEn: true,
                        ImageName: true,
                        ImageOrginalName: true,
                        ImagePath: true,
                    }
                },
                PresentFile: {
                    select: {
                        ProductId: true,
                        FileName: true,
                        FileOriginalName: true,
                        FilePath: true,
                        PresentationKPI: {
                            select: {
                                PresentFileId: true,
                                PresentTo: true,
                                PresentDate: true,
                                Description: true,
                            }
                        }
                    }
                }
            }
        });

        for (const product of response) {
            let total = 0;
            const productFilter = product.PresentFile.filter(p => p.PresentationKPI.length !== 0);

            for (const presentFile of productFilter) {
                const presentFileIds = presentFile.PresentationKPI.map(p => p.PresentFileId);

                const PresentFilecounts = presentFileIds.reduce((acc, id) => {
                    acc[id] = (acc[id] || 0) + 1;
                    return acc;
                }, {});

                totalCount = Object.values(PresentFilecounts).reduce((sum, count) => sum + count, 0);
                total += totalCount;
            }

            if (total > 0) {
                result.push({
                    ProductId: product.ProductId,
                    ProductNameEn: product.ProductNameEn,
                    ProductImage: product.ProductImage,
                    Supplier: product.Supplier,
                    GroupProduct: product.GroupProduct,
                    PresentQty: total,
                });
            }
        }

        const productData = result.sort((a, b) => b.PresentQty - a.PresentQty);
        
        return setResponse(res, "Get qty of product present successfully.", productData, 200);
    } catch (error) {
        return handleError(res, "get qty of product present failed.", error, 500);
    }
}

exports.getTopPresentKpi = async (req, res) => {
    try {
        const userData = await DecryptToken(req);
        const dataUser = await getUserByUsername(userData.user.username);
        const dataRole = await getRoleByRoleId(dataUser.role);
        const userRole = dataRole.nameEng;

        if (userRole === 'Sale') {
            whereClause = { CreateBy: dataUser.fullname };
        } else if (userRole === 'Sale Manager') {
            const data = await GetGroupPermissionByUserId(dataUser.id);
            const teamMembers = data.member?.map(m => m.name) || [];
            whereClause = {
                CreateBy: {
                in: teamMembers
                }
            };
        } else if (userRole === 'Administrator') {
            whereClause = {};
        }
        const result = [];

        const response = await prisma.product.findMany({
            where: {
                ...whereClause,
                Active: true,
            },
            select: {
                ProductId: true,
                SupplierId: true,
                GroupProductId: true,
                ModelProductId: true,
                ProductNameEn: true,
                ProductImage: true,
                Active: true,
                Supplier: {
                    select: {
                        SupplierId: true,
                        SupplierNameEn: true,
                        SupplierImage: true,
                        ColorCode: true,
                    }
                },
                GroupProduct: {
                    select: {
                        GroupProductId: true,
                        GroupNameEn: true,
                        ImageName: true,
                        ImageOrginalName: true,
                        ImagePath: true,
                    }
                },
                PresentFile: {
                    select: {
                        ProductId: true,
                        FileName: true,
                        FileOriginalName: true,
                        FilePath: true,
                        PresentationKPI: {
                            select: {
                                PresentFileId: true,
                                PresentTo: true,
                                PresentDate: true,
                                Description: true,
                            }
                        }
                    }
                }
            }
        });

        for (const product of response) {
            let total = 0;
            const productFilter = product.PresentFile.filter(p => p.PresentationKPI.length !== 0);
            

            for (const presentFile of productFilter) {
                const presentFileIds = presentFile.PresentationKPI.map(p => p.PresentFileId);

                const PresentFilecounts = presentFileIds.reduce((acc, id) => {
                    acc[id] = (acc[id] || 0) + 1;
                    return acc;
                }, {});

                totalCount = Object.values(PresentFilecounts).reduce((sum, count) => sum + count, 0);
                total += totalCount;
            }

            if (total > 0) {
                result.push({
                    ProductId: product.ProductId,
                    ProductNameEn: product.ProductNameEn,
                    ProductImage: product.ProductImage,
                    Supplier: product.Supplier,
                    GroupProduct: product.GroupProduct,
                    PresentQty: total,
                });
            }
        }

        const supplierMap = new Map();

        for (const item of result) {
        const key = item.Supplier.SupplierId;

        if (!supplierMap.has(key)) {
            supplierMap.set(key, {
                SupplierId: item.Supplier.SupplierId,
                SupplierNameEn: item.Supplier.SupplierNameEn,
                SupplierImage: item.Supplier.SupplierImage,
                ColorCode: item.Supplier.ColorCode,
                PresentQty: item.PresentQty,
            });
        } else {
            supplierMap.get(key).PresentQty += item.PresentQty;
        }
        }

        const supplierData = Array.from(supplierMap.values()).sort((a, b) => b.PresentQty - a.PresentQty).slice(0, 5);
        
        return setResponse(res, "Get qty of product present successfully.", supplierData, 200);
    } catch (error) {
        return handleError(res, "Getting Top 5 supplier of present product failed.", error, 500);
    }
}