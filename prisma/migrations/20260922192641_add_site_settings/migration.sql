-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site',
    "siteName" TEXT NOT NULL DEFAULT 'سَكَني',
    "siteDescription" TEXT NOT NULL DEFAULT 'منصة سَكَني لاستكشاف وحجز العقارات السكنية',
    "contactEmail" TEXT NOT NULL DEFAULT 'admin@sakani.com',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'YER',
    "bookingsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoConfirmBookings" BOOLEAN NOT NULL DEFAULT false,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "propertiesPerPage" INTEGER NOT NULL DEFAULT 9,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
