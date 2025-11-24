const handleError = require('../../hooks/handleError');
const setResponse = require('../../hooks/sendResponse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.GettingAllPGroup = async (req, res) => {
    try {
        
        const response = await prisma.groupProduct.findMany({
            where: {
                Active: true,
            },
            orderBy: {
                CreateDate: 'asc'
            }
        });

        return setResponse(res, "Getting All Product Group successfully.", response, 200);
    } catch (error) {
        return handleError(res, "Getting All Product Group failed.", error, 500);
    }
}