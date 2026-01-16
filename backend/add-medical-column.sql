-- Add medicalConditions column to Child table
ALTER TABLE "Child" ADD COLUMN IF NOT EXISTS "medicalConditions" TEXT;
