const handleError = require('../../hooks/handleError');
const setResponse = require('../../hooks/sendResponse');
const { PrismaClient } = require('@prisma/client');
const DecryptToken = require('../../hooks/decryptJWT');

const prisma = new PrismaClient();

exports.addNewPresentKPI = async (req, res) => {
    try {
        const { presentFileId, presentTo, presentDate, description } = req.body;
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const presentDateConverted = new Date(presentDate);

        const response = await prisma.presentationKPI.create({
            data: {
                PresentFileId: Number(presentFileId),
                PresentTo: presentTo,
                PresentDate: presentDateConverted,
                Description: description,
                UserId: UserData,
            }
        });

        return setResponse(res, "Add new presentation kpi successfully.", response, 201);
    } catch (err) {
        return handleError(res, "Add new presentation kpi failed.", err, 500);
    }
};

exports.getQtyProdcutPresentKPIBySale = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const result = [];

        const response = await prisma.product.findMany({
            where: {
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
                            where: {
                                UserId: UserData,
                            },
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
    } catch (err) {
        return handleError(res, "get qty of product present failed.", err, 500);
    }
};

exports.getQtyProdcutPresentKPIBySaleTop = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const result = [];

        const response = await prisma.product.findMany({
            where: {
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
                            where: {
                                UserId: UserData,
                            },
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
                })
            }
        }

        const highest = result.reduce((max, obj) => (obj.PresentQty > max.PresentQty ? obj : max));
        
        return setResponse(res, "Get qty of product present successfully.", highest, 200);
    } catch (err) {
        return handleError(res, "get qty of product present failed.", err, 500);
    }
};

exports.getTopSupplierForPresentKpi = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const result = [];

        const response = await prisma.product.findMany({
            where: {
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
                            where: {
                                UserId: UserData,
                            },
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