/*
  Warnings:

  - You are about to drop the `GroupPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupPermission" DROP CONSTRAINT "GroupPermission_BUID_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_GroupPermissionID_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_UserID_fkey";

-- DropTable
DROP TABLE "GroupPermission";

-- DropTable
DROP TABLE "UserPermission";

-- CreateTable
CREATE TABLE "UserSaleTeam" (
    "id" SERIAL NOT NULL,
    "SaleTeamId" INTEGER,
    "UserID" INTEGER,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(50),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(50),

    CONSTRAINT "UserSaleTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleTeam" (
    "id" SERIAL NOT NULL,
    "SaleTeamName" VARCHAR(100),
    "CompanyId" INTEGER,
    "BUID" INTEGER,
    "Manager" INTEGER,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(50),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(50),

    CONSTRAINT "SaleTeam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSaleTeam" ADD CONSTRAINT "UserSaleTeam_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSaleTeam" ADD CONSTRAINT "UserSaleTeam_SaleTeamId_fkey" FOREIGN KEY ("SaleTeamId") REFERENCES "SaleTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTeam" ADD CONSTRAINT "SaleTeam_Manager_fkey" FOREIGN KEY ("Manager") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTeam" ADD CONSTRAINT "SaleTeam_BUID_fkey" FOREIGN KEY ("BUID") REFERENCES "BusinessUnit"("BusinessUnitId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTeam" ADD CONSTRAINT "SaleTeam_CompanyId_fkey" FOREIGN KEY ("CompanyId") REFERENCES "Companys"("CompanyId") ON DELETE SET NULL ON UPDATE CASCADE;
