const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DecryptToken = require('../hooks/decryptJWT');
const { getUserByUsername } = require('../service/user-service');
const { getRoleByRoleId } = require('../service/role-service');

exports.getAllUsers = async (req, res) => {
    try {
        
        const users = await prisma.users.findMany({
            select: {
                id: true,
                username: true,
                fullname: true,
                active: true,
                role: true,
            },
        });

        if (users.length < 1) {
            return res.status(404).json({
                message: `Not found users`,
            });
        }

        return res.status(200).json({
            message: "Getting users successfully",
            body: users,
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await prisma.users.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                username: true,
                fullname: true,
                active: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: `User with ID ${userId} not found`,
            });
        }

        return res.status(200).json({
            message: "Getting user successfully",
            body: user,
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

exports.userCreate = async (req, res) => {
    try {
        const { Username, Password, Name, Active, RoleId } = req.body;
        const hashPassword = await bcrypt.hashSync(Password, 10);
        console.log(hashPassword);
        
        const recheckUser = await prisma.users.findFirst({
            where: {
                OR: [{username: Username}],
            }
        });

        const roleExist = await prisma.roles.findFirst( {
            where: {id: RoleId}
        })

        if (recheckUser || !roleExist) {
            const msg = recheckUser ? "this username already in a system." : "This Role is not exist";
            throw new Error(msg);
        }

        const user = await prisma.users.create({
            data: {
                username: Username,
                password: hashPassword,
                fullname: Name,
                active: Active,
                role: RoleId
            }
        });

        return res.status(201).json({
            message: "User creting successfully",
            body: user,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: "User creting failed",
            error: error.message,
        });
    }
};

exports.userEdit = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { Username, Password, Name, Active, RoleId } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: `User with ID ${userId} not found.`,
            });
        }

        const recheckUser = existingUser.username === Username ? 0 : await prisma.users.findFirst({
            where: {
                OR: [{username: Username}],
            }
        });

        const roleExist = await prisma.roles.findFirst( {
            where: {id: RoleId}
        })

        if (!roleExist || recheckUser) {
            const msg = recheckUser
                ? "this username already in a system."
                : "The Role is not exist";
            throw new Error(msg);
        }

        let hashPassword = existingUser.password;
        if (Password) {
            hashPassword = await bcrypt.hash(Password, 10); // ใช้ `bcrypt.hash` แทน `bcrypt.hashSync`
        }

        const updatedUser = await prisma.users.update({
            where: { id: parseInt(userId) },
            data: {
                username: Username || existingUser.username,
                password: hashPassword,
                fullname: Name,
                active: Active || existingUser.active,
                role: RoleId || existingUser.role,
            },
        });

        return res.status(200).json({
            message: "User updated successfully",
            body: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            message: "User updating failed",
            error: error.message,
        });
    }
};

exports.deleteUserById = async (req, res) => {
    try {

        const userId = req.params.userId

        const existingUser = await prisma.users.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                username: true,
                fullname: true,
                active: true,
                role: true,
            },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: `User with ID ${userId} not found`,
            });
        }

        await prisma.users.delete({
            where: { id: parseInt(userId) },
        });

        return res.status(200).json({
            message: `Deteting user successfully`,
            body: existingUser
        });

    } catch (error) {
        console.error("Error deleting user by ID:", error);
        return res.status(500).json({
            message: "Failed to delete user",
            error: error.message,
        });
    }
};

exports.currentuser = async (req, res) => {
    try {
        const userData = await DecryptToken(req);        
        const dataUser = await getUserByUsername(userData.user.username);
        const dataRole = await getRoleByRoleId(dataUser.role);
        userData.user.role = dataRole.nameEng;

        return res.status(200).json({
            message: "Current agentcy retrieved successfully",
            body: userData,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get current agentcy",
            error: error,
        });
    }
};
