/*
  # Create users table with authentication fields

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password` (text, not null) - for bcrypt hashed passwords
      - `name` (text, not null) - user's full name
      - `isPremium` (boolean, default false) - premium plan status
      - `isAdmin` (boolean, default false) - admin privileges
      - `createdAt` (timestamp, default now)
      - `updatedAt` (timestamp, auto-updated)

  2. Changes
    - Update existing Transaction table to reference users properly
    - Add foreign key constraint for userId in transactions
    - Ensure data integrity with CASCADE delete

  3. Security
    - Unique constraint on email to prevent duplicates
    - Proper indexing for performance
*/

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Update Transaction table name if it exists with old name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Transaction') THEN
        ALTER TABLE "Transaction" RENAME TO "transactions";
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_userId_fkey'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Fix column name typo if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'udatedAt'
    ) THEN
        ALTER TABLE "transactions" RENAME COLUMN "udatedAt" TO "updatedAt";
    END IF;
END $$;

-- Ensure installments column exists with proper default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'installments'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "installments" INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;