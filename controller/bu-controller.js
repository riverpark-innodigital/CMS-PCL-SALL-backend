const handleError = require('../hooks/handleError');
const setResponse = require('../hooks/sendResponse');
const DecryptToken = require('../hooks/decryptJWT');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createNewBu = async (req, res) => {
    try {
        const { name, description, Active } = req.body;
        const userInfo = await DecryptToken(req);
        const user = userInfo.user.fullname;
        const ConvertActive = (Active === 'true' || Active);
    
        const recheckBU = await prisma.businessUnit.findFirst({
            where: {
                Name: {
                    mode: 'insensitive',
                    endsWith: name,
                },
            }
        });

        if (recheckBU) {
            throw "This name already exists in the system.";
        }

        const response = await prisma.businessUnit.create({
            data: {
                Name: name,
                Description: description,
                Active: ConvertActive,
                CreateBy: user,
                UpdateBy: user,
            }
        });

        return setResponse(res, "Creating a new business unit successfully!", response, 201);
    } catch (err) {
        return handleError(res, "Creting a new business unit failed.", err, 500);
    }
};

exports.findBUs = async (req, res) => {
    try {
        const response = await prisma.businessUnit.findMany({
            orderBy: [
                {
                    BusinessUnitId: 'desc',
                }
            ]
        });

        return setResponse(res, "Getting all business unit successfully!", response, 200);
    } catch (error) {
        return handleError(res, "Getting all business unit failed!", err, 500);
    }
};

exports.findBUbyId = async (req, res) => {
    try {
        const { buid } = req.params;

        const response = await prisma.businessUnit.findFirst({
            where: {
                BusinessUnitId: Number(buid),
            },
        });

        if (!response) throw "this is business unit not found.";

        return setResponse(res, "Getting business unit by id successfully", response, 200);
    } catch (err) {
        return handleError(res, "Getting business unit by id failed", err, 500);
    }
};

exports.updateBu = async (req, res) => {
    try {
        const { buid } = req.params;
        const { name, description, Active } = req.body;
        const userInfo = await DecryptToken(req);
        const user = userInfo.user.fullname;
        const ConvertActive = (Active === 'true' || Active);

        const recheckBU = await prisma.businessUnit.findFirst({
            where: {
                BusinessUnitId: Number(buid),
            },
        });

        if (!recheckBU) throw " this business unit not found.";

        const existingBUName = await prisma.businessUnit.findFirst({
            where: {
                Name: {
                    mode: 'insensitive',
                    endsWith: name
                },
                NOT: {
                    BusinessUnitId: Number(buid),
                },
            },
        });

        if (existingBUName) throw "This name already exists in the system.";

        const updateBu = await prisma.businessUnit.update({
            where: {
                BusinessUnitId: Number(buid),
            },
            data: {
                Name: name,
                Description: description,
                Active: ConvertActive,
                UpdateBy: user,
            }
        });

        return setResponse(res, "Updating a business unit by id successfully!", updateBu, 200);
    } catch (err) {
        return handleError(res, "Updating a business unit by id failed.", err, 500);
    }
};

exports.deleteBU = async (req, res) => {
    try {
        const { buid } = req.params;

        const recheckBU = prisma.businessUnit.findFirst({
            where: {
                BusinessUnitId: Number(buid)
            }
        });

        if (!recheckBU) throw "this bu id not found in the system.";

        const deletedBU = await prisma.businessUnit.delete({
            where: {
                BusinessUnitId: Number(buid),
            },
        });

        return setResponse(res, "Deleting a business unit by id successfully.", deletedBU, 200);
    } catch (err) {
        return handleError(res, "Deleting a business unit by id failed.", err, 500);
    }
};

exports.gettingCompanyAndBu = async (req, res) => {
    try {
        const result = [];

        const com_bu = await prisma.companys.findMany({
            where: {
                Active: true,
            },
            select: {
                CompanyId: true,
                CompanyNameEN: true,
                BusinessUnits: {
                    select: {
                        BusinessUnit: {
                            select: {
                                Name: true,
                                BusinessUnitId: true,
                            }
                        },
                    }
                }
            }
        });

        for (const com of com_bu) {
            for (const bu of com?.BusinessUnits) {
                result.push({
                    companyId: com.CompanyId,
                    companyName: com.CompanyNameEN,
                    buId: bu.BusinessUnit.BusinessUnitId,
                    buName: bu.BusinessUnit.Name,
                })
            }
        }

        return setResponse(res, "Getting Company and Business successfully", result, 200);
    } catch (error) {
        return handleError(res, "Getting Company and Business failed", error, 500);
    }
}