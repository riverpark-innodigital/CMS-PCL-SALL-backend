const { PrismaClient } = require("@prisma/client");
const sendResponse = require("../hooks/sendResponse");
const handleError = require("../hooks/handleError");
const DecryptToken = require("../hooks/decryptJWT");

const prisma = new PrismaClient();

exports.createNewGroupPermission = async (req, res) => {
    try {
        const { SaleTeamName, ComId, BUID,  Manager, Sale, Active } = req.body;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        const reCheckPermissions = await prisma.saleTeam.count({
            where: {
                OR: [
                    { SaleTeamName: SaleTeamName },
                ],
            }
        });

        if (reCheckPermissions > 0) throw "This sale team already exists in the system.";

        const newGroupPermission = await prisma.saleTeam.create({
            data: {
                SaleTeamName: SaleTeamName,
                BUID: Number(BUID),
                CompanyId: Number(ComId),
                Manager: Number(Manager),
                CreateBy: UserData,
                UpdateBy: UserData,
                Active: Active ? true : false,
            }
        });

        if (!newGroupPermission) throw "Creating a sale team failed.";

        // maping the sale data to team
        const saleData = await Sale.map((id) => ({
            SaleTeamId: newGroupPermission.id,
            UserID: id,
            CreateBy: UserData,
            UpdateBy: UserData,
        }));

        const createSaleTeam = await prisma.userSaleTeam.createMany({
            data: saleData,
        });

        if (createSaleTeam.count === 0) throw "Creating sale to team faild.";

        const response = await prisma.saleTeam.findFirst({
            where: {
                id: newGroupPermission.id,
            },
            select: {
                id: true,
                SaleTeamName: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true,
                CreateDate: true,
                UpdateDate: true,
                UserManager: {
                    select: {
                        fullname: true,
                    }
                },
                BU: {
                    select: {
                        Name: true,
                    }
                },
                Company: { 
                    select: {
                        CompanyNameEN: true,
                    }
                }
            }
        });

        const countMember = await prisma.userSaleTeam.aggregate({
            where: {
                SaleTeamId: newGroupPermission.id,
            },
            _count: {
                UserID: true,
            }
        });

        const responseFormat = {
            id: response.id,
            saleteamName: response.SaleTeamName,
            teamLader: response.UserManager.fullname,
            com_bu: response.Company.CompanyNameEN + ', ' + response.BU.Name,
            member: countMember._count.UserID,
            status: response.Active,
            createdBy: response.CreateBy,
            createdDate: response.CreateDate,
            updatedBy: response.UpdateBy,
            updatedDate: response.UpdateDate,
        }
        
        return sendResponse(res, "Creating a sale team successfully!", responseFormat, 201);
    } catch (error) {
        return handleError(res, "Creating a sale team failed", error, 500);
    }
};

exports.GetPermissionByLoginUser = async (req, res) => {
    try {
        const userData = await DecryptToken(req);

        const userRole = userData.body.user.role

        const userPermission = await prisma.permission.findByRole({
            where: {role: userRole}
        })

        return sendResponse(res, "Fetched Permission successfully!", userPermission, 200);
    } catch (err) {
        return handleError(res, "Error fetching Permission", err, 500);
    }
};


exports.GetAllGroupPermission = async (req, res) => {
    try {
        let result = []; 

        const saleteam = await prisma.saleTeam.findMany({
            orderBy: {
                id: 'desc'
            },
            select: {
                id: true,
                SaleTeamName: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true,
                CreateDate: true,
                UpdateDate: true,
                UserManager: {
                    select: {
                        fullname: true,
                    }
                },
                BU: {
                    select: {
                        Name: true,
                    }
                },
                Company: { 
                    select: {
                        CompanyNameEN: true,
                    }
                }
            }
        });

        for (const teams of saleteam) {
            const countMember = await prisma.userSaleTeam.aggregate({
                where: {
                    SaleTeamId: teams.id,
                },
                _count: {
                    UserID: true,
                }
            });

            result.push({
                id: teams?.id,
                saleteamName: teams?.SaleTeamName,
                teamLader: teams?.UserManager?.fullname,
                com_bu: teams?.Company?.CompanyNameEN + ', ' + teams?.BU?.Name,
                member: countMember?._count?.UserID,
                status: teams?.Active,
                createdBy: teams?.CreateBy,
                createdDate: teams?.CreateDate,
                updatedBy: teams?.UpdateBy,
                updatedDate: teams?.UpdateDate,
            })
        }

        return sendResponse(res, "Fetched all Group Permission successfully!", result, 200);
    } catch (err) {
        return handleError(res, "Error fetching Group Permission", err, 500);
    }
};

exports.GetGroupPermissionById = async (req, res) => {
    try {
        const { GruopPermissionID } = req.params;

        const result = await prisma.saleTeam.findFirst({
            where: {
                id: Number(GruopPermissionID),
            },
            select: {
                SaleTeamName: true,
                BUID: true,
                CompanyId: true,
                Manager: true,
                Active: true,
                UserManager: {
                    select: {
                        fullname: true,
                        userRole: {
                            select: {
                                nameEng: true,
                            }
                        }
                    },
                },
                Company: {
                    select: {
                        CompanyNameEN: true,
                    },
                },
                BU: {
                    select: {
                        Name: true,
                    },
                },
                CreateDate: true,
                UserPer: {
                    select: {
                        User: {
                            select: {
                                id: true,
                                fullname: true,
                                userRole: {
                                    select: {
                                        nameEng: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!result) throw "Group Permission not found in the system.";

        let usermember = result.UserPer.map((data) => ({
            id: data.User.id,
            name: data.User.fullname,
            role: data.User.userRole.nameEng,
        }))
        
        usermember.push({
            id: result.Manager,
            name: result.UserManager.fullname,
            role: result.UserManager.userRole.nameEng,
        })

        const responseFormat = {
            saleteamName: result.SaleTeamName,
            teamLaderId: result.Manager,
            teamLader: result.UserManager.fullname,
            company: result.Company.CompanyNameEN,
            companyId: result.CompanyId,
            businessUnit: result.BU.Name,
            BUID: result.BUID,
            createdDate: result.CreateDate,
            Active: result.Active,
            member: usermember,
        }

        return sendResponse(res, "Fetched Group Permissions By ID successfully!", responseFormat, 200);
    } catch (err) {
        return handleError(res, "Error fetching Group Permission by ID", err, 500);
    }
};

exports.UpdateGroupPermission = async (req, res) => {
    try {
        const { SaleTeamName, ComId, BUID,  Manager, Sale, Active } = req.body;
        const { GruopPermissionID } = req.params;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        const reCheckPer = await prisma.saleTeam.findFirst({
            where: {
                id: Number(GruopPermissionID),
            }
        });  

        if (!reCheckPer) throw "this id not found in the system.";

        const updatedGropPermission = await prisma.saleTeam.update({
            where: {
                id: Number(GruopPermissionID),
            },
            data: {
                SaleTeamName: SaleTeamName ? SaleTeamName : reCheckPer.SaleTeamName,
                BUID: BUID ? Number(BUID) : reCheckPer.BUID,
                CompanyId: ComId ? Number(ComId) : reCheckPer.CompanyId,
                Manager: Manager ? Number(Manager) : reCheckPer.Manager,
                UpdateBy: UserData ? UserData : reCheckPer.UpdateBy,
                Active: !Active ? reCheckPer.Active : Active ? true : false,
            },
        });

        if (!updatedGropPermission) throw "Updating a gruop permission failed.";

        await prisma.userSaleTeam.deleteMany({
            where: {
                SaleTeamId: Number(GruopPermissionID),
            }
        });

        // maping the sale data to team
        const saleData = await Sale.map((id) => ({
            SaleTeamId: reCheckPer.id,
            UserID: id,
            CreateBy: UserData,
            UpdateBy: UserData,
        }));

        const createSaleTeam = await prisma.userSaleTeam.createMany({
            data: saleData,
        });

        if (createSaleTeam.count === 0) throw "Creating sale to team faild.";

        const response = await prisma.saleTeam.findFirst({
            where: {
                id: reCheckPer.id,
            },
            select: {
                id: true,
                SaleTeamName: true,
                Active: true,
                CreateBy: true,
                UpdateBy: true,
                CreateDate: true,
                UpdateDate: true,
                UserManager: {
                    select: {
                        fullname: true,
                    }
                },
                BU: {
                    select: {
                        Name: true,
                    }
                },
                Company: { 
                    select: {
                        CompanyNameEN: true,
                    }
                }
            }
        });

        const countMember = await prisma.userSaleTeam.aggregate({
            where: {
                SaleTeamId: reCheckPer.id,
            },
            _count: {
                UserID: true,
            }
        });

        const responseFormat = {
            id: response.id,
            saleteamName: response.SaleTeamName,
            teamLader: response.UserManager.fullname,
            com_bu: response.Company.CompanyNameEN + ', ' + response.BU.Name,
            member: countMember._count.UserID,
            status: response.Active,
            createdBy: response.CreateBy,
            createdDate: response.CreateDate,
            updatedBy: response.UpdateBy,
            updatedDate: response.UpdateDate,
        }

        return sendResponse(res, "Updating Group Permission successfully!", responseFormat, 200);
    } catch (err) {
        return handleError(res, "Error updating Group Permission", err, 500);
    }
};

exports.DeleteGroupPermissionById = async (req, res) => {
    try{
        const { GruopPermissionID } = req.params;

        await prisma.userSaleTeam.deleteMany({
            where: {
                SaleTeamId: Number(GruopPermissionID)
            }
        });

        const deletedGroupPermission = await prisma.saleTeam.delete({
            where: {
                id: Number(GruopPermissionID),
            },
        });

        return sendResponse(res, "Deleting Group Permission by ID successfully!", deletedGroupPermission, 200);
    } catch (err) {
        return handleError(res, "Error deleting Group Permission by ID", err, 500);
    }
};

exports.createNewPermission =  async (req, res) => {
    try {
        const { GroupPermissionID, UserId } = req.body;
        const user = await DecryptToken(req);
        const UserData = user.user.id;
        let GroupPermissionArr = [];

        const getUserId = await prisma.users.findFirst({
            where: {
                ldapUserId: UserId,
            }
        });

        for (const groupPermission of GroupPermissionID) {
            GroupPermissionArr.push({
                GroupPermissionID: groupPermission,
                UserID: getUserId.id,
            });
        }

        console.log(GroupPermissionArr);
        

       const createNewPermission = await prisma.userPermission.createMany({
           data: GroupPermissionArr.map((items) => ({
               GroupPermissionID: Number(items?.GroupPermissionID),
               UserID: Number(items?.UserID),
           }))
       });

       return sendResponse(res, "Creating new permission successfully!", createNewPermission, 200);
    } catch (error) {
        return handleError(res, "Creating a new Permission failed!", error, 500);
    }
};

exports.gettingPermissionsByUserID = async (req, res) => {
    try {
        const { UserID } = req.params;
        
        const result = await prisma.userPermission.findMany({
            where: {
                UserID: Number(UserID),
            },
            include: {
                GropPerMission: {
                    select: {
                        GroupUserPermissionID: true,
                        GroupUserPermissionNameEN: true,
                        SaleTeamNameEN: true,
                        BUID: true,
                        Active: true,
                    }
                },
                User: {
                    select: {
                        id: true,
                        fullname: true,
                        ldapUserId: true,
                    }
                },
            }
        });

        return sendResponse(res, "Fetched Permissions by User ID successfully!", result, 200);
    } catch (error) {
        return handleError(res, "Getting Permissions by User ID failed!", error, 500);
    }
}