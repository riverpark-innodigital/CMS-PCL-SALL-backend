const handleError = require('../../hooks/handleError');
const setResponse = require('../../hooks/sendResponse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.GettingSupplierByProductGorup = async (req, res) => {
    try {
        const { pgroupId } = req.params;
        let supArr = [];
        
        const response = await prisma.groupProduct.findFirst({
            where: {
                GroupProductId: Number(pgroupId),
            },
            select: {
                GroupProductId: true,
                GroupNameEn: true,
                ProductGroupSup: {
                    select: {
                        Supplier: true,
                    }
                }
            }
        });

        if (response.ProductGroupSup.length !== 0) {
            for (const sup of response.ProductGroupSup) {
                if (sup.Supplier.Active) supArr.push(sup.Supplier);
            }
        }

        const responFormat = {
            GroupProductId: response.GroupProductId,
            GroupNameEn: response.GroupNameEn,
            Supplier: supArr,
        }

        return setResponse(res, "Getting Supplier by product group successfully.", responFormat, 200);
    } catch (err) {
        return handleError(res, "Getting Supplier by product group failed.", err, 500);
    }
};

