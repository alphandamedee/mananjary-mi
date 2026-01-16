-- Migration: Mise à jour de la table tragnobes
-- Date: 2026-01-16
-- Description: Ajout des champs ampanjaka, lefitra, dates de règne et création de la table historique

USE `mananjary-mi`;

-- 1. Modifier la table tragnobes
ALTER TABLE `tragnobes`
  ADD COLUMN `ampanjaka` VARCHAR(150) NULL COMMENT 'Chef actuel (Ampanjaka)' AFTER `localisation`,
  ADD COLUMN `lefitra` VARCHAR(150) NULL COMMENT 'Adjoint du chef' AFTER `ampanjaka`,
  ADD COLUMN `date_debut` DATE NULL COMMENT 'Date de début du règne actuel' AFTER `lefitra`,
  ADD COLUMN `date_fin` DATE NULL COMMENT 'Date de fin du règne (null si en cours)' AFTER `date_debut`,
  ADD COLUMN `description` TEXT NULL COMMENT 'Description du tragnobe' AFTER `date_fin`;

-- 2. Copier les données de nom_chef vers ampanjaka (si la colonne existe)
-- UPDATE `tragnobes` SET `ampanjaka` = `nom_chef` WHERE `nom_chef` IS NOT NULL;

-- 3. Supprimer l'ancienne colonne nom_chef (si elle existe)
-- ALTER TABLE `tragnobes` DROP COLUMN `nom_chef`;

-- 4. Supprimer la colonne actif (si elle existe)
-- ALTER TABLE `tragnobes` DROP COLUMN `actif`;

-- 5. Créer la table historique_ampanjaka
CREATE TABLE IF NOT EXISTS `historique_ampanjaka` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `id_tragnobe` BIGINT NOT NULL,
  `ampanjaka` VARCHAR(150) NOT NULL COMMENT 'Nom du chef',
  `lefitra` VARCHAR(150) NULL COMMENT 'Adjoint',
  `date_debut` DATE NOT NULL COMMENT 'Date de début du règne',
  `date_fin` DATE NULL COMMENT 'Date de fin du règne (null si en cours)',
  `raison_fin` VARCHAR(255) NULL COMMENT 'Raison de fin de règne (décès, abdication, etc.)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tragnobe` (`id_tragnobe`),
  INDEX `idx_dates` (`date_debut`, `date_fin`),
  CONSTRAINT `fk_historique_tragnobe` 
    FOREIGN KEY (`id_tragnobe`) 
    REFERENCES `tragnobes` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Ajouter un commentaire à la table
ALTER TABLE `historique_ampanjaka` COMMENT = 'Historique des chefs (Ampanjaka) de chaque tragnobe';

-- Fin de la migration
