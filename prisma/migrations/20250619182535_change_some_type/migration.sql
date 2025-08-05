-- AlterTable
ALTER TABLE "GroupProduct" ALTER COLUMN "Active" DROP NOT NULL,
ALTER COLUMN "Active" SET DEFAULT true;
