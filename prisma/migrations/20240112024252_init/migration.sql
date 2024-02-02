-- CreateTable
CREATE TABLE `ReportCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rawData` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ReportCollection_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectionId` INTEGER NOT NULL,

    UNIQUE INDEX `PersonReport_email_collectionId_key`(`email`, `collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CBTProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `personReportId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScenarioProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `grade` INTEGER NOT NULL,
    `completed` BOOLEAN NOT NULL,
    `totalTime` DOUBLE NOT NULL,
    `criticalErrors` INTEGER NOT NULL,
    `nonCriticalErrors` INTEGER NOT NULL,
    `personReportId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonReport` ADD CONSTRAINT `PersonReport_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `ReportCollection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CBTProgress` ADD CONSTRAINT `CBTProgress_personReportId_fkey` FOREIGN KEY (`personReportId`) REFERENCES `PersonReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioProgress` ADD CONSTRAINT `ScenarioProgress_personReportId_fkey` FOREIGN KEY (`personReportId`) REFERENCES `PersonReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
