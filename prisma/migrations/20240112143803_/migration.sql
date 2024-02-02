/*
  Warnings:

  - Added the required column `runAt` to the `ScenarioProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scenarioprogress` ADD COLUMN `runAt` DATETIME(3) NOT NULL;
