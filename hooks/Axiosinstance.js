const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const BaseUrl = process.env.USERMANAGE_API;

exports.AxiosInstance = async (req) => {
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) {
        return null;
    }

    const UserData = await jwt.verify(token, process.env.SECRET_JWT);
    const Ldaptoken = UserData.user.data.token;

    if (!Ldaptoken) {
        return null;
    }

    return axios.create({
        baseURL: BaseUrl,
        timeout: 50000,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Ldaptoken}`,
        },
    });
}