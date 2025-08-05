/*
  Warnings:

  - You are about to drop the column `NameEN` on the `BusinessUnit` table. All the data in the column will be lost.
  - You are about to drop the column `NameTH` on the `BusinessUnit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessUnit" DROP COLUMN "NameEN",
DROP COLUMN "NameTH",
ADD COLUMN     "Description" VARCHAR(3000),
ADD COLUMN     "Name" VARCHAR(100);
