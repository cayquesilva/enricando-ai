-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionCategory" ADD VALUE 'ACOES';
ALTER TYPE "TransactionCategory" ADD VALUE 'CDB';
ALTER TYPE "TransactionCategory" ADD VALUE 'CDI';
ALTER TYPE "TransactionCategory" ADD VALUE 'CRIPTO';
ALTER TYPE "TransactionCategory" ADD VALUE 'FUNDOS';
ALTER TYPE "TransactionCategory" ADD VALUE 'RFIXA';
ALTER TYPE "TransactionCategory" ADD VALUE 'POUPANCA';
ALTER TYPE "TransactionCategory" ADD VALUE 'TDIRETO';
