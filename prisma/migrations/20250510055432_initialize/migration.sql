-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "ldapUserId" TEXT,
    "username" TEXT,
    "prefixName" INTEGER,
    "fullname" TEXT,
    "email" TEXT,
    "emailCodeVerify" TEXT,
    "emailcodeDT" TIMESTAMP(3),
    "password" TEXT,
    "passwordToken" TEXT,
    "phoneNumber" TEXT,
    "picture" TEXT,
    "handlerBy" TEXT,
    "role" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(100),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updateBy" VARCHAR(100),
    "active" "UserStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "customerId" INTEGER,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nameEng" TEXT,
    "nameTH" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "SupplierId" SERIAL NOT NULL,
    "SupplierNameTh" VARCHAR(100),
    "SupplierNameEn" VARCHAR(100),
    "SupplierDescriptionTH" TEXT,
    "SupplierDescriptionEN" TEXT,
    "SupplierImage" TEXT,
    "Active" BOOLEAN,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("SupplierId")
);

-- CreateTable
CREATE TABLE "BusinessUnitSupplier" (
    "busId" SERIAL NOT NULL,
    "BusinessUnitId" INTEGER NOT NULL,
    "SupplierId" INTEGER NOT NULL,

    CONSTRAINT "BusinessUnitSupplier_pkey" PRIMARY KEY ("busId")
);

-- CreateTable
CREATE TABLE "SupplierCompany" (
    "SuplCpnId" SERIAL NOT NULL,
    "SupplierId" INTEGER NOT NULL,
    "CompanyId" INTEGER,
    "Active" BOOLEAN,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20),

    CONSTRAINT "SupplierCompany_pkey" PRIMARY KEY ("SuplCpnId")
);

-- CreateTable
CREATE TABLE "Product" (
    "ProductId" SERIAL NOT NULL,
    "SupplierId" INTEGER,
    "ProductNo" VARCHAR(100),
    "GroupProductId" INTEGER,
    "ModelProductId" INTEGER,
    "ProductNameTh" VARCHAR(100),
    "ProductNameEn" VARCHAR(100),
    "ProductImage" TEXT,
    "ProductDescriptionHeaderTh" VARCHAR(100),
    "ProductDescriptionDetailTh" TEXT,
    "ProductDescriptionHeaderEn" VARCHAR(100),
    "ProductDescriptionDetailEn" TEXT,
    "MeadiaTitle" VARCHAR(100),
    "ProductVideo" TEXT,
    "MeadiaDescription" VARCHAR(5000),
    "ProductUpVideo" TEXT,
    "Active" BOOLEAN,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),
    "Expiredate" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductId")
);

-- CreateTable
CREATE TABLE "GroupProduct" (
    "GroupProductId" SERIAL NOT NULL,
    "GroupCode" VARCHAR(20) NOT NULL,
    "GroupNameEn" VARCHAR(100) NOT NULL,
    "GroupNameTh" VARCHAR(100) NOT NULL,
    "SupplierId" INTEGER,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20) NOT NULL,

    CONSTRAINT "GroupProduct_pkey" PRIMARY KEY ("GroupProductId")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "ProductImageId" SERIAL NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "ProductImageNameTh" VARCHAR(100) NOT NULL,
    "ProductImageNameEn" VARCHAR(100) NOT NULL,
    "ProductImageImage" TEXT,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("ProductImageId")
);

-- CreateTable
CREATE TABLE "ProductFolder" (
    "ProductFolderId" SERIAL NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "ProductFolderNameTh" VARCHAR(100) NOT NULL,
    "ProductFolderNameEn" VARCHAR(100) NOT NULL,
    "ProductFolderSeq" INTEGER NOT NULL,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "ProductFolder_pkey" PRIMARY KEY ("ProductFolderId")
);

-- CreateTable
CREATE TABLE "ProductFile" (
    "ProductFileId" SERIAL NOT NULL,
    "ProductFolderId" INTEGER NOT NULL,
    "ProductFileNameTh" VARCHAR(100) NOT NULL,
    "ProductFileNameEn" VARCHAR(100) NOT NULL,
    "ProductFile" TEXT,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "ProductFile_pkey" PRIMARY KEY ("ProductFileId")
);

-- CreateTable
CREATE TABLE "ModelProduct" (
    "ModelProductId" SERIAL NOT NULL,
    "ModelCode" VARCHAR(20) NOT NULL,
    "ModelNameEn" VARCHAR(100) NOT NULL,
    "ModelNameTh" VARCHAR(100) NOT NULL,
    "SupplierId" INTEGER,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20) NOT NULL,

    CONSTRAINT "ModelProduct_pkey" PRIMARY KEY ("ModelProductId")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "UserPermissionID" SERIAL NOT NULL,
    "GroupPermissionID" INTEGER,
    "UserID" INTEGER,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(50),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(50),

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("UserPermissionID")
);

-- CreateTable
CREATE TABLE "GroupPermission" (
    "GroupUserPermissionID" SERIAL NOT NULL,
    "GroupUserPermissionNameEN" VARCHAR(100),
    "GroupUserPermissionNameTH" VARCHAR(100),
    "SaleTeamNameEN" VARCHAR(100),
    "SaleTeamNameTH" VARCHAR(100),
    "BUID" INTEGER,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(50),
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(50),

    CONSTRAINT "GroupPermission_pkey" PRIMARY KEY ("GroupUserPermissionID")
);

-- CreateTable
CREATE TABLE "LogTransation" (
    "LogTransationID" SERIAL NOT NULL,
    "UserID" TEXT,
    "PageType" VARCHAR(20) NOT NULL,
    "ObjectID" INTEGER,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20) NOT NULL,

    CONSTRAINT "LogTransation_pkey" PRIMARY KEY ("LogTransationID")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "FavoriteId" SERIAL NOT NULL,
    "UserID" TEXT,
    "ObjectID" INTEGER,
    "ObjectType" VARCHAR(20) NOT NULL,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("FavoriteId")
);

-- CreateTable
CREATE TABLE "ObjectView" (
    "ObjectViewId" SERIAL NOT NULL,
    "UserID" TEXT,
    "ObjectID" INTEGER,
    "ObjectType" VARCHAR(20) NOT NULL,
    "Active" BOOLEAN NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectView_pkey" PRIMARY KEY ("ObjectViewId")
);

-- CreateTable
CREATE TABLE "Companys" (
    "CompanyId" SERIAL NOT NULL,
    "CompanyNameEN" VARCHAR(100),
    "CompanyNameTH" VARCHAR(100),
    "DescriptionEN" VARCHAR(5000),
    "DescriptionTH" VARCHAR(5000),
    "CompamyPicture" VARCHAR(100),
    "CompamyPictureName" VARCHAR(100),
    "CompanyNameFile" VARCHAR(100),
    "Active" BOOLEAN DEFAULT true,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "Companys_pkey" PRIMARY KEY ("CompanyId")
);

-- CreateTable
CREATE TABLE "BusinessUnit" (
    "BusinessUnitId" SERIAL NOT NULL,
    "NameEN" VARCHAR(100),
    "NameTH" VARCHAR(100),

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("BusinessUnitId")
);

-- CreateTable
CREATE TABLE "CompanyBusinessUnit" (
    "cmuId" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "businessUnitId" INTEGER NOT NULL,

    CONSTRAINT "CompanyBusinessUnit_pkey" PRIMARY KEY ("cmuId")
);

-- CreateTable
CREATE TABLE "Notes" (
    "noteID" SERIAL NOT NULL,
    "PresentToEN" VARCHAR(100),
    "PresentToTH" VARCHAR(100),
    "PresentDate" TIMESTAMP(3),
    "DescriptionEN" VARCHAR(1000),
    "DescriptionTH" VARCHAR(1000),
    "ProductID" INTEGER,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreateBy" VARCHAR(20) NOT NULL,
    "UpdateDate" TIMESTAMP(3),
    "UpdateBy" VARCHAR(20),

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("noteID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_providerAccountId_key" ON "accounts"("providerId", "providerAccountId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY ("role") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSupplier" ADD CONSTRAINT "BusinessUnitSupplier_BusinessUnitId_fkey" FOREIGN KEY ("BusinessUnitId") REFERENCES "BusinessUnit"("BusinessUnitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSupplier" ADD CONSTRAINT "BusinessUnitSupplier_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCompany" ADD CONSTRAINT "SupplierCompany_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCompany" ADD CONSTRAINT "SupplierCompany_CompanyId_fkey" FOREIGN KEY ("CompanyId") REFERENCES "Companys"("CompanyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_GroupProductId_fkey" FOREIGN KEY ("GroupProductId") REFERENCES "GroupProduct"("GroupProductId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_ModelProductId_fkey" FOREIGN KEY ("ModelProductId") REFERENCES "ModelProduct"("ModelProductId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProduct" ADD CONSTRAINT "GroupProduct_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFolder" ADD CONSTRAINT "ProductFolder_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFile" ADD CONSTRAINT "ProductFile_ProductFolderId_fkey" FOREIGN KEY ("ProductFolderId") REFERENCES "ProductFolder"("ProductFolderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProduct" ADD CONSTRAINT "ModelProduct_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_GroupPermissionID_fkey" FOREIGN KEY ("GroupPermissionID") REFERENCES "GroupPermission"("GroupUserPermissionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_BUID_fkey" FOREIGN KEY ("BUID") REFERENCES "Companys"("CompanyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBusinessUnit" ADD CONSTRAINT "CompanyBusinessUnit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companys"("CompanyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBusinessUnit" ADD CONSTRAINT "CompanyBusinessUnit_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit"("BusinessUnitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Product"("ProductId") ON DELETE SET NULL ON UPDATE CASCADE;
