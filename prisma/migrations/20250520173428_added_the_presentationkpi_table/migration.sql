-- AlterTable
ALTER TABLE "GroupProduct" ALTER COLUMN "CreateBy" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "UpdateBy" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "PresentationKPI" (
    "id" SERIAL NOT NULL,
    "PresentTo" VARCHAR(100),
    "PresentDate" TIMESTAMP(3),
    "Description" VARCHAR(3000),
    "PresentFileId" INTEGER NOT NULL,
    "UserId" VARCHAR(100),
    "CreateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdateDate" TIMESTAMP(3),

    CONSTRAINT "PresentationKPI_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PresentationKPI" ADD CONSTRAINT "PresentationKPI_PresentFileId_fkey" FOREIGN KEY ("PresentFileId") REFERENCES "PresentationFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
