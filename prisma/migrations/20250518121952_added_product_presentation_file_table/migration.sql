-- CreateTable
CREATE TABLE "PresentationFile" (
    "id" SERIAL NOT NULL,
    "FileOriginalName" VARCHAR(100),
    "FileName" VARCHAR(100),
    "FilePath" VARCHAR(100),
    "ProductId" INTEGER NOT NULL,
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdateDate" TIMESTAMP(3),

    CONSTRAINT "PresentationFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PresentationFile" ADD CONSTRAINT "PresentationFile_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;
