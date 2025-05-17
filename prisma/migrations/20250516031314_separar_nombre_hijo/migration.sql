/*
  Warnings:

  - You are about to drop the column `nombre_completo` on the `hijos` table. All the data in the column will be lost.
  - Added the required column `apellido_materno` to the `hijos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido_paterno` to the `hijos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `hijos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hijos" DROP COLUMN "nombre_completo",
ADD COLUMN     "apellido_materno" VARCHAR(100) NOT NULL,
ADD COLUMN     "apellido_paterno" VARCHAR(100) NOT NULL,
ADD COLUMN     "nombre" VARCHAR(100) NOT NULL;
