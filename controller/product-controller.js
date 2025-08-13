const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const fs = require('fs');
const { getUserByUsername } = require('./../service/user-service');
const { GetGroupPermissionByUserId } = require('./../service/permission-service');
const { getRoleByRoleId } = require('../service/role-service');

function formatDate(inputDate) {
    const date = new Date(inputDate);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

exports.updateProductById = async (req, res) => {
    const { proId } = req.params;  // รับ proId จาก params
    const { SupplierId, ProductNameTh, ProductDescriptionHeaderTh, isActive } = req.body;  // รับข้อมูลจาก body
    const productImageMain = req.files?.ProductImageMain;  // ตรวจสอบว่าได้รับไฟล์ไหม
    const productImageChildren = req.files?.ProductImageChildren; // สำหรับรูปภาพลูก

    try {
        // ค้นหาสินค้าจาก proId
        const product = await prisma.product.findUnique({
            where: { ProductId: parseInt(proId) },  // ใช้ findUnique เพื่อค้นหาตาม ProductId
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // อัปเดตข้อมูลสินค้า
        const updatedProduct = await prisma.product.update({
            where: { ProductId: parseInt(proId) },  // ค้นหาตาม ProductId
            data: {
                SupplierId: parseInt(SupplierId) || product.SupplierId,
                ProductNameTh: ProductNameTh || product.ProductNameTh,
                ProductDescriptionHeaderTh: ProductDescriptionHeaderTh || product.ProductDescriptionHeaderTh,
                Active: isActive !== undefined ? isActive : product.Active,
            }
        });

        // อัปเดตรูปภาพหลัก (ถ้ามี)
        if (productImageMain) {
            const imagePath = path.join(__dirname, 'uploads', 'products', productImageMain.name);
            productImageMain.mv(imagePath, (err) => {
                if (err) return res.status(500).json({ message: "Error uploading image" });
            });
            updatedProduct.ProductImageMain = imagePath;
        }

        // อัปเดตรูปภาพลูก (ถ้ามี)
        if (productImageChildren) {
            const updatedImages = productImageChildren.map((file) => {
                const imageChildPath = path.join(__dirname, 'uploads', 'products', file.name);
                file.mv(imageChildPath, (err) => {
                    if (err) return res.status(500).json({ message: "Error uploading image" });
                });
                return {
                    ProductImageNameTh: file.name,
                    ProductImageImage: imageChildPath,
                    Active: true,
                    ProductId: updatedProduct.ProductId,
                    CreateBy: "Your Name",  // Replace with actual user
                    UpdateBy: "Your Name",  // Replace with actual user
                };
            });

            // บันทึกข้อมูลรูปภาพลูก
            await prisma.productImage.createMany({
                data: updatedImages,
            });
        }

        const formattedProducts = {
            ProductId: updatedProduct.ProductId,
            ProductNo: `P${updatedProduct.ProductId.toString().padStart(3, "0")}`, // Example of generating ProductNo
            ProductName: updatedProduct.ProductNameEn || updatedProduct.ProductNameTh || "N/A",
            ProductGroup: updatedProduct.ProductDescriptionHeaderEn || "N/A",
            Model: updatedProduct.ProductDescriptionHeaderTh || undefined,
            SupplierName: updatedProduct.Supplier?.SupplierNameEn || "N/A",
            SupplierImage: updatedProduct.Supplier?.SupplierImage || undefined,
            ImageMain: updatedProduct.ProductImage || undefined,
            CreatedDate: updatedProduct.CreateDate.toISOString(),
            CreatedBy: updatedProduct.CreateBy || "Unknown",
            Status: updatedProduct.Active ? "Active" : "Inactive",
        };

        return res.status(200).json({
            message: "Product updated successfully",
            product: formattedProducts,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the product" });
    }
};

exports.createProductController = async (req, res) => {
    const {
        SupplierId,
        ProductNameTh,
        ProductDescriptionHeaderTh,
        Active,
        ProductImageMain,
        ProductImageChildren
    } = req.body;

    // Ensure ProductImageChildren is parsed if it's a string
    let parsedProductImageChildren = [];
    if (typeof ProductImageChildren === 'string') {
        try {
            parsedProductImageChildren = JSON.parse(ProductImageChildren);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ProductImageChildren format',
            });
        }
    } else if (Array.isArray(ProductImageChildren)) {
        parsedProductImageChildren = ProductImageChildren;
    }

    const supplierId = parseInt(SupplierId, 10);
    const isActive = Active === 'true' ? true : (Active === 'false' ? false : undefined);

    try {
        // Create product in the database
        const product = await prisma.product.create({
            data: {
                ProductNameTh,
                SupplierId: supplierId,
                ProductDescriptionHeaderTh,
                Active: isActive,
                ProductImage: ProductImageMain,
                CreateBy: "Porjai Mak",
                UpdateBy: "Projai Mak",
            }
        });

        // Create related images in the ProductImage table for ProductImageChildren
        if (parsedProductImageChildren.length > 0) {
            const productImages = await prisma.productImage.createMany({
                data: parsedProductImageChildren.map((image) => ({
                    ProductId: product.ProductId, // Use the newly created ProductId
                    ProductImageNameTh: image.ProductImageNameTh,
                    ProductImageNameEn: image.ProductImageNameEn,
                    ProductImageImage: image.productImageImage, // File name
                    Active: image.Active,
                    CreateBy: "Porjai Mak",
                    UpdateBy: "Projai Mak",
                })),
            });
        }

        const formattedProducts = {
            ProductId: product.ProductId,
            ProductNo: `P${product.ProductId.toString().padStart(3, "0")}`, // Example of generating ProductNo
            ProductName: product.ProductNameEn || product.ProductNameTh || "N/A",
            ProductGroup: product.ProductDescriptionHeaderEn || "N/A",
            Model: product.ProductDescriptionHeaderTh || undefined,
            SupplierName: product.Supplier?.SupplierNameEn || "N/A",
            SupplierImage: product.Supplier?.SupplierImage || undefined,
            ImageMain: product.ProductImage || undefined,
            CreatedDate: product.CreateDate.toISOString(),
            CreatedBy: product.CreateBy || "Unknown",
            Status: product.Active ? "Active" : "Inactive",
        };

        return res.status(201).json({
            status: 'success',
            message: 'Product created successfully!',
            product: formattedProducts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while creating the product',
        });
    }
};

exports.getAllProductTable = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                Supplier: true,
            },
            orderBy: {
                ProductId: 'desc'
            }
        });

        const formattedProducts = products.map((product) => ({
            ProductId: product.ProductId,
            ProductNo: `P${product.ProductId.toString().padStart(3, "0")}`, // Example of generating ProductNo
            ProductName: product.ProductNameEn || product.ProductNameTh || "N/A",
            ProductGroup: product.ProductDescriptionHeaderEn || "N/A",
            Model: product.ProductDescriptionHeaderTh || undefined,
            SupplierName: product.Supplier?.SupplierNameEn || "N/A",
            SupplierImage: product.Supplier?.SupplierImage || undefined,
            ImageMain: product.ProductImage || undefined,
            CreatedDate: product.CreateDate.toISOString(),
            CreatedBy: product.CreateBy || "Unknown",
            Status: product.Active ? "Active" : "Inactive",
            Updatedate: product.UpdateDate.toISOString(),
        }));

        res.status(200).json(formattedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "An error occurred while fetching products." });
    }
};

exports.getAllProduct = async (req, res) => {
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

        // Fetch all products along with their images
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                ProductImages: true, // Include related product images
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
                Company: true,
                BusinessUnit: true,
                Supplier: {
                    include: {
                        SupplierCompany: {
                            include: {
                                Company: true,
                            }
                        },
                    },
                },
            },
            orderBy: {
                ProductId: 'desc'
            }
        });

        // Check if products exist
        if (!products || products.length === 0) {
            return res.status(200).json({
                message: 'No products found',
                data: products,
            });
        }        

        // Transform each product using .map()
        const response = products.map(product => ({
            ProductId: product.ProductId,
            ProductNo: product.ProductNo,
            Campany: `${product?.Company?.CompanyNameEN && product?.BusinessUnit?.Name ? `${product?.Company?.CompanyNameEN}, ${product?.BusinessUnit?.Name}`: ""}`,
            ProductNameTh: product.ProductNameTh,
            ProductNameEn: product.ProductNameEn,
            MeadiaTitle: product.MeadiaTitle,
            MeadiaDescription: product.MeadiaDescription,
            ProductGroupName: product?.GroupProduct?.GroupNameEn,
            ProductModelName: product?.ModelProduct?.ModelNameEn,
            ProductDescriptionHeaderTh: product.ProductDescriptionHeaderTh,
            ProductDescriptionDetailTh: product.ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn: product.ProductDescriptionHeaderEn,
            ProductDescriptionDetailEn: product.ProductDescriptionDetailEn,
            ProductImageMain: product.ProductImage,
            SupplierName: product?.Supplier?.SupplierNameEn,
            SupplierImage: product?.Supplier?.SupplierImage,
            ProductImageChildren: product.ProductImages?.map(image => ({
                ProductImageNameTh: image.ProductImageNameTh,
                ProductImageNameEn: image.ProductImageNameEn,
                ProductImageImage: image.ProductImageImage,
                Active: image.Active,
                CreateBy: image.CreateBy,
                UpdateBy: image.UpdateBy,
            })) || [], // Ensure it's an empty array if ProductImages is null or undefined
            Active: product.Active,
            CreateDate: product.CreateDate,
            frmDate: formatDate(product.CreateDate),
            CreateBy: product.CreateBy,
            UpdateBy: product.UpdateBy,
            Updatedate: product.UpdateDate,
        }));

        // Return the transformed data
        return res.status(200).json({
            message: 'Products retrieved successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            message: 'Failed to retrieve products',
            error: error.message,
        });
    }
};

exports.productCreate = async (req, res) => {
    try {

        const productUpVideo = req.files.ProductUpVideo ? req.files.ProductUpVideo[0] : null;
        const mainImage = req.files.ProductImageMain ? req.files.ProductImageMain[0] : null;
        const childImages = req.files.ProductImageChildren || [];
        const presentFiles = req.files.presentFiles || [];
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;   

        const {
            SupplierId, CompanyId, BuId,
            GroupProductId, ModelProductId,
            ProductNameTh, ProductNameEn,
            ProductDescriptionHeaderTh, ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn, ProductDescriptionDetailEn,
            ProductVideo, MediaTitle, MediaDescription,
            ProductCode,
            Active,
            CreateBy, UpdateBy,
            ExpireDate
        } = req.body;

        const suplId = SupplierId ? parseInt(SupplierId) : null;
        const grupId = GroupProductId ? parseInt(GroupProductId) : null;
        const mdlId = ModelProductId ? parseInt(ModelProductId) : null;
        const ConvertActive = (Active === 'true' || Active === true);
        const formattedExpireDate = ExpireDate ? new Date(ExpireDate).toISOString() : null;

        if (!suplId) {

            return res.status(400).json({
                message: `Supplier's ID is required.`
            });

        }

        const suplExist = await prisma.supplier.findFirst({
            where: { SupplierId: suplId },
        });

        if (!suplExist) {
            return res.status(404).json({
                message: `Supplier's id ${suplId} is not found.`
            });
        }

        if (grupId) {

            const grupExist = await prisma.groupProduct.findFirst({
                where: { GroupProductId: grupId },
            });

            if (!grupExist) {
                return res.status(404).json({
                    message: `Group's id ${grupId} is not found.`
                });
            }

        }

        if (mdlId) {

            const mdlExist = await prisma.modelProduct.findFirst({
                where: { ModelProductId: mdlId },
            });

            if (!mdlExist) {
                return res.status(404).json({
                    message: `Model's id ${mdlId} is not found.`
                });
            }

        }

        if (ProductNameEn) {
            const productNameExist = await prisma.product.findFirst({
                where: { ProductNameEn: ProductNameEn },
            });

            if (productNameExist) {
                return res.status(400).json({
                    message: `This name already exists in the system.`
                });
            }
        }

        const newProduct = await prisma.product.create({
            data: {
                SupplierId: suplId,
                GroupProductId: grupId,
                ModelProductId: mdlId,
                ...(CompanyId ? { CompanyId: Number(CompanyId) } : {}),
                BuId: Number(BuId),
                ProductNameTh,
                ProductNameEn,
                ProductNo: ProductCode,
                ProductImage: mainImage ? mainImage.filename : null,
                ProductUpVideo: productUpVideo ? productUpVideo.filename : null,
                ProductDescriptionHeaderTh,
                ProductDescriptionDetailTh,
                ProductDescriptionHeaderEn,
                ProductDescriptionDetailEn,
                MeadiaDescription: MediaDescription,
                MeadiaTitle: MediaTitle,
                ProductVideo,
                Active: ConvertActive,
                CreateBy: UserData,
                UpdateBy: UserData,
                Expiredate: formattedExpireDate || null
            },
        });

        const createdImages = [];
        const createdFile = [];

        for (const image of childImages) {

            const newImage = await prisma.productImage.create({

                data: {

                    ProductId: newProduct.ProductId,
                    ProductImageNameTh: image.originalname,
                    ProductImageNameEn: image.originalname,
                    ProductImageImage: image.filename,
                    Active: true,
                    CreateBy: UserData,
                    UpdateBy: UserData,

                }

            })

            createdImages.push(newImage);

        }

        for (const file of presentFiles) {

            const newFile = await prisma.presentationFile.create({
                data: {
                    ProductId: newProduct.ProductId,
                    FileName: file.filename,
                    FileOriginalName: file.originalname,
                    FilePath: file.path,
                }
            });

            createdFile.push(newFile);
        }

        const response = {
            ProductId: newProduct.ProductId,
            ProductNo: newProduct.ProductNo,
            MeadiaTitle: newProduct.MeadiaTitle,
            CompanyId: newProduct.CompanyId,
            BuId: newProduct.BuId,
            MeadiaDescription: newProduct.MeadiaDescription,
            ProductName: newProduct.ProductNameEn || newProduct.ProductNameTh || "N/A",
            ProductGroup: newProduct.ProductDescriptionHeaderEn || "N/A",
            Model: newProduct.ProductDescriptionHeaderTh || undefined,
            SupplierName: newProduct.Supplier?.SupplierNameEn || "N/A",
            SupplierImage: newProduct.Supplier?.SupplierImage || undefined,
            ImageMain: newProduct.ProductImage || undefined,
            CreatedDate: newProduct.CreateDate.toISOString(),
            CreatedBy: newProduct.CreateBy || "Unknown",
            ExpireDate: newProduct.Expiredate,
            Status: newProduct.Active ? "Active" : "Inactive",
            Updatedate: newProduct.UpdateDate,
        };

        res.status(201).json({
            message: 'Product created successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            message: 'Failed to create product',
            error: error.message,
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const ProductId = Number(req.params.productID);        

        // Fetch product details by ID
        const product = await prisma.product.findUnique({
            where: { ProductId },
            include: {
                Supplier: {
                    include: {
                        SupplierCompany: {
                            select: {
                                Company: {
                                    select: {
                                        CompanyId: true,
                                        CompanyNameEN: true,
                                    }
                                }
                            }
                        }
                    }
                },
                Company: true,
                BusinessUnit: true,
                ProductImages: true,
                GroupProduct: {
                    select: {
                        GroupProductId: true,
                        GroupNameEn: true,
                        GroupNameTh: true
                    }
                },
                ProductFolders: true,
                ModelProduct: {
                    select: {
                        ModelProductId: true,
                        ModelCode: true,
                        ModelNameEn: true,
                        ModelNameTh: true
                    }
                },
                PresentFile: true,
            }
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        const response = {
            ProductId: ProductId,
            CompanyId: product.CompanyId,
            BuId: product.BuId,
            ProductGroupId: product.GroupProductId,
            CompanyName: product.Company.CompanyNameEN,
            BUName: product?.BusinessUnit?.Name || 'No Data',
            ProductNo: product.ProductNo,
            ProductNameTh: product.ProductNameTh,
            ProductNameTh: product.ProductNameTh,
            ProductNameEn: product.ProductNameEn,
            Presentations: product.PresentFile,
            ProductDescriptionHeaderTh: product.ProductDescriptionHeaderTh,
            ProductDescriptionDetailTh: product.ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn: product.ProductDescriptionHeaderEn,
            ProductDescriptionDetailEn: product.ProductDescriptionDetailEn,
            MeadiaTitle: product.MeadiaTitle,
            MeadiaDescription: product.MeadiaDescription,
            ProductGroupName: product?.GroupProduct?.GroupNameEn,
            ProductGroupId: product?.GroupProduct?.GroupProductId,
            ProductModelName: product?.ModelProduct?.ModelNameEn,
            ProductModelId: product?.ModelProduct?.ModelProductId,
            SupplierId: product.SupplierId,
            SupplierNameTh: product.Supplier.SupplierNameTh,
            SupplierNameEn: product.Supplier.SupplierNameEn,
            SupplierImage: product.Supplier.SupplierImage,
            SupplierDesctipitationEN: product.Supplier.SupplierDescriptionEN,
            SupplierDesctipitationTH: product.Supplier.SupplierDescriptionTH,
            ProductVideo: product.ProductVideo,
            ProductUpVideo: product.ProductUpVideo,
            ProductImageMain: product.ProductImage,
            ProductImageChildren: product.ProductImages.map(image => ({
                ProductImageNameTh: image.ProductImageNameTh,
                ProductImageNameEn: image.ProductImageNameEn,
                productImageImage: image.ProductImageImage,
                Active: image.Active,
                CreateBy: image.CreateBy,
                UpdateBy: image.UpdateBy,
            })),
            PresentFile: product.PresentFile,
            CreateDate: product.CreateDate,
            ExpireDate: product.Expiredate,
            frmDate: formatDate(product.CreateDate),
            CreateBy: product.CreateBy,
            UpdateBy: product.UpdateBy,
            Active: product.Active
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

exports.getPresentUserByProduct = async (req, res) => {
    try{
    const ProductIdRequest = Number(req.params.productID);

    const presentationFileResponse = await prisma.presentationFile.findMany({
        where:{
            ProductId: ProductIdRequest
        },
        select:{
            id: true,
            FileName: true,
            FilePath: true,
            PresentationKPI: {
                select: {
                    UserId: true,
                    PresentFileId:true,
                }
            },
        }
    })

    const userCountMap = {};

    presentationFileResponse.forEach(file => {
        file.PresentationKPI.forEach(kpi => {
            const userId = kpi.UserId;
            if (!userCountMap[userId]) {
            userCountMap[userId] = 0;
            }
            userCountMap[userId]++;
        });
    });

    const userCountsArray = Object.entries(userCountMap).map(([userId, count]) => ({
        userId,
        count
    }));

    const userIds = userCountsArray.map(u => u.userId);

    const responseUser = await prisma.users.findMany({
        where:{
            ldapUserId:{in:userIds}
        },
        select: { 
            ldapUserId: true,
            fullname: true,             
            picture: true,   
            email: true,    
  }
    })

    const userInfo = {};
    responseUser.forEach(user => {
        userInfo[user.ldapUserId] = user;
    });

    const userPresentation = userCountsArray.map(({ userId, count }) => {
        return {
            count,
            ...userInfo[userId],
        };
    });

    res.status(200).json({
            message: 'Get qty of product present successfully.',
            data: userPresentation,
        });
    } catch (error) {
        console.error('Error qty of product present:', error);
        res.status(500).json({
            message: 'Failed to get qty of product present',
            error: error.message,
        });
    }
}

exports.getProductBySuplId = async (req, res) => {
    try {
        const suplId = parseInt(req.params.supplierId);
        const UserData = String(DecryptToken(req).user.id);
        const prdData = await prisma.product.findMany({
            where: { SupplierId: suplId },
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
                        SupplierNameTh: true
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

        const favProductIds = await prisma.favorite.findMany({
            where: {
                UserID: parseInt(UserData),
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
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Failed to retrieve product',
            error: error.message,
        });
    }
};

exports.editProductById = async (req, res) => {
    try {
        const ProductId = parseInt(req.params.productID);

        const productUpVideo = req.files.ProductUpVideo ? req.files.ProductUpVideo[0] : null;
        const mainImage = req.files.ProductImageMain ? req.files.ProductImageMain[0] : null;
        const childImages = req.files.ProductImageChildren || [];
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        
        const {
            SupplierId, CompanyId, BuId,
            GroupProductId, ModelProductId,
            ProductNameTh, ProductNameEn,
            ProductDescriptionHeaderTh, ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn, ProductDescriptionDetailEn,
            ProductVideo, ProductCode, MediaDescription, MediaTitle,
            Active, RemoveVideo, RemoveImageMain, RemoveImageChildren, RemovePresentFileChildren,
            UpdateBy, ExpireDate
        } = req.body;
        
        const existingProduct = await prisma.product.findUnique({
            where: { ProductId },
            include: { ProductImages: true },
        });

        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        const suplId = SupplierId ? parseInt(SupplierId) : null;
        const grupId = GroupProductId ? parseInt(GroupProductId) : null;
        const mdlId = ModelProductId ? parseInt(ModelProductId) : null;
        const formattedExpireDate = ExpireDate ? new Date(ExpireDate).toISOString() : null;

        if (suplId) {

            const suplExist = await prisma.supplier.findFirst({
                where: { SupplierId: suplId },
            });

            if (!suplExist) {
                return res.status(404).json({
                    message: `Supplier's id ${suplId} is not found.`
                });
            }

        }

        if (grupId) {

            const grupExist = await prisma.groupProduct.findFirst({
                where: { GroupProductId: grupId },
            });

            if (!grupExist) {
                return res.status(404).json({
                    message: `Group's id ${grupId} is not found.`
                });
            }

        }

        if (mdlId) {

            const mdlExist = await prisma.modelProduct.findFirst({
                where: { ModelProductId: mdlId },
            });

            if (!mdlExist) {
                return res.status(404).json({
                    message: `Model's id ${mdlId} is not found.`
                });
            }

        }

        // อัปเดตข้อมูลของสินค้าหลัก
        const updatedProduct = await prisma.product.update({
            where: { 
                ProductId: Number(ProductId),
             },
            data: {
                CompanyId: Number(CompanyId) || existingProduct.CompanyId,
                SupplierId: Number(suplId) || existingProduct.SupplierId,
                GroupProductId: Number(GroupProductId) || null,
                ModelProductId: Number(ModelProductId) || null,
                ProductNameTh: ProductNameTh || null,
                ProductNameEn: ProductNameEn || null,
                ProductNo: ProductCode,
                BuId: BuId ? Number(BuId) : existingProduct.BuId,
                ProductImage: mainImage ? mainImage.filename : existingProduct.ProductImage,
                ProductUpVideo: productUpVideo ? productUpVideo.filename : existingProduct.ProductUpVideo,
                ProductDescriptionHeaderTh: ProductDescriptionHeaderTh || null,
                ProductDescriptionDetailTh: ProductDescriptionDetailTh || null,
                ProductDescriptionHeaderEn: ProductDescriptionHeaderEn || null,
                ProductDescriptionDetailEn: ProductDescriptionDetailEn || null,
                MeadiaTitle: MediaTitle,
                MeadiaDescription: MediaDescription,
                ProductVideo: ProductVideo || null,
                Active: Active === 'true' || Active === true,
                UpdateBy: UserData,
                Expiredate: formattedExpireDate || null
            },
            include: { ProductImages: true },
        });    

        if(RemoveImageMain === 'true'){
            await prisma.product.update({
                where: {
                    ProductId: Number(ProductId),
                },
                data: {
                    ProductImage: null,
                },
            })

            await existingProduct.ProductImage ? fs.unlinkSync(`./uploads/Images/${existingProduct.ProductImage}`) : null;
        }

        if (RemoveImageChildren && RemoveImageChildren.length > 0) {
            const imageList = Array.isArray(RemoveImageChildren)
                ? RemoveImageChildren.flatMap(item => item.split(',').map(s => s.trim()))
                : RemoveImageChildren
                    ? RemoveImageChildren.split(',').map(s => s.trim())
                    : [];

            const deletedChildImages = await prisma.productImage.findMany({
                where: {
                    ProductImageImage: {
                        in: imageList
                    }
                }
            });

            await prisma.productImage.deleteMany({
                where: {
                    ProductImageImage: {
                        in: imageList
                    }
                }
            });

            deletedChildImages.forEach(image => {
                if (image.ProductImageImage) {
                    fs.unlinkSync(`./uploads/Images/${image.ProductImageImage}`);
                }
            });
        }

        if (RemovePresentFileChildren && RemovePresentFileChildren.length > 0) {
            const presentFileList = Array.isArray(RemovePresentFileChildren)
                ? RemovePresentFileChildren.flatMap(item => item.split(',').map(s => s.trim()))
                : RemovePresentFileChildren
                    ? RemovePresentFileChildren.split(',').map(s => s.trim())
                    : [];

            const deletedChildPresentFiles = await prisma.presentationFile.findMany({
                where: {
                    FileName: {
                        in: presentFileList
                    }
                }
            });

            await prisma.presentationFile.deleteMany({
                where: {
                    FileName: {
                        in: presentFileList
                    }
                }
            });

            deletedChildPresentFiles.forEach(file => {
                if (file.FileName) {
                    fs.unlinkSync(`./uploads/Files/${file.FileName}`);
                }
            });
        }


        if (RemoveVideo === 'true') {
            await prisma.product.update({
                where: {
                    ProductId: Number(ProductId),
                },
                data: {
                    ProductUpVideo: null,
                },
            })

            await existingProduct.ProductUpVideo ? fs.unlinkSync(`./uploads/Videos/${existingProduct.ProductUpVideo}`) : null;
        }

        const newImages = [];

        for (const image of childImages) {

            const newImage = await prisma.productImage.create({

                data: {

                    ProductId,
                    ProductImageNameTh: image.originalname,
                    ProductImageNameEn: image.originalname,
                    ProductImageImage: image.filename,
                    Active: true,
                    CreateBy: UserData,
                    UpdateBy: UserData

                }

            })

            newImages.push(newImage);

        }

        const response = {
            ProductId: updatedProduct.ProductId,
            SupplierId: updatedProduct.SupplierId,
            ProductNameTh: updatedProduct.ProductNameTh,
            ProductNameEn: updatedProduct.ProductNameEn,
            MeadiaTitle: updatedProduct.MeadiaTitle,
            MeadiaDescription: updatedProduct.MeadiaDescription,
            ProductNo: updatedProduct.ProductNo,
            BuId: updatedProduct.BuId,
            ProductDescriptionHeaderTh: updatedProduct.ProductDescriptionHeaderTh,
            ProductDescriptionDetailTh: updatedProduct.ProductDescriptionDetailTh,
            ProductDescriptionHeaderEn: updatedProduct.ProductDescriptionHeaderEn,
            ProductDescriptionDetailEn: updatedProduct.ProductDescriptionDetailEn,
            ProductVideo: updatedProduct.ProductVideo,
            ProductUpVideo: updatedProduct.ProductUpVideo,
            ProductImageMain: updatedProduct.ProductImage,
            ProductImageChildren: newImages.map(image => ({
                ProductImageNameTh: image.ProductImageNameTh,
                ProductImageNameEn: image.ProductImageNameEn,
                productImageImage: image.ProductImageImage,
                Active: image.Active,
                CreateBy: image.CreateBy,
                UpdateBy: image.UpdateBy,
            })),
            CreateBy: updatedProduct.CreateBy,
            UpdateBy: updatedProduct.UpdateBy,
            ExpireDate: updatedProduct.Expiredate,
            Updatedate: updatedProduct.UpdateDate,
        };

        res.status(200).json({
            message: 'Product updated successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            message: 'Failed to update product',
            error: error.message,
        });
    }
};

exports.delProductById = async (req, res) => {
    try {

        const prdId = parseInt(req.params.productID);

        const prdExist = await prisma.product.findUnique({
            where: { ProductId: prdId },
            select: {
                ProductId: true,
                ProductNameTh: true,
                ProductNameEn: true,
            },
        });

        if (!prdExist) {
            return res.status(404).json({
                message: `Product with ID ${prdId} not found`,
            });
        }

        const prdFlExist = await prisma.productFolder.findMany({
            where: { ProductId: prdId },
            select: { ProductFolderId: true }
        });

        const folderIds = prdFlExist.map(folder => folder.ProductFolderId);

        if (folderIds.length > 0) {

            await prisma.productFile.deleteMany({
                where: { ProductFolderId: { in: folderIds } }
            });

            await prisma.productFolder.deleteMany({
                where: { ProductId: prdId }
            });

        }

        await prisma.productImage.deleteMany({
            where: { ProductId: prdId },
        });

        await prisma.product.delete({
            where: { ProductId: prdId },
        });

        return res.status(200).json({
            message: `Delete Product successfully`,
            body: prdExist
        });

    } catch (error) {
        console.error("deleting Product by ID Error :", error);
        return res.status(500).json({
            message: "Failed to delete {Product}",
            error: error.message,
        });
    }
};

exports.editProductByIdNoChildDelete = async (req, res) => {
    try {

        const ProductId = parseInt(req.params.productID);
        const childImages = req.files.ProductImageChildren || [];
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        const existingProduct = await prisma.product.findUnique({
            where: { ProductId },
            include: { ProductImages: true },
        });

        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        const newImages = [];

        for (const image of childImages) {

            const newImage = await prisma.productImage.create({

                data: {

                    ProductId,
                    ProductImageNameTh: image.originalname,
                    ProductImageNameEn: image.originalname,
                    ProductImageImage: image.filename,
                    Active: true,
                    CreateBy: UserData,
                    UpdateBy: UserData

                }

            })

            newImages.push(newImage);

        }

        const response = {
            ProductImageChildren: newImages.map(image => ({
                ProductImageNameTh: image.ProductImageNameTh,
                ProductImageNameEn: image.ProductImageNameEn,
                productImageImage: image.ProductImageImage,
                Active: image.Active,
                CreateBy: UserData,
                UpdateBy: UserData,
            })),
        };

        res.status(200).json({
            message: 'Children Images Added successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error Adding Children Images:', error);
        res.status(500).json({
            message: 'Failed to Add Children Images',
            error: error.message,
        });
    }
};