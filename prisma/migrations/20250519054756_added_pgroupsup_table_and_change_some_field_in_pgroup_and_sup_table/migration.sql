-- DropForeignKey
ALTER TABLE "GroupProduct" DROP CONSTRAINT "GroupProduct_SupplierId_fkey";

-- CreateTable
CREATE TABLE "ProductGroupSup" (
    "id" SERIAL NOT NULL,
    "SupplierId" INTEGER NOT NULL,
    "ProductGroupId" INTEGER NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdateDate" TIMESTAMP(3),

    CONSTRAINT "ProductGroupSup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductGroupSup" ADD CONSTRAINT "ProductGroupSup_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Supplier"("SupplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGroupSup" ADD CONSTRAINT "ProductGroupSup_ProductGroupId_fkey" FOREIGN KEY ("ProductGroupId") REFERENCES "GroupProduct"("GroupProductId") ON DELETE RESTRICT ON UPDATE CASCADE;
