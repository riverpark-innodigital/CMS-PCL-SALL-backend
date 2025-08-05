const DecryptToken = require('../hooks/decryptJWT');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


exports.createUserRole = async (req, res) => {
    try {
        const { nameTH, nameENG, description } = req.body;

        const reCheckRolename = await prisma.roles.findFirst({
            where: {
                OR: [{nameTH: nameTH}, {nameEng: nameENG}],
            }
        });
        
        if (reCheckRolename) throw "this role already exists in the system.";

        const response = await prisma.roles.create({
            data: {
               nameTH: nameTH,
               nameEng: nameENG,
               description: description,
            }
        });

        return res.status(201).json({
            message: "Role created successfully",
            body: response,
         });
    } catch (error) {
        return res.status(500).json({
            message: "Role creating failed",
            error: error,
        });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const response = await prisma.roles.findMany({});

        return res.status(200).json({
            message: "Query all roles successfully!",
            body: response,
         });
    } catch (error) {
        return res.status(500).json({
            message: "query all roles failed",
            error: error,
        });
    }
};