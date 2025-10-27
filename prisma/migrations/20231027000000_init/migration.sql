-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "googlePlaceId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsappConsent" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Client_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Avis_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Campaign_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignSend" (
    "id" SERIAL PRIMARY KEY,
    "campaignId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "CampaignSend_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE,
    CONSTRAINT "CampaignSend_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    CONSTRAINT "Menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Reservation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Scan_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER,
    "feature" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "FeatureToggle" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT "FeatureToggle_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    CONSTRAINT "FeatureToggle_restaurantId_key_key" UNIQUE ("restaurantId", "key")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "QrCode" (
    "id" SERIAL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "QrCode_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);
