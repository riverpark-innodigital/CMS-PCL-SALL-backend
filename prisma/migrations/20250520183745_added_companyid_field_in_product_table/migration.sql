-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "CompanyId" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_CompanyId_fkey" FOREIGN KEY ("CompanyId") REFERENCES "Companys"("CompanyId") ON DELETE SET NULL ON UPDATE CASCADE;
