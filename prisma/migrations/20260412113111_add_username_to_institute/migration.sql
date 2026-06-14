/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Institute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Institute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Institute" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Institute_username_key" ON "Institute"("username");
