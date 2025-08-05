const { PrismaClient } = require('@prisma/client');
const handleError = require('../hooks/handleError');
const sendResponse = require('../hooks/sendResponse');
const { AxiosInstance } = require('../hooks/Axiosinstance');

const prisma = new PrismaClient();

exports.GettingUserDirectory = async (req, res) => {
    try {
        const axios = await AxiosInstance(req);

        const userDirectory = await axios.get('/user-management/directory/users');
        const ldapUserres = await axios.post('/user-management/search?limit=1000&page=1&sortBy=updateDt&sortOrder=1');
        const ldapUsers = ldapUserres?.data?.data?.items || [];
        const ldapDereactory = userDirectory.data.data || [];

        // Create a Set of usernames from ldapUsers
        const userUsernames = new Set(ldapUsers.map(user => user.name));

        // Filter ldapDereactory: keep only those whose username is not in ldapUsers
        const filteredLdapDirectory = ldapDereactory.filter(user => !userUsernames.has(user.name));        
        
        return sendResponse(res, "Getting user directory", filteredLdapDirectory, 200);
    } catch (error) {
        return handleError(res, "Error getting user directory", error, 500);
    }
};

exports.gettingUserByRole = async (req, res) => {
    try {
        const { role } = req.params;

        const response = await prisma.roles.findFirst({
            where: {
                nameEng: role,
            },
            select: {
                nameEng: true,
                user: true,
            }
        });

        return sendResponse(res,  "Getting the users by role name successfully.", response, 200);
    } catch (err) {
        return handleError(res, "Getting the users by role name failed.", err, 500);
    }
}

exports.gettingUserById = async (req, res) => {
    try {
        const { ldapUserId } = req.params;
        let users;

        users = await prisma.users.findFirst({
            where: {
                ldapUserId: ldapUserId,
            },
            select: {
                id: true,
                fullname: true,
                ldapUserId: true,
                email: true,
                role: true,
                active: true,
                username: true,
                updatedAt: true,
                SaleTeam: {
                    select: {
                        SaleTeam: {
                            select: {
                                SaleTeamName: true
                            }
                        }
                    }
                },
                userRole: {
                    select: {
                        id: true,
                        nameEng: true
                    }
                }
            }
        });

        if (users === null) {
            const axios = await AxiosInstance(req);

            const getUserFormLdap = await axios.get(`/user-management/users/${ldapUserId}`);
            console.log(getUserFormLdap.data.data);
            users = {
                name: getUserFormLdap.data.data.name,
                username: getUserFormLdap.data.data.username,
                email: getUserFormLdap.data.data.email,
            }
        }

        return sendResponse(res, "Getting users by id successfully completed", users, 200);
    } catch (error) {
        return handleError(res, "Error getting users by id.", error, 500);
    }
}

exports.gettingAllUsers = async (req, res) => {
    try {
        const axios = await AxiosInstance(req);
        
        const ldapUserres = await axios.post('/user-management/search?limit=1000&page=1&sortBy=updateDt&sortOrder=1');
        const ldapUsers = ldapUserres?.data?.data?.items || [];

        const users = await prisma.users.findMany({
            select: {
                id: true,
                fullname: true,
                ldapUserId: true,
                active: true,
                updatedAt: true,
                handlerBy: true,
                SaleTeam: {
                    select: {
                        SaleTeam: {
                            select: {
                                SaleTeamName: true,
                                UserManager: {
                                    select: {
                                        fullname: true,
                                    }
                                }
                            }
                        }
                    }
                },
                userRole: {
                    select: {
                        nameEng: true
                    }
                }
            }
        });

        // Create a Map keyed by ldapUserId
        const userMap = new Map(users.map(u => [u.ldapUserId, u]));

        // Map over LDAP users and attach matching app user
        const enrichedUsers = ldapUsers.map(user => {
            const matchedUser = userMap.get(user.userId);
            return {
                ...user,
                appUser: matchedUser || null
            };
        });

        // Sort so that users with an appUser come first
        enrichedUsers.sort((a, b) => {
            // put users with appUser (non-null) before those with null
            if (a.appUser && !b.appUser) return -1;
            if (!a.appUser && b.appUser) return 1;
            return 0; // maintain order if both have or both don't
        });

        return sendResponse(res, "Getting all users successfully completed", enrichedUsers, 200);
    } catch (error) {
        return handleError(res, "Error getting all users", error, 500);
    }
}

exports.addnewSingleUser = async (req, res) => {
    try {
        const { ldapUsername, ldapName, role, email, handleId, status } = req.body;
        const ConvertActive = (status === 'true' || status);
        const axios = await AxiosInstance(req);

        const response = await axios.post('/user-management/users', {
            username: ldapUsername,
            name: ldapName,
            email: email,
            role: Number(role) === 1 ? "ADMIN" : "ADMIN",
            status: "active",
            handleId: handleId,
            customers: [
                "CUST001",
                "CUST002"
            ]
        });

        console.log(response?.data);
        
        if (response.status !== 200) throw "Added user data to ldap server failed.";
    
        const createNewUser = await prisma.users.create({
            data: {
                username: ldapUsername,
                fullname: ldapName,
                handlerBy: handleId,
                email: email,
                ldapUserId: response?.data?.data?.id,
                active: ConvertActive,
                role: Number(role),
            }
        });

        if (!createNewUser) throw "createNewUser failed";

        const users = await prisma.users.findFirst({
            where: {
                ldapUserId: createNewUser?.ldapUserId,
            },
            select: {
                id: true,
                fullname: true,
                ldapUserId: true,
                active: true,
                updatedAt: true,
                handlerBy: true,
                SaleTeam: {
                    select: {
                        SaleTeam: {
                            select: {
                                SaleTeamName: true
                            }
                        }
                    }
                },
                userRole: {
                    select: {
                        nameEng: true
                    }
                }
            }
        });
        
        return sendResponse(res, "Adding new user successfully completed", users, 200);
    } catch (error) {
        return handleError(res, "Error adding new user", error, 500);
    }
};

exports.addNewMultipleUser = async (req, res) => {
    try {
        const { UserdataArr, role, handleId } = req.body;
        let DataArr = [];
        const axios = await AxiosInstance(req);

        for (const user of UserdataArr) {        
            const response = await axios.post('/user-management/users', {
                username: user.ldapUsername,
                name: user.ldapName,
                email: user.email,
                role: Number(role) === 1 ? "ADMIN" : "ADMIN",
                status: "active",
                handleId: handleId,
                customers: [
                    "CUST001",
                    "CUST002"
                ]
            });        
    
            if (response.status !== 200) throw "Added user data to ldap server failed.";
    
            const createNewUser = await prisma.users.create({
                data: {
                    username: user.ldapUsername,
                    fullname: user.ldapName,
                    handlerBy: handleId,
                    email: user.email,
                    ldapUserId: response?.data?.data?.id,
                    role: Number(role),
                }
            });

            console.log(createNewUser);
            
    
            if (!createNewUser) throw "createNewUser failed";
    
            const users = await prisma.users.findFirst({
                where: {
                    ldapUserId: createNewUser?.ldapUserId,
                },
                select: {
                    id: true,
                    fullname: true,
                    ldapUserId: true,
                    active: true,
                    updatedAt: true,
                    handlerBy: true,
                    SaleTeam: {
                        select: {
                            SaleTeam: {
                                select: {
                                    SaleTeamName: true
                                }
                            }
                        }
                    },
                    userRole: {
                        select: {
                            nameEng: true
                        }
                    }
                }
            });

            DataArr.push(users);
        }
        
        return sendResponse(res, "Adding new user successfully completed", DataArr, 200);
    } catch (error) {
        return handleError(res, "Error adding new user", error, 500);
    }
}


exports.updateUserOld = async (req, res) => {
    try {
        const { ldapUsername, ldapName, role, email, handleId } = req.body;
        const { ldapUserId } = req.params;

        const axios = await AxiosInstance(req);

        const response = await axios.put('/user-management/users', {
            username: ldapUsername,
            name: ldapName,
            email: email,
            role: Number(role) === 1 ? "ADMIN" : "ADMIN",
            status: "active",
            customers: [
                "CUST001",
                "CUST002"
            ]
        });

        if (response.status !== 200) throw "Added user data to ldap server failed.";

        const updateNewuser = await prisma.users.update({
            where: {
                ldapUserId: response?.data?.data?.id,
            },
            data: {
                username: ldapUsername,
                fullname: ldapName,
                email: email,
                handlerBy: handleId,
                role: Number(role),
            }
        });

        if (!updateNewuser) throw "createNewUser failed";

        const users = await prisma.users.findFirst({
            where: {
                ldapUserId: ldapUserId,
            },
            select: {
                id: true,
                fullname: true,
                ldapUserId: true,
                active: true,
                updatedAt: true,
                handlerBy: true,
                SaleTeam: {
                    select: {
                        SaleTeam: {
                            select: {
                                SaleTeamName: true
                            }
                        }
                    }
                },
                userRole: {
                    select: {
                        nameEng: true
                    }
                }
            }
        });
        
        return sendResponse(res, "Adding new user successfully completed", users, 200);
    } catch (error) {
        return handleError(res, "Error adding new user", error, 500);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { ldapUsername, ldapName, email, role, status } = req.body;
        const ConvertActive = (status === 'true' || status);
        const { userId } = req.params;
        let result = [];

        const reCheckUserId = await prisma.users.findFirst({
            where: {
                ldapUserId: userId,
            },
        });

        if (!reCheckUserId) {
            const createNewUser = await prisma.users.create({
                data: {
                    username: ldapUsername,
                    fullname: ldapName,
                    email: email,
                    ldapUserId: userId,
                    active: ConvertActive === true ? true : false,
                    role: Number(role),
                }
            });

            if (!createNewUser) throw "createNewUser failed";

            const users = await prisma.users.findFirst({
                where: {
                    ldapUserId: createNewUser?.ldapUserId,
                },
                select: {
                    id: true,
                    fullname: true,
                    ldapUserId: true,
                    active: true,
                    updatedAt: true,
                    handlerBy: true,
                    SaleTeam: {
                        select: {
                            SaleTeam: {
                                select: {
                                    SaleTeamName: true
                                }
                            }
                        }
                    },
                    userRole: {
                        select: {
                            nameEng: true
                        }
                    }
                }
            });

            result = users;
        }

        if (reCheckUserId) {       
        
            const updateUserData = await prisma.users.updateMany({
                where: {
                    ldapUserId: userId,
                },
                data: {
                    email: email,
                    role: role,
                    active: ConvertActive === true ? true : false,
                }
            });

            console.log('test');
            

            const users = await prisma.users.findFirst({
                where: {
                    ldapUserId: updateUserData?.ldapUserId,
                },
                select: {
                    id: true,
                    fullname: true,
                    ldapUserId: true,
                    active: true,
                    updatedAt: true,
                    handlerBy: true,
                    SaleTeam: {
                        select: {
                            SaleTeam: {
                                select: {
                                    SaleTeamName: true
                                }
                            }
                        }
                    },
                    userRole: {
                        select: {
                            nameEng: true
                        }
                    }
                }
            });

            result = users;
        }
        
        return sendResponse(res, "Updating the user data successfully", result, 200);
    } catch (error) {
        return handleError(res, "Updating user failed", error, 500);
    }
}

exports.gettinghandlers = async (req, res) => {
    try {
        const handlers = await prisma.users.findMany({
            where: {
                role: 2,
            },
            select: {
                fullname: true,
                ldapUserId: true,
                username: true,
            }
        });

        return sendResponse(res, "Getting handlers successfully completed", handlers, 200);
    } catch (error) {
        return handleError(res, "Error getting handlers", error, 500);
    }
}