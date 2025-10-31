-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "emailProvider" TEXT NOT NULL DEFAULT 'cartelia_subdomain',
ADD COLUMN     "emailSender" TEXT,
ADD COLUMN     "emailSenderName" TEXT,
ADD COLUMN     "sendgridSubKey" TEXT,
ADD COLUMN     "sendgridSubId" TEXT,
ADD COLUMN     "gmailRefreshToken" TEXT,
ADD COLUMN     "gmailEmail" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailQuotaUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailQuotaLimit" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "emailQuotaResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Populate default sender for existing restaurants
UPDATE "Restaurant"
SET "emailSender" = CONCAT('resto_', "id", '@noreply.cartelia.app')
WHERE "emailSender" IS NULL;

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_restaurantId_sentAt_idx" ON "EmailLog"("restaurantId", "sentAt");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
