-- Migration: Add organizationId columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT '';
ALTER TABLE "Medicine" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT '';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT '';
