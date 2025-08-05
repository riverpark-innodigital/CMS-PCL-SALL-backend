const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  GetGroupPermissionByUserId: async (userId) => {
    try {
      const result = await prisma.saleTeam.findFirst({
        where: {
          Manager: Number(userId),
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
                },
              },
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
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!result) throw "Group Permission not found in the system.";

      let usermember = result.UserPer.map((data) => ({
        id: data.User.id,
        name: data.User.fullname,
        role: data.User.userRole.nameEng,
      }));

      usermember.push({
        id: result.Manager,
        name: result.UserManager.fullname,
        role: result.UserManager.userRole.nameEng,
      });

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
      };

      return responseFormat;
    } catch (err) {
      return err;
    }
  },
};
