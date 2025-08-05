const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');
const fs = require('fs');

exports.createCompany = async (req, res) => {
    try {
        const { NameTH, NameEN, DescriptionTH, DescriptionEN, BUNameEN , BUNameTH, Active, BU } = req.body;
        const compamyFile = req.files.compamyFile[0];
        const compamyPicture = req.files.compamyPicture[0];
        const ConvertActive = (Active === 'true' || Active);
        const userInfo = await DecryptToken(req);
        const user = userInfo.user.fullname;
        const buconverted = BU.split(',');    
        let   buArr = [];    

        const existCompanyName = await prisma.companys.findFirst({
            where: {
                CompanyNameEN: {
                    mode: 'insensitive',
                    endsWith: NameEN
                },
            }
        });

        if (existCompanyName) throw "This Company name exist already in the system.";

        const response = await prisma.companys.create({
            data: {
                CompanyNameTH: NameTH,
                CompanyNameEN: NameEN,
                CompanyNameFile: compamyFile ? compamyFile.filename : null,
                CompamyPicture: compamyPicture ? compamyPicture.filename : null,
                CompamyPictureName: compamyPicture ? compamyPicture.originalname : null,
                DescriptionTH: DescriptionTH,
                DescriptionEN: DescriptionEN,
                Active: ConvertActive === true ? true : false,
                CreateBy: user,
                UpdateBy: user,
            },
        });

        if (!response) throw "have problem in the creating company";

        if (buconverted.length !== 0) {
            for (const buid of buconverted) {
                if (buid) {
                    const buCreation = await prisma.companyBusinessUnit.create({
                        data: {
                            companyId: Number(response.CompanyId),
                            businessUnitId: Number(buid),
                        }
                    });

                    const buResult = await prisma.companyBusinessUnit.findFirst({
                        where: {
                            businessUnitId: buCreation.businessUnitId,
                        },
                        select: {
                            cmuId: true,
                            businessUnitId: true,
                            companyId: true,
                            BusinessUnit: {
                                select: {
                                    BusinessUnitId: true,
                                    Name: true,
                                }
                            },
                        }
                    });

                    buArr.push(buResult);
                }
            }
        }

        const responseFormat = {
            ...response,
            BusinessUnits: buArr,
        }

        return sendResponse(res, "Company created successfully", responseFormat, 201);
    } catch (error) {
        return handleError(res, "Error creating company", error, 500);
    }
}; 


exports.gettingCompanys = async (req, res) => {
    try {
        const response = await prisma.companys.findMany({
            orderBy: [
                {
                    CompanyId: 'desc',
                },
            ],
            select: {
                CompanyId: true,
                CompanyNameEN: true,
                CompanyNameTH: true,
                CompamyPicture: true,
                CompamyPictureName: true,
                CompanyNameFile: true,
                CreateBy: true,
                CreateDate: true,
                UpdateBy: true,
                UpdateDate: true,
                Active: true,
                BusinessUnits: {
                    select: {
                        cmuId: true,
                        businessUnitId: true,
                        companyId: true,
                        BusinessUnit: {
                            select: {
                                BusinessUnitId: true,
                                Name: true,
                            }
                        },
                    }
                }
            }
        });

        if (!response) throw {
            message: "Can't query company data because there are no data in the database.",
            status: 404,
        };

        return sendResponse(res, "Getting All company successfully", response, 200);
    } catch (error) {
        return handleError(res, "getting companys faild", error.message || error, error.status || 500)
    }
};

exports.gettingCompanysById = async (req, res) => {
    try {
        const { CompanyID } = req.params;

        const response = await prisma.companys.findUnique({
            where: {
                CompanyId: Number(CompanyID),
            },
            select: {
                CompanyId: true,
                CompanyNameEN: true,
                CompanyNameTH: true,
                CompamyPicture: true,
                CompamyPictureName: true,
                CompanyNameFile: true,
                CreateBy: true,
                CreateDate: true,
                UpdateBy: true,
                UpdateDate: true,
                Active: true,
                DescriptionEN: true,
                BusinessUnits: {
                    select: {
                        cmuId: true,
                        businessUnitId: true,
                        companyId: true,
                        BusinessUnit: {
                            select: {
                                BusinessUnitId: true,
                                Name: true,
                            }
                        },
                    }
                }
            }
        });

        if (!response) throw {
            message: "this company id can't query company data becuase id not found.",
            status: 404,
        }

        return sendResponse(res, "getting company by id successfully.", response, 200);
    } catch (error) {
        return handleError(res, "getting Companys By Id faild.", error.message || error, error.status || 500);
    }
};

exports.updatingCompanyById = async (req, res) => {
    try {
        const { NameTH, NameEN, Code, DescriptionTH, DescriptionEN, Active, BU } = req.body;
        const { CompanyID } = req.params;
        const compamyFile = req?.files?.compamyFile ? req?.files?.compamyFile[0] : null;
        const compamyPicture = req?.files?.compamyPicture ? req?.files?.compamyPicture[0] : null;
        const userInfo = await DecryptToken(req);
        const user = userInfo.user.fullname;
        const ConvertActive = (Active === 'true');
        const buconverted = BU.split(',');
        let   buArr = [];
        
        const reCheckCompany = await prisma.companys.findFirst({
            where: {
                CompanyNameEN: {
                    mode: 'insensitive',
                    endsWith: NameEN
                },
                NOT: {
                    CompanyId: Number(CompanyID),
                }
            }
        });    

        if (reCheckCompany) throw "This Company name exist already in the system.";

        if (compamyFile !== null) {
            await prisma.companys.update({
                where: {
                    CompanyId: Number(CompanyID),
                },
                data: {
                    CompanyNameFile: compamyFile ? compamyFile.filename : null,
                }
            })

            await reCheckCompany?.CompanyNameFile ? fs.unlinkSync(`./uploads/Files/${reCheckCompany?.CompanyNameFile}`) : null;
        }

        if (compamyPicture !== null) {
            await prisma.companys.update({
                where: {
                    CompanyId: Number(CompanyID),
                },
                data: {
                    CompamyPicture: compamyPicture ? compamyPicture.filename : null,
                    CompamyPictureName: compamyPicture ? compamyPicture.originalname : null,
                }
            })

            await reCheckCompany?.CompamyPicture ? fs.unlinkSync(`./uploads/Images/${reCheckCompany?.CompamyPicture}`) : null;
        }

        const response = await prisma.companys.update({
            data: {
                CompanyNameTH: NameTH,
                CompanyNameEN: NameEN,
                DescriptionTH: DescriptionTH,
                DescriptionEN: DescriptionEN,
                Active: ConvertActive === true ? true : false,
                UpdateBy: user,
            },
            where: {
                CompanyId: Number(CompanyID),
            }
        });

        if (!response) throw "have problem in the creating company";


        if (buconverted.length !== 0) {
            await prisma.companyBusinessUnit.deleteMany({
                where: {
                    companyId: Number(CompanyID),
                },
            });

            for (const buid of buconverted) {
                const buCreation = await prisma.companyBusinessUnit.create({
                    data: {
                        companyId: Number(CompanyID),
                        businessUnitId: Number(buid),
                    }
                });

                const buResult = await prisma.companyBusinessUnit.findFirst({
                    where: {
                        businessUnitId: buCreation.businessUnitId,
                    },
                    select: {
                        cmuId: true,
                        businessUnitId: true,
                        companyId: true,
                        BusinessUnit: {
                            select: {
                                BusinessUnitId: true,
                                Name: true,
                            }
                        },
                    }
                });

                buArr.push(buResult);
            }
        }

        const responseFormat = {
            ...response,
            BusinessUnits: buArr,
        }

        return sendResponse(res, "Updating compamy by id successfully", responseFormat, 200);
    } catch (error) {
        return handleError(res, "updating company by id failed.", error.message || error, error.status || 500);
    }
}

exports.deletingCompanyById = async (req, res) => {
    try {
        const { CompanyID } = req.params;

        const reCheckCompany = await prisma.companys.findUnique({
            where: {
                CompanyId: Number(CompanyID),
            }
        });

        if (!reCheckCompany) throw {
            message: "company is not available.",
            status: 404,
        }

        await prisma.suppliers.deleteMany({
            where: {
                CompanyId: Number(CompanyID),
            },
        });

        const response = await prisma.companys.delete({
            where: {
                CompanyId: Number(CompanyID),
            }
        });

        if (!response) throw {
            message: "this company id can't delete company data becuase id not found.",
            status: 500,
        }

        await response?.CompanyNameFile ? fs.unlinkSync(`./uploads/Files/${response.CompanyNameFile}`) : null;
        await response?.CompamyPicture ? fs.unlinkSync(`./uploads/Images/${response.CompamyPicture}`) : null;

        return sendResponse(res, "deleting company by id successfully.", response, 200);
    } catch (error) {
        return handleError(res, "deleting company by id faild.", error.message || error, error.status || 500);
    }
};

exports.getCompanyBySup = async (req, res) => {
    try {
        const { supId } = req.params;

        const response = await prisma.supplierCompany.findMany({
            where: {
                SupplierId: Number(supId),
            },
            select: {
                SuplCpnId: true,
                Company: true,
            }
        });

        return sendResponse(res, "Getting Company by sup successfully.", response, 200);
    } catch (error) {
        return handleError(res, "Getting Company by sup failed.", error.message || error, error.status || 500);
    }
}