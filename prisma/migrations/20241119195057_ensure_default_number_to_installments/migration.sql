/*
  Warnings:

  - Made the column `installments` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "installments" SET NOT NULL,
ALTER COLUMN "installments" SET DEFAULT 1;
