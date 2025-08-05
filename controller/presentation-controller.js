const { PrismaClient } = require('@prisma/client');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');

const prisma = new PrismaClient();

exports.createPresentationFile = async (req, res) => {
    try {
        const { ProductId } = req.body;
        const presentFile = req.files.presentFile || []; 
        let response = [];

        const recheckProduct = await prisma.product.findFirst({
            where: {
                ProductId: Number(ProductId),
            },
            select: {
                ProductId: true,
                ProductNameEn: true,
            }
        });

        if (!recheckProduct) throw "this id of product not found";

        for (const file of presentFile) {
            const createPresentFile = await prisma.presentationFile.create({
                data: {
                    ProductId: Number(ProductId),
                    FileName: file.filename,
                    FileOriginalName: file.originalname,
                    FilePath: file.path,
                }
            });

            response.push(createPresentFile);
        }

        return sendResponse(res, "Creating new PresentationFile successfully.", response, 201);
    } catch (error) {
        return handleError(res, "Creating new PresentationFile Failed.", error, 500);
    }
}