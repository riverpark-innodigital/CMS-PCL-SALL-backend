const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');

exports.folderCreate = async(req, res) => {
    try {

        const { ProductFolderNameTh, ProductFolderNameEn, ProductId, Active, Seq } = req.body;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        // productId of folder is 100% the same so no need to query the database in every member of array
        const productExists = await prisma.product.findUnique({
            where: { ProductId: ProductId },
        });

        if(!productExists) {
            return res.status(404).json({
                message: `Product with ID ${ProductId} is not found.`
            });
        }

        const ConvertActive = (Active === 'true' || Active);
        const flderData = await prisma.productFolder.create({
            data: {
                ProductFolderNameTh: ProductFolderNameTh,
                ProductFolderNameEn: ProductFolderNameEn,
                Active: ConvertActive,
                CreateBy: UserData,
                UpdateBy: UserData,
                ProductId: ProductId,
                ProductFolderSeq: Number(Seq),
            }
        });

        return res.status(201).json({
            message: "Folder creting successfully",
            body: flderData,
        });

    }
    catch(error) {

        console.error("Folder Creating Fail: ", error);
        return res.status(500).json({

            message: "Failed to Creating Folder",
            error: error.message,

        });

    }
}

exports.fileCreate = async(req, res) => {

    try {

        const {

            ProductFileNameTh, ProductFileNameEn,
            Active, CreateBy,
            UpdateBy, ProductFolderId

        } = req.body;

        const ConvertActive = (Active === 'true' || Active);
        const file = req.file;
        const folderExist = await prisma.productFolder.findUnique({
            where: { ProductFolderId: parseInt(ProductFolderId) },
        });
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;   

        if(!folderExist) {

            return res.status(404).json({

                message: `Folder with ID ${ProductFolderId} is not found.`

            });

        }

        const fileData = await prisma.productFile.create({

            data: {

                ProductFileNameTh: ProductFileNameTh,
                ProductFileNameEn: ProductFileNameEn,
                Active: ConvertActive,
                CreateBy: UserData,
                UpdateBy: UserData,
                ProductFolderId: parseInt(ProductFolderId),
                ProductFile: file ? file.filename : null

            }

        });

        return res.status(201).json({

            message: "Product creting successfully",
            body: fileData,

        });

    }
    catch(error) {

        console.error("File Creating Fail: ", error);
        return res.status(500).json({

            message: "Failed to Creating Product File",
            error: error.message,

        });

    }

}

exports.getFolderById = async(req,res) => {

    try {
        const prdFlId = parseInt(req.params.productId);

        const prdFlData = await prisma.productFolder.findMany({
            where: { ProductId: prdFlId },
            select: {
                ProductFolderId: true,
                ProductFolderNameTh: true,
                ProductFolderNameEn: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true,
                ProductFiles: {
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
                ProductFolderSeq: 'desc'
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

exports.getFileByFolder = async(req,res) => {

    try {

        const folderId = parseInt(req.params.folderId);

        const productExist = await prisma.productFile.findFirst({

            where: {ProductFolderId: folderId}

        })

        if(!productExist) {

            return res.status(404).json({

                message: `There is no File Belong to Folder's id ${folderId}.`

            });

        }

        const prdFlData = await prisma.productFile.findMany({
            where: { ProductFolderId: folderId },
            select: {
                ProductFileId: true,
                ProductFileNameTh: true,
                ProductFileNameEn: true,
                ProductFile: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true
            },
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

exports.productFolderUpdate = async(req, res) => {

    try {
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const folders = req.body;

        var i = 1;
        const updatedFolder = [];
        for(let folder of folders) {

            const { ProductFolderNameTh, ProductFolderNameEn, ProductId, Active, UpdateBy, CreateBy, ProductFolderId } = folder;
            const ConvertActive = (Active === 'true' || Active);

            const flderData = await prisma.productFolder.update({
                where: { ProductFolderId: ProductFolderId },
                data: {
                    ProductFolderNameTh: ProductFolderNameTh,
                    ProductFolderNameEn: ProductFolderNameEn,
                    UpdateBy: UserData,
                    ProductFolderSeq: i++
                }

            });

            updatedFolder.push(flderData);

        }

        return res.status(200).json({

            message: "product's Folder Update successfully",
            body: updatedFolder,

        });
        
    }
    catch(error) {

        console.error("product's Folder Update Failed.", error);

        return res.status(500).json({

            message: "Failed to Updating Product's Folder.",
            error: error.message,

        });

    }

}

exports.productFileUpdate = async(req, res) => {

    try {

        const {

            ProductFolderId,
            ProductFileNameTh, ProductFileNameEn,
            Active, UpdateBy

        } = req.body;
    
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;
        const file = req.file;
        const fileId = parseInt(req.params.fileId);
        const ConvertActive = (Active === 'true' || Active === true ? true : false);

        const fileExist = await prisma.productFile.findFirst({
            where: { ProductFileId: fileId },
        });
        
        const folderExist = await prisma.productFolder.findFirst({
            where: { ProductFolderId: parseInt(ProductFolderId) },
        });

        if(!(fileExist && folderExist)) {

            return res.status(404).json({

                message: fileExist ? `Folder's id ${ProductFolderId} is not found` : `File's id ${fileId} is not found.`

            });

        }

        const fileData = await prisma.productFile.update({

            where: { ProductFileId: fileId },
            data: {

                ProductFolderId: parseInt(ProductFolderId),
                ProductFileNameTh: ProductFileNameTh,
                ProductFileNameEn: ProductFileNameEn,
                Active: ConvertActive,
                UpdateBy: UserData,
                ProductFile: file ? file.filename : fileExist.ProductFile

            }

        });

        return res.status(200).json({

            message: "product's File Update successfully",
            body: fileData,

        });
        
    }
    catch(error) {

        console.error("product's File Update Failed.", error);

        return res.status(500).json({

            message: "Failed to Updating Product's File.",
            error: error.message,

        });

    }

}

exports.delFolder = async (req, res) => {
    try {

        const folderId = parseInt(req.params.folderId);

        const flderData = await prisma.productFolder.findUnique({
            where: { ProductFolderId: folderId },
        });

        if (!flderData) {
            return res.status(404).json({
                message: `Folder with ID ${folderId} not found`,
            });
        }

        await prisma.productFile.deleteMany({
            where: { ProductFolderId: folderId },
        });

        await prisma.productFolder.delete({
            where: { ProductFolderId: folderId },
        });

        return res.status(200).json({
            message: `Delete Folder Successfully`,
            body: { flderData }
        });

    } catch (error) {
        console.error("deleting Folder Error :", error);
        return res.status(500).json({
            message: "Failed to delete Folder",
            error: error.message,
        });
    }
};

exports.delFile = async (req, res) => {
    try {

        const fileId = parseInt(req.params.fileId);

        const fileData = await prisma.productFile.findUnique({
            where: { ProductFileId: fileId },
            select: { ProductFileId: true, ProductFileNameTh: true, ProductFileNameEn: true }
        });

        if (!fileData) {
            return res.status(404).json({
                message: `File with ID ${fileId} not found`,
            });
        }

        await prisma.productFile.delete({
            where: { ProductFileId: fileId },
        });

        return res.status(200).json({
            message: `Delete File Successfully`,
            body: fileData
        });

    } catch (error) {
        console.error("deleting File Error :", error);
        return res.status(500).json({
            message: "Failed to delete File",
            error: error.message,
        });
    }
};