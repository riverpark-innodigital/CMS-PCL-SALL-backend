-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "BuId" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_BuId_fkey" FOREIGN KEY ("BuId") REFERENCES "BusinessUnit"("BusinessUnitId") ON DELETE SET NULL ON UPDATE CASCADE;
