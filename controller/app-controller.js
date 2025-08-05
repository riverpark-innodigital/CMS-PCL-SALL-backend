const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');

function formatDate(inputDate) {
    const date = new Date(inputDate);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

let dateExpired = new Date();
dateExpired = new Date(dateExpired.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })); // แปลงเป็นเวลาไทย
dateExpired.setHours(0, 0, 0, 0);
dateExpired = dateExpired.toISOString();

exports.getProductByIdApp = async (req, res) => {
    try {
        const ProductId = parseInt(req.params.productID);
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        // Fetch product details by ID
        const product = await prisma.product.findUnique({
            where: { ProductId, Active: true },
            include: {
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupCode: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        Active: true
                    }
                }
            },
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        if (!product.Supplier || !product.Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

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

        const allProductWithFav = {
            Favorited: favProductId.includes(product.ProductId) ? 1 : 0
        };

        const allProductImages = [
            {

                ProductImageNameTh: 'Main Image',
                ProductImageNameEn: 'Main Image',
                ProductImageImage: product.ProductImage,
                Active: true,
                CreateBy: product.CreateBy,
                UpdateBy: product.UpdateBy,

            },
            ...product.ProductImages.map(image => ({
                ProductImageNameTh: image.ProductImageNameTh,
                ProductImageNameEn: image.ProductImageNameEn,
                ProductImageImage: image.ProductImageImage,
                Active: image.Active,
                CreateBy: image.CreateBy,
                UpdateBy: image.UpdateBy,
            }))
        ];

        const response = {
            ProductId: ProductId,
            SupplierId: product.SupplierId,
            ProductNo: product.ProductNo,
            ProductNameTh: product.ProductNameTh,
            ProductNameEn: product.ProductNameEn,
            ProductDescriptionHeaderTh: product.ProductDescriptionHeaderTh,
            ProductDescriptionDetailTh: product.ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn: product.ProductDescriptionHeaderEn,
            ProductDescriptionDetailEn: product.ProductDescriptionDetailEn,
            MeadiaTitle: product.MeadiaTitle,
            MeadiaDescription: product.MeadiaDescription,
            ProductDescriptionDetailEn: product.ProductDescriptionDetailEn,
            SupplierNameEn: product.Supplier.SupplierNameEn,
            SupplierImage: product.Supplier.SupplierImage,
            ProductVideo: product.ProductVideo,
            ProductUpVideo: product.ProductUpVideo,
            ProductImageMain: product.ProductImage,
            ProductImageChildren: allProductImages,
            CreateDate: product.CreateDate,
            frmDate: formatDate(product.CreateDate),
            CreateBy: product.CreateBy,
            UpdateBy: product.UpdateBy,
            Favorited: allProductWithFav.Favorited
        };

        return res.status(200).json({
            message: 'Product retrieved successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Failed to retrieve product',
            error: error.message,
        });
    }
};

exports.getProductBySuplIdApp = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const suplId = parseInt(req.params.supplierId);
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const amountPrd = await prisma.product.count({
            where: {
                SupplierId: suplId,
                Active: true,
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ]
            },
        });

        const allPage = Math.ceil(amountPrd/amountPerPage);
        const prdData = await prisma.product.findMany({
            skip: (page-1) * amountPerPage,
            where: {
                SupplierId: suplId,
                Active: true,
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ]
            },
            include: {
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupCode: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        Active: true
                    }
                }
            },
            orderBy: {
                ProductId: 'desc'
            },
            take: amountPerPage
        });

        if (prdData.length === 0) {
            return res.status(404).json({
                message: "The Supplier's which you provide Have no Products",
            });
        }

        if(!prdData[0].Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

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

        const allProductWithFav = prdData.map(product => {
            const frmCretDate = formatDate(product.CreateDate)
            return {
                ...product,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                frmDate: frmCretDate,
                GroupNameTh: product.GroupProduct?.GroupNameTh || null,
                GroupNameEn: product.GroupProduct?.GroupNameEn || null
            };
        });

        return res.status(200).json({
            message: 'Product by Supplier id retrieved successfully',
            data: allProductWithFav,
            page: page,
            allPage: allPage

        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Failed to retrieve product',
            error: error.message,
        });
    }
};

exports.getProductBySearchApp = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const suplId = parseInt(req.params.supplierId);
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const searchType = req.params.searchType;
        const searchValue = req.params.searchValue;
        const skipItem = (page-1) * amountPerPage;

        const prdData = await prisma.product.findMany({
            where: {
                Active: true,
                SupplierId: suplId,
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ],
                [searchType]: { contains: searchValue, mode: "insensitive" },
            },
            include: {
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupCode: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        Active: true
                    }
                }
            },
            orderBy: {
                ProductId: 'desc'
            },
        });

        if (prdData.length === 0) {
            return res.status(404).json({
                body: {},
            });
        }

        if(!prdData[0].Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

        const allPage = Math.ceil((prdData.length)/amountPerPage);

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

        let allProductWithFav = prdData.map(product => {
            const frmCretDate = formatDate(product.CreateDate)
            return {
                ...product,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                frmDate: frmCretDate,
                GroupNameTh: product.GroupProduct?.GroupNameTh || null,
                GroupNameEn: product.GroupProduct?.GroupNameEn || null
            };
        });

        allProductWithFav = allProductWithFav.slice(skipItem,skipItem + amountPerPage);

        return res.status(200).json({
            message: 'Product Searching retrieved successfully',
            data: allProductWithFav,
            page: page,
            allPage: allPage
        });
    } catch (error) {
        console.error('Error Searching Product:', error);
        res.status(500).json({
            message: 'Failed to Searching Product',
            error: error.message,
        });
    }
};

exports.getFavProductBySearchApp = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const suplId = parseInt(req.params.supplierId);
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const searchType = req.params.searchType;
        const searchValue = req.params.searchValue;
        const skipItem = (page-1) * amountPerPage;

        const prdData = await prisma.product.findMany({
            where: {
                Active: true,
                SupplierId: suplId,
                [searchType]: { contains: searchValue, mode: "insensitive" },
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ],
            },
            include: {
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupCode: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        Active: true
                    }
                }
            },
            orderBy: {
                ProductId: 'desc'
            },
        });

        if (prdData.length === 0) {
            return res.status(404).json({
                body: {},
            });
        }

        if(!prdData[0].Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

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

        let allProductWithFav = prdData.map(product => {
            const frmCretDate = formatDate(product.CreateDate)
            return {
                ...product,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                frmDate: frmCretDate,
                GroupNameTh: product.GroupProduct?.GroupNameTh || null,
                GroupNameEn: product.GroupProduct?.GroupNameEn || null
            };
        }).filter(product => product.Favorited === 1);

        const allPage = Math.ceil((allProductWithFav.length)/amountPerPage);
        allProductWithFav = allProductWithFav.slice(skipItem,skipItem + amountPerPage);

        return res.status(200).json({
            message: 'Favorite Product Searching retrieved successfully',
            data: allProductWithFav,
            page: page,
            allPage: allPage
        });
    } catch (error) {
        console.error('Error Searching Favorite Product:', error);
        res.status(500).json({
            message: 'Failed to Searching Favorite Product',
            error: error.message,
        });
    }
};

exports.getProductFavOnly = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const prdData = await prisma.product.findMany({
            where: {
                Active: true,
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ]
            },
            include: {
                GroupProduct: {
                    select: {
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        SupplierImage: true,
                        Active: true
                    }
                }
            },
            orderBy: {
                ProductId: 'desc'
            }
        });

        if (prdData.length === 0) {
            return res.status(404).json({
                message: 'Supplier id not found in product',
            });
        }

        if(!prdData[0].Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

        const favProductIds = await prisma.favorite.findMany({
            where: {
                UserID: UserData,
                ObjectType: 'Product',
                Active: true
            },
            select: {
                ObjectID: true,
                FavoriteId: true
            },
        });

        const favProductId = favProductIds.map(fav => fav.ObjectID);

        const allProductWithFav = prdData
            .map(product => ({
                ProductId: product.ProductId,
                ProductNo: product.ProductNo,
                ProductNameEn: product.ProductNameEn,
                ProductNameTh:  product.ProductNameTh,
                ProductImage: product.ProductImage,
                SupplierImage: product.Supplier.SupplierImage,
                SupplierNameEn: product.Supplier.SupplierNameEn,
                SupplierNameTh: product.Supplier.SupplierNameTh,
                ModelNameEn: product.ModelProduct?.ModelNameEn || null,
                ModelNameTh: product.ModelProduct?.ModelNameTh || null,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                frmDate: product.CreateDate,
                GroupNameTh: product.GroupProduct?.GroupNameTh || null,
                GroupNameEn: product.GroupProduct?.GroupNameEn || null
            }))
            .filter(product => product.Favorited === 1);

        if (allProductWithFav.length === 0) {
            return res.status(404).json({
                message: 'Not Found Any Favorited Product.',
            });
        }

        return res.status(200).json({
            message: 'Product by Supplier id retrieved successfully',
            data: allProductWithFav,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Failed to retrieve product',
            error: error.message,
        });
    }
};

exports.getProductBySuplIdFavOnly = async (req, res) => {
    try {
        const suplId = parseInt(req.params.supplierId);
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const skipItem = (page-1) * amountPerPage;
        const prdData = await prisma.product.findMany({
            where: {
                SupplierId: suplId, Active: true,
                OR: [
                    {
                        Expiredate: {
                            gt: dateExpired
                        }
                    },
                    {
                        Expiredate: null
                    }
                ]
            },
            include: {
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupCode: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ModelProduct: {
                    select: {
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                Supplier: {
                    select: {
                        SupplierNameEn: true,
                        SupplierNameTh: true,
                        SupplierImage: true,
                        Active: true
                    }
                }
            },
            orderBy: {
                ProductId: 'desc'
            }
        });

        if (prdData.length === 0) {
            return res.status(404).json({
                message: 'Supplier id not found in product',
            });
        }

        if(!prdData[0].Supplier.Active) {
            return res.status(404).json({
                message: "The Supplier is Not Active Anymore",
            });
        }

        const favProductIds = await prisma.favorite.findMany({
            where: {
                UserID: UserData,
                ObjectType: 'Product',
                Active: true
            },
            select: {
                ObjectID: true,
                FavoriteId: true
            },
        });

        const favProductId = favProductIds.map(fav => fav.ObjectID);

        let allProductWithFav = prdData
            .map(product => ({
                ...product,
                Favorited: favProductId.includes(product.ProductId) ? 1 : 0,
                frmDate: formatDate(product.CreateDate),
                GroupNameTh: product.GroupProduct?.GroupNameTh || null,
                GroupNameEn: product.GroupProduct?.GroupNameEn || null
            }))
            .filter(product => product.Favorited === 1);

        const allPage = Math.ceil((allProductWithFav.length)/amountPerPage);
        allProductWithFav = allProductWithFav.slice(skipItem,skipItem + amountPerPage);

        if (allProductWithFav.length === 0) {
            return res.status(404).json({
                message: 'Not Found Any Favorited Product.',
            });
        }

        return res.status(200).json({
            message: 'Product by Supplier id retrieved successfully',
            data: allProductWithFav,
            page: page,
            allPage: allPage
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Failed to retrieve product',
            error: error.message,
        });
    }
};

exports.getAllSupplierApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const amountSupl = await prisma.supplier.count({
            where: { Active: true }
        });

        const allPage = Math.ceil(amountSupl/amountPerPage);

        const suplData = await prisma.supplier.findMany({
            where: { Active: true},
            skip: (page-1) * amountPerPage,
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                CreateBy: true,
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            },
            take: amountPerPage
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                message: `Not found Any Supplier.`,
            });
        }

        const favSupplierIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
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
                Favorited: favSupplierId.includes(supplier.SupplierId) ? 1 : 0,
            };
        });

        return res.status(200).json({
            message: "Getting Suppliers successfully.",
            body: allSupplierWithFav,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error fetching Suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch Suppliers",
            error: error.message,
        });
    }
};

exports.getSearchSupplierApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const searchType = req.params.searchType;
        const searchValue = req.params.searchValue;
        const skipItem = (page-1) * amountPerPage;

        const suplData = await prisma.supplier.findMany({
            where: {
                Active: true,
                [searchType]: { contains: searchValue, mode: "insensitive" }
            },
            select: {
                SupplierId: true,
                SupplierNameTh: true,
                SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true,
                SupplierDescriptionEN: true,
                CreateBy: true,
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            },
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                body: {},
            });
        }

        const allPage = Math.ceil((suplData.length)/amountPerPage);

        const favSupplierIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
              ObjectType: 'Supplier',
            },
            select: {
              ObjectID: true,
              FavoriteId: true
            },
        });

        const favSupplierId = favSupplierIds.map(fav => fav.ObjectID);
        let allSupplierWithFav = suplData.map(supplier => {
            return {
                ...supplier,
                Favorited: favSupplierId.includes(supplier.SupplierId) ? 1 : 0,
            };
        });

        allSupplierWithFav = allSupplierWithFav.slice(skipItem,skipItem + amountPerPage);

        return res.status(200).json({
            message: "getting Searched suppliers successfully.",
            body: allSupplierWithFav,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error getting Searched suppliers Suppliers:", error);
        return res.status(500).json({
            message: "Failed to getting Searched suppliers",
            error: error.message,
        });
    }
};

exports.getAllSupplierFavOnlyApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const skipItem = (page-1) * amountPerPage;
        const suplData = await prisma.supplier.findMany({
            where: { Active: true},
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                CreateBy: true, 
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            }
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                message: `Not found Any Supplier.`,
            });
        }

        const prdData = await prisma.product.findMany({
            where: { Active: true},
            select: {
                ProductId: true,
                SupplierId: true,
            },
        });

        const favProductIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
              ObjectType: 'Product',
            },
            select: {
              ObjectID: true,
            },
        });

        const favIds = new Set(favProductIds.map(fav => fav.ObjectID)); // ใช้ Set ได้ใช้ method has มาเช็คจะทำงานไวขึ้น
        const supplierHasFavProduct = new Set(); // รอแอด Id ของ Supplier เข้าไป

        prdData.forEach(product => {
            if (favIds.has(product.ProductId)) {
                supplierHasFavProduct.add(product.SupplierId);
            }
        });

        let filteredSuppliers = suplData.filter(supplier => supplierHasFavProduct.has(supplier.SupplierId));
        const allPage = Math.ceil((filteredSuppliers.length)/amountPerPage);

        filteredSuppliers = filteredSuppliers.slice(skipItem,skipItem + amountPerPage);

        if (filteredSuppliers.length < 1) {
            return res.status(404).json({
                message: `No suppliers have products which are favorited found.`,
            });
        }

        return res.status(200).json({
            message: "Getting Suppliers successfully.",
            body: filteredSuppliers,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error fetching Suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch Suppliers",
            error: error.message,
        });
    }
};

exports.getSearchSupplierFavOnlyApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const skipItem = (page-1) * amountPerPage;
        const searchType = req.params.searchType;
        const searchValue = req.params.searchValue;
        const suplData = await prisma.supplier.findMany({
            where: {
                Active: true,
                [searchType]: { contains: searchValue, mode: "insensitive" }
            },
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                CreateBy: true, 
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            }
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                message: `Not found Any Supplier.`,
            });
        }

        const prdData = await prisma.product.findMany({
            where: { Active: true},
            select: {
                ProductId: true,
                SupplierId: true,
            },
        });

        const favProductIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
              ObjectType: 'Product',
            },
            select: {
              ObjectID: true,
            },
        });

        const favIds = new Set(favProductIds.map(fav => fav.ObjectID)); // ใช้ Set ได้ใช้ method has มาเช็คจะทำงานไวขึ้น
        const supplierHasFavProduct = new Set(); // รอแอด Id ของ Supplier เข้าไป

        prdData.forEach(product => {
            if (favIds.has(product.ProductId)) {
                supplierHasFavProduct.add(product.SupplierId);
            }
        });

        let filteredSuppliers = suplData.filter(supplier => supplierHasFavProduct.has(supplier.SupplierId));
        const allPage = Math.ceil((filteredSuppliers.length)/amountPerPage);

        filteredSuppliers = filteredSuppliers.slice(skipItem,skipItem + amountPerPage);

        if (filteredSuppliers.length < 1) {
            return res.status(404).json({
                message: `No suppliers have products which are favorited found.`,
            });
        }

        return res.status(200).json({
            message: "Getting Suppliers successfully.",
            body: filteredSuppliers,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error fetching Suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch Suppliers",
            error: error.message,
        });
    }
};

exports.getSupplieByIdApp = async (req, res) => {
    try {
        const suplId = req.params.supplierID;
        const suplData = await prisma.supplier.findUnique({
            where: { SupplierId: parseInt(suplId), Active: true },
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                CreateBy: true, UpdateBy: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true
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

exports.getFolderByIdApp = async(req,res) => {

    try {

        const prdFlId = parseInt(req.params.productId);

        const productExists = await prisma.productFolder.findFirst({
            where: { ProductId: prdFlId, Active: true },
        });

        if(!productExists) {

            return res.status(404).json({

                message: `Product which ID is ${prdFlId} is not found in product's folder.`

            });

        }

        const prdFlData = await prisma.productFolder.findMany({
            where: { ProductId: prdFlId, Active: true },
            select: {
                ProductFolderId: true,
                ProductFolderNameTh: true,
                ProductFolderNameEn: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true,
                ProductFiles: {
                    where: { Active: true },
                    select: {
                        ProductFileId: true,
                        ProductFileNameTh: true,
                        ProductFileNameEn: true,
                        ProductFile: true,
                        Active: true,
                        CreateBy: true,
                        UpdateBy: true,
                    },
                },
            },
            orderBy: {
                ProductFolderSeq: 'asc'
            }
        });

        return res.status(200).json({
            message: "Getting Product's Folder By id successfully",
            body: prdFlData,
        });

    }
    catch(error) {

        console.error("Getting Product By Id Fail: ", error);
        return res.status(500).json({

            message: "Failed to Getting Product by id",
            error: error.message,

        });

    }

}

exports.getFileByFolderApp = async(req,res) => {

    try {

        const folderId = parseInt(req.params.folderId);

        const productExist = await prisma.productFile.findFirst({

            where: {ProductFolderId: folderId, Active: true}

        })

        if(!productExist) {

            return res.status(404).json({

                body: {}

            });

        }

        const prdFlData = await prisma.productFile.findMany({
            where: { ProductFolderId: folderId, Active: true },
            select: {
                ProductFileId: true,
                ProductFileNameTh: true,
                ProductFileNameEn: true,
                ProductFile: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true
            },
            orderBy: {
                ProductFileId: 'desc'
            }
        })

        return res.status(200).json({
            message: "Getting Product File By Folder's id successfully",
            body: prdFlData,
        });

    }
    catch(error) {

        console.error("Getting Product By Folder's id Fail ",error);
        return res.status(500).json({

            message: "Failed to Getting Product by folder's id",
            error: error.message

        })

    }

}

exports.getSupplierByCompanyApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const compyId = parseInt(req.params.companyId);

        const amountSupl = await prisma.supplier.count({
            where: {
                Active: true,
                SupplierCompany: {
                    some: { CompanyId: compyId }
                }
            }
        });
        
        const allPage = Math.ceil(amountSupl/amountPerPage);

        const suplData = await prisma.supplier.findMany({
            where: {
                Active: true,
                SupplierCompany: {
                    some: { CompanyId: compyId } // ✅ Checks if supplier is linked to the given company
                }
            },
            skip: (page - 1) * amountPerPage,
            select: {
                SupplierId: true,
                SupplierNameTh: true, SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true, SupplierDescriptionEN: true,
                CreateBy: true,
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            },
            take: amountPerPage
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                message: `Not found Any Supplier by company.`,
            });
        }

        const favSupplierIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
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
                Favorited: favSupplierId.includes(supplier.SupplierId) ? 1 : 0,
            };
        });

        return res.status(200).json({
            message: "Getting Suppliers by company successfully.",
            body: allSupplierWithFav,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error fetching Suppliers by company:", error);
        return res.status(500).json({
            message: "Failed to fetch Suppliers by company",
            error: error.message,
        });
    }
};

exports.getSearchSupplierByCompanyApp = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const companyId = parseInt(req.params.companyId);
        const page = parseInt(req.params.page);
        const amountPerPage = parseInt(req.params.amount);
        const searchType = req.params.searchType;
        const searchValue = req.params.searchValue;
        const skipItem = (page-1) * amountPerPage;

        const suplData = await prisma.supplier.findMany({
            where: {
                Active: true,
                SupplierCompany: {
                    some: { CompanyId: companyId } // ✅ Checks if supplier is linked to the given company
                },
                [searchType]: { contains: searchValue, mode: "insensitive" }
            },
            select: {
                SupplierId: true,
                SupplierNameTh: true,
                SupplierNameEn: true,
                SupplierImage: true,
                Active: true,
                SupplierDescriptionTH: true,
                SupplierDescriptionEN: true,
                CreateBy: true,
                UpdateBy: true,
            },
            orderBy: {
                SupplierId: 'desc'
            },
        });

        if (suplData.length < 1) {
            return res.status(404).json({
                body: {},
            });
        }

        const allPage = Math.ceil((suplData.length)/amountPerPage);

        const favSupplierIds = await prisma.favorite.findMany({
            where: {
              UserID: UserData,
              ObjectType: 'Supplier',
            },
            select: {
              ObjectID: true,
              FavoriteId: true
            },
        });

        const favSupplierId = favSupplierIds.map(fav => fav.ObjectID);
        let allSupplierWithFav = suplData.map(supplier => {
            return {
                ...supplier,
                Favorited: favSupplierId.includes(supplier.SupplierId) ? 1 : 0,
            };
        });

        allSupplierWithFav = allSupplierWithFav.slice(skipItem,skipItem + amountPerPage);

        return res.status(200).json({
            message: "getting Searched suppliers successfully.",
            body: allSupplierWithFav,
            page: page,
            allPage: allPage
        });

    } catch (error) {
        console.error("Error getting Searched suppliers Suppliers:", error);
        return res.status(500).json({
            message: "Failed to getting Searched suppliers",
            error: error.message,
        });
    }
};

exports.getSupplierInBusiness = async (req, res) => {
    try {
        
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const compyId = parseInt(req.params.companyId);

        const companyUnits = await prisma.companyBusinessUnit.findMany({
            where: {
                companyId: compyId,
                Company: {
                    Active: true, // only active companies
                },
            },
            select: {
                Company: {
                    select: {
                        CompanyId: true,
                        CompanyNameEN: true,
                        CompanyNameTH: true,
                        CompamyPicture: true,
                        CompamyPictureName: true,
                    },
                },
                BusinessUnit: {
                    select: {
                        BusinessUnitId: true,
                        NameEN: true,
                        NameTH: true,
                        Suppliers: {
                            where: {
                                Supplier: {
                                    Active: true, // only active suppliers
                                },
                            },
                            select: {
                                Supplier: {
                                    select: {
                                        SupplierId: true,
                                        SupplierNameEn: true,
                                        SupplierNameTh: true,
                                        SupplierImage: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });        

        if (companyUnits.length < 1) {
            return res.status(404).json({
                message: `Not found Any Business Unit in company.`,
            });
        }

        const companyInfo = {
            CompanyId: companyUnits[0].Company.CompanyId,
            CompanyNameEN: companyUnits[0].Company.CompanyNameEN,
            CompanyNameTH: companyUnits[0].Company.CompanyNameTH,
            CompamyPicture: companyUnits[0].Company.CompamyPicture,
            CompamyPictureName: companyUnits[0].Company.CompamyPictureName
        };

        const businessUnits = companyUnits.map(item => ({
            BusinessUnitId: item.BusinessUnit.BusinessUnitId,
            NameEN: item.BusinessUnit.NameEN,
            NameTH: item.BusinessUnit.NameTH,
            Suppliers: item.BusinessUnit.Suppliers.map(buSupplier => ({
              SupplierId: buSupplier.Supplier.SupplierId,
              SupplierNameEn: buSupplier.Supplier.SupplierNameEn,
              SupplierNameTh: buSupplier.Supplier.SupplierNameTh,
              SupplierImage: buSupplier.Supplier.SupplierImage
            }))
        }));

        return res.status(200).json({
            message: "Getting suppliers each business type successfully.",
            body: {
                ...companyInfo,
                BusinessUnits: businessUnits,
            }
        });

    } catch (error) {
        console.error("Error fetching suppliers each business type:", error);
        return res.status(500).json({
            message: "Failed to fetch suppliers each business type",
            error: error.message,
        });
    }
};

exports.getProductEachGroup = async (req, res) => {
    try {
        const data = await DecryptToken(req);
        const UserData = data.user.id;
        const suplId = parseInt(req.params.supplierId);

        const supplierWithProducts = await prisma.supplier.findFirst({
            where: {
                SupplierId: suplId,
                Active: true, // only active suppliers
            },
            select: {
                SupplierId: true,
                SupplierImage: true,
                GroupProduct: {
                    where: {
                        Active: true, // only active group products
                    },
                    select: {
                        GroupProductId: true,
                        GroupNameEn: true,
                        GroupNameTh: true,
                        _count: {
                            select: {
                                Products: {
                                    where: {
                                        Active: true, // count only active products
                                    },
                                },
                            },
                        },
                        Products: {
                            where: {
                                Active: true, // only active products
                            },
                            select: {
                                ProductId: true,
                                ProductNameTh: true,
                                ProductNameEn: true,
                                ProductImage: true,
                                CreateDate: true,
                            },
                        },
                    },
                },
            },
        });        

        if (!supplierWithProducts) {
            return res.status(404).json({
                message: `Not found supplier.`,
            });
        }

        const result = {
            SupplierId: supplierWithProducts.SupplierId,
            SupplierImage: supplierWithProducts.SupplierImage,
            GroupProduct: supplierWithProducts.GroupProduct.map(group => ({
                GroupProductId: group.GroupProductId,
                GroupNameEn: group.GroupNameEn,
                GroupNameTh: group.GroupNameTh,
                Total: group._count.Products,
                Products: group.Products.map(product => ({
                    ProductId: product.ProductId,
                    ProductNameTh: product.ProductNameTh,
                    ProductNameEn: product.ProductNameEn,
                    ProductImage: product.ProductImage,
                    CreateDate: product.CreateDate,
                })),
            })),
        };

        return res.status(200).json({
            message: "Getting products by group successfully.",
            body: result,
        });

    } catch (error) {
        console.error("Error fetching products by group:", error);
        return res.status(500).json({
            message: "Failed to fetch products by group",
            error: error.message,
        });
    }
};
