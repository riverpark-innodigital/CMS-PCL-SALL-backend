const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');

exports.favoriteCreate = async(req, res) => {

    try {

        const { ObjectId, ObjectType } = req.body;
        const data = await DecryptToken(req);
        const UserData = data.user.id;  

        const favData = await prisma.favorite.create({

            data: {

                UserID: UserData,
                ObjectID: parseInt(ObjectId),
                ObjectType: ObjectType,
                Active: true

            }

        });

        return res.status(201).json({

            message: "Add Favorite successfully",
            body: favData,

        });

    }
    catch(error) {

        console.error("Add Favorite Fail: ", error);
        return res.status(500).json({

            message: "Failed to Add Favorite",
            error: error.message,

        });

    }

}

exports.unFavorite = async (req, res) => {

    try {

        const { ObjectId, ObjectType } = req.body;

        const favData = await prisma.favorite.deleteMany({
            where: {
                ObjectID: parseInt(ObjectId),
                ObjectType: ObjectType
            },
        });

        return res.status(200).json({
            message: `unfavorite successfully`,
            body: favData
        });

    } catch (error) {
        console.error("unfavorite Error :", error);
        return res.status(500).json({
            message: "Failed to unfavorite",
            error: error.message,
        });
    }
    
};