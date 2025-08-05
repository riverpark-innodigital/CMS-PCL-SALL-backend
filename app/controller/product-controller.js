const handleError = require('../../hooks/handleError');
const setResponse = require('../../hooks/sendResponse');
const { PrismaClient } = require('@prisma/client');
const DecryptToken = require('../../hooks/decryptJWT');

const prisma = new PrismaClient();

exports.GettingProductBySup = async (req, res) => {
    try {
        const { supId, pgid } = req.params;
        const data = await DecryptToken(req);
        const UserData = data.user.id;

        const response = await prisma.supplier.findFirst({
            where: {
                SupplierId: Number(supId),
            },
            select: {
                SupplierNameEn: true,
                SupplierDescriptionEN: true,
                SupplierImage: true,
                Product: {
                    orderBy: {
                        ProductId: 'desc',
                    },
                    where: {
                        Active: true,
                        GroupProductId: Number(pgid),
                    }
                },
            }
        });

        const favProductIds = await prisma.favorite.findMany({
            where: {
                UserID: UserData,
                ObjectType: 'Product',
            },
            select: {
                ObjectID: true,
                FavoriteId: true
            },
        });

        const favProductId = favProductIds.map(fav => fav.ObjectID);

        const allProductWithFav = response.Product.map(product => {
            return {
                ...product,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
            };
        });

        const resFormat = {
            SupplierNameEn: response.SupplierNameEn,
            SupplierDescriptionEN: response.SupplierDescriptionEN,
            SupplierImage: response.SupplierImage,
            Product: allProductWithFav,
        }

        return setResponse(res, "Getting Product by supplier successfully.", resFormat, 200);
    } catch (err) {
        return handleError(res, "Getting Product by supplier failed.", err, 500);
    }
};

exports.GettingProductById = async (req, res) => {
    try {
        const { supId, productId } = req.params;
        const data = await DecryptToken(req);
        const UserData = data.user.id;

         const response = await prisma.supplier.findFirst({
            where: {
                SupplierId: Number(supId),
            },
            select: {
                SupplierNameEn: true,
                SupplierDescriptionEN: true,
                SupplierImage: true,
                Product: {
                    where: {
                        ProductId: Number(productId),
                    },
                    select: {
                        ProductId: true,
                        SupplierId: true,
                        ProductNo: true,
                        GroupProductId: true,
                        ModelProductId: true,
                        ProductNameTh: true,
                        ProductNameEn: true,
                        ProductImage: true,
                        ProductDescriptionHeaderTh: true,
                        ProductDescriptionDetailTh: true,
                        ProductDescriptionHeaderEn: true,
                        ProductDescriptionDetailEn: true,
                        MeadiaTitle: true,
                        ProductVideo: true,
                        MeadiaDescription: true,
                        ProductUpVideo: true,
                        Active: true,
                        ProductImages: {
                            select: {
                                ProductImageImage: true,
                                ProductImageNameEn: true,
                            }
                        },
                        ProductFolders: {
                            where: {
                                Active: true,
                            },
                            select: {
                                ProductFolderId: true,
                                ProductFolderNameTh: true,
                                ProductFolderNameEn: true,
                                ProductFolderSeq: true,
                                Active: true,
                                ProductFiles: {
                                   select: {
                                        ProductFileId: true,
                                        ProductFileNameTh: true,
                                        ProductFileNameEn: true,
                                        ProductFile: true,
                                        Active: true,
                                   }
                                }
                            }
                        },
                        PresentFile: {
                            select: {
                                id: true,
                                FileName: true,
                                FileOriginalName: true,
                                FilePath: true,
                            }
                        }
                    }
                },
            }
        });

        const favProductIds = await prisma.favorite.findMany({
            where: {
                UserID: UserData,
                ObjectType: 'Product',
            },
            select: {
                ObjectID: true,
                FavoriteId: true
            },
        });

        const favProductId = favProductIds.map(fav => fav.ObjectID);

        const allProductWithFav = response.Product.map(product => {
            return {
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                ...product,
            };
        });

        await response.Product[0].ProductImages.push({
            "ProductImageImage": response.Product[0].ProductImage,
            "ProductImageNameEn": response.Product[0].ProductImage
        })

        const resFormat = {
            SupplierNameEn: response.SupplierNameEn,
            SupplierDescriptionEN: response.SupplierDescriptionEN,
            SupplierImage: response.SupplierImage,
            Product: allProductWithFav,
        }

        return setResponse(res, "Getting Product by id successfully.", resFormat, 200);
    } catch (err) {
        return handleError(res, "Getting Product by id failed.", err, 500);
    }
};  