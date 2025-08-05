const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const USERMANAGE_API = process.env.USERMANAGE_API;

const DecryptToken = async (req) => {
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) {
        return null;
    }

    const UserData = jwt.verify(token, process.env.SECRET_JWT);
    const Ldaptoken = UserData.user.data.token;

    if (!Ldaptoken) {
        return null;
    }

    const User = await axios.get(`${USERMANAGE_API}/authentication/myprofile`,{
        headers: {
            Authorization: `Bearer ${Ldaptoken}`,
        },
    });

    const getRole = await prisma.users.findFirst({
        where: {
            ldapUserId: UserData.user.data.userId,
        },
        include: {
            userRole: true,
        }
    });
    
    const userInfo = {
        user: {
            username: User?.data.data.username,
            fullname: User?.data.data.name,
            email: User.data.data.email,
            id: User.data.data.userId,
            role: getRole?.userRole?.nameEng ? getRole?.userRole?.nameEng : 'User Not Role',
            picture: User.data.data.picture,
        }
    };
        
    return userInfo;
};

module.exports = DecryptToken;