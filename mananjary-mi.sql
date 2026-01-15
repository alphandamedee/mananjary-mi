-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 15 jan. 2026 à 11:47
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `mananjary-mi`
--
CREATE DATABASE IF NOT EXISTS `mananjary-mi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `mananjary-mi`;

-- --------------------------------------------------------

--
-- Structure de la table `cotisations`
--

DROP TABLE IF EXISTS `cotisations`;
CREATE TABLE IF NOT EXISTS `cotisations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` bigint UNSIGNED NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `moyen_paiement` enum('mobile_money','virement','especes','cheque') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_transaction` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('en_attente','reussie','echouee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `date_cotisation` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cotisation_user` (`id_user`),
  KEY `idx_statut_cotisation` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `cotisations`
--
DROP TRIGGER IF EXISTS `trg_cotisation_reussie`;
DELIMITER $$
CREATE TRIGGER `trg_cotisation_reussie` AFTER UPDATE ON `cotisations` FOR EACH ROW BEGIN
    IF OLD.statut != NEW.statut AND NEW.statut = 'reussie' THEN
        INSERT INTO `notifications` (`id_user`, `titre`, `message`, `type`)
        VALUES (NEW.id_user, 'Cotisation validée', CONCAT('Votre cotisation de ', NEW.montant, ' Ar a été validée.'), 'succes');
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `coutumes`
--

DROP TABLE IF EXISTS `coutumes`;
CREATE TABLE IF NOT EXISTS `coutumes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_super_admin` bigint UNSIGNED DEFAULT NULL,
  `titre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL COMMENT 'Utilisateur créateur',
  `categorie` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Catégorie de la coutume',
  `periodicite` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Périodicité de la coutume',
  `date_celebration` date DEFAULT NULL COMMENT 'Date de célébration',
  `niveau_importance` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Niveau d''importance',
  `regles_pratiques` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Règles et pratiques',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_coutume_super_admin` (`id_super_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `dons`
--

DROP TABLE IF EXISTS `dons`;
CREATE TABLE IF NOT EXISTS `dons` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` bigint UNSIGNED DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `anonyme` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_don_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `evenements`
--

DROP TABLE IF EXISTS `evenements`;
CREATE TABLE IF NOT EXISTS `evenements` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_admin` bigint UNSIGNED DEFAULT NULL,
  `titre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `type` enum('familial','culturel','reunion','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime DEFAULT NULL,
  `lieu` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_evenement_admin` (`id_admin`),
  KEY `idx_date_debut` (`date_debut`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evenements`
--

INSERT INTO `evenements` (`id`, `id_admin`, `titre`, `description`, `type`, `date_debut`, `date_fin`, `lieu`, `created_at`, `updated_at`) VALUES
(1, 1, 'Réunion de famille', 'Assemblée annuelle du tragnobe Ramelaza', 'familial', '2026-02-15 14:00:00', NULL, 'Salle communautaire', '2026-01-07 05:18:46', '2026-01-07 05:18:46'),
(2, 9, 'SAMBATRA', NULL, 'culturel', '2028-09-29 00:00:00', '2028-10-27 23:59:00', 'Mananjary', '2026-01-10 18:23:54', '2026-01-10 18:23:54');

-- --------------------------------------------------------

--
-- Structure de la table `logs_activites`
--

DROP TABLE IF EXISTS `logs_activites`;
CREATE TABLE IF NOT EXISTS `logs_activites` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `acteur_type` enum('super_admin','admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `acteur_id` bigint UNSIGNED NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_acteur` (`acteur_type`,`acteur_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `logs_activites`
--

INSERT INTO `logs_activites` (`id`, `acteur_type`, `acteur_id`, `action`, `description`, `created_at`) VALUES
(1, 'user', 1, 'inscription', 'Nouvel utilisateur: Tsiky RAKOTOMALALA', '2026-01-07 07:18:07'),
(2, 'user', 2, 'inscription', 'Nouvel utilisateur: Faly RAHARISOA', '2026-01-07 07:18:07'),
(3, 'user', 3, 'inscription', 'Nouvel utilisateur: Hery ANDRIAMAMPIANINA', '2026-01-07 07:18:07'),
(4, 'user', 4, 'inscription', 'Nouvel utilisateur: Noro RASOANAIVO', '2026-01-07 07:18:07'),
(5, 'user', 5, 'inscription', 'Nouvel utilisateur: Hery RANDRIAMANANTSOA', '2026-01-07 08:09:01'),
(6, 'user', 6, 'inscription', 'Nouvel utilisateur: Nadia RAZAFY', '2026-01-07 08:09:01'),
(7, 'user', 7, 'inscription', 'Nouvel utilisateur: Michel RAKOTONIRINA', '2026-01-07 08:09:01'),
(8, 'user', 8, 'inscription', 'Nouvel utilisateur: Inscription TESTEUR', '2026-01-07 08:51:58'),
(9, 'user', 9, 'inscription', 'Nouvel utilisateur: ALPHAND AMEDEE ANDRIATIANA', '2026-01-07 08:56:28'),
(11, 'user', 12, 'inscription', 'Nouvel utilisateur: Alphand AMEDEE', '2026-01-07 12:04:42'),
(12, 'user', 13, 'inscription', 'Nouvel utilisateur: Marie RAZAFY', '2026-01-07 12:04:42'),
(13, 'user', 14, 'inscription', 'Nouvel utilisateur: Paul RANDRIA', '2026-01-07 12:04:42'),
(14, 'user', 15, 'inscription', 'Nouvel utilisateur: Sophie RAKOTO', '2026-01-07 12:04:42'),
(15, 'user', 16, 'inscription', 'Nouvel utilisateur: Jean RASOLOFO', '2026-01-07 12:04:42'),
(16, 'user', 17, 'inscription', 'Nouvel utilisateur: Claudine ANDRIANINA', '2026-01-07 12:04:42'),
(17, 'user', 18, 'inscription', 'Nouvel utilisateur: Marie RAZAFINDRAKOTO', '2026-01-07 12:04:42'),
(18, 'user', 10, 'inscription', 'Nouvel utilisateur: Jean TEST SIBLING', '2026-01-07 12:52:59'),
(19, 'user', 10, 'inscription', 'Nouvel utilisateur: Sophie ANDRIATIANA', '2026-01-07 12:54:48'),
(20, 'user', 19, 'inscription', 'Nouvel utilisateur: Super ADMIN', '2026-01-09 16:08:10'),
(21, 'user', 21, 'inscription', 'Nouvel utilisateur: Jean RAKOTO', '2026-01-09 16:08:25'),
(22, 'user', 23, 'inscription', 'Nouvel utilisateur: Marie RABE', '2026-01-09 16:08:40'),
(23, 'user', 24, 'inscription', 'Nouvel utilisateur: Antoine RAKOTO', '2026-01-10 14:24:08'),
(24, 'user', 34, 'inscription', 'Nouvel utilisateur: Antoine RAKOTOMALALA', '2026-01-10 14:38:06');

-- --------------------------------------------------------

--
-- Structure de la table `lohantragno`
--

DROP TABLE IF EXISTS `lohantragno`;
CREATE TABLE IF NOT EXISTS `lohantragno` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_tragnobe` bigint UNSIGNED NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lohantragno_id_tragnobe_foreign` (`id_tragnobe`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `lohantragno`
--

INSERT INTO `lohantragno` (`id`, `nom`, `id_tragnobe`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Tsimiharo 1', 1, 'Lohantragno Tsimiharo 1 du tragnobe Ramelaza', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(2, 'Antanandro 2', 1, 'Lohantragno Antanandro 2 du tragnobe Ramelaza', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(3, 'Antanandro 3', 1, 'Lohantragno Antanandro 3 du tragnobe Ramelaza', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(4, 'Marovato 4', 1, 'Lohantragno Marovato 4 du tragnobe Ramelaza', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(5, 'Antanandro 1', 2, 'Lohantragno Antanandro 1 du tragnobe Zanaky iaban-Dramavo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(6, 'Sahavato 2', 2, 'Lohantragno Sahavato 2 du tragnobe Zanaky iaban-Dramavo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(7, 'Antanandro 3', 2, 'Lohantragno Antanandro 3 du tragnobe Zanaky iaban-Dramavo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(8, 'Tsimiharo 1', 3, 'Lohantragno Tsimiharo 1 du tragnobe Ravalarivo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(9, 'Ambohimena 2', 3, 'Lohantragno Ambohimena 2 du tragnobe Ravalarivo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(10, 'Ambohimena 3', 3, 'Lohantragno Ambohimena 3 du tragnobe Ravalarivo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(11, 'Sahavato 4', 3, 'Lohantragno Sahavato 4 du tragnobe Ravalarivo', '2026-01-10 12:04:56', '2026-01-10 12:04:56'),
(12, 'LABABA', 1, NULL, '2026-01-10 12:19:10', '2026-01-10 12:19:10');

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_01_07_000001_create_roles_table', 1),
(2, '2025_01_07_100000_setup_roles_system', 2),
(3, '2026_01_10_000001_create_lohantragno_table', 3);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` bigint UNSIGNED NOT NULL,
  `titre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('info','succes','avertissement','erreur') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `lue` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notification_user` (`id_user`),
  KEY `idx_lue` (`lue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `relations`
--

DROP TABLE IF EXISTS `relations`;
CREATE TABLE IF NOT EXISTS `relations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user1` bigint UNSIGNED NOT NULL,
  `id_user2` bigint UNSIGNED NOT NULL,
  `type_relation` enum('pere','mere','fils','fille','epoux','epouse') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_relation_user1` (`id_user1`),
  KEY `fk_relation_user2` (`id_user2`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `relations`
--

INSERT INTO `relations` (`id`, `id_user1`, `id_user2`, `type_relation`, `created_at`) VALUES
(1, 1, 2, 'pere', '2026-01-07 11:28:34'),
(2, 2, 1, 'fille', '2026-01-07 11:28:34'),
(3, 2, 5, 'epoux', '2026-01-07 11:28:34'),
(4, 5, 2, 'epouse', '2026-01-07 11:28:34'),
(5, 2, 9, 'pere', '2026-01-07 11:28:34'),
(6, 9, 2, 'fille', '2026-01-07 11:28:34'),
(7, 5, 9, 'mere', '2026-01-07 11:28:34'),
(8, 9, 5, 'fils', '2026-01-07 11:28:34');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nom_unique` (`nom`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `nom`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Accès complet à toutes les fonctionnalités du système', '2026-01-07 07:53:37', '2026-01-07 07:53:37'),
(2, 'Admin', 'Gestion des membres et des tragnobes', '2026-01-07 07:53:37', '2026-01-07 07:53:37'),
(3, 'Membre', 'Utilisateur standard de la communauté', '2026-01-07 07:53:37', '2026-01-07 07:53:37');

-- --------------------------------------------------------

--
-- Structure de la table `tragnobes`
--

DROP TABLE IF EXISTS `tragnobes`;
CREATE TABLE IF NOT EXISTS `tragnobes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `localisation` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `tragnobes`
--

INSERT INTO `tragnobes` (`id`, `nom`, `localisation`, `created_at`, `updated_at`) VALUES
(1, 'Ramelaza', 'Ankadirano', '2026-01-07 06:37:44', '2026-01-07 06:37:44'),
(2, 'Zanaky iaban-Dramavo', 'Ankadirano', '2026-01-07 06:37:44', '2026-01-07 06:37:44'),
(3, 'Ravalarivo', 'Masindrano', '2026-01-07 06:37:44', '2026-01-07 06:37:44');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_role` bigint UNSIGNED NOT NULL DEFAULT '3',
  `id_tragnobe` bigint UNSIGNED DEFAULT NULL,
  `id_lohantragno` bigint UNSIGNED DEFAULT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `genre` enum('H','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annee_naissance` year DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('en_attente','valide','rejete') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `mot_de_passe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_tragnobe` (`id_tragnobe`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `id_role`, `id_tragnobe`, `id_lohantragno`, `nom`, `prenom`, `genre`, `telephone`, `email`, `ville`, `annee_naissance`, `photo`, `statut`, `mot_de_passe`, `created_at`, `updated_at`) VALUES
(1, 2, 1, NULL, 'RAKOTOMALALA', 'Tsiky', 'H', '+261340001001', 'tsiky.rakotomalala@gmail.com', 'Mananjary', '1951', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:15:30'),
(2, 2, 2, NULL, 'RAHARISOA', 'Faly', 'F', '+261340001002', 'faly.raharisoa@gmail.com', 'Manakara', '1978', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:15:30'),
(3, 3, 1, NULL, 'ANDRIAMAMPIANINA', 'Hery', 'H', '+261340001003', 'hery.andria@gmail.com', 'Mananjary', '1982', NULL, 'en_attente', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:15:30'),
(4, 3, 3, NULL, 'RASOANAIVO', 'Noro', 'F', '+261340001004', 'noro.rasoanaivo@gmail.com', 'Vohipeno', '1988', NULL, 'en_attente', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:15:30'),
(5, 3, 1, NULL, 'RANDRIAMANANTSOA', 'Hery', 'H', '+261340002001', 'hery.randria@gmail.com', 'Mananjary', '1976', 'photos/1767973231_6961216f0abba.jpg', 'valide', '$2y$12$RT7ChuaZDTMVe4qUpu8Amu/N0cHNxakzBjpMbRCaF4v9GydPEseWe', '2026-01-07 04:09:01', '2026-01-09 15:40:32'),
(6, 3, 2, NULL, 'RAZAFY', 'Nadia', 'F', '+261340002002', 'nadia.razafy@gmail.com', 'Manakara', '1998', NULL, 'rejete', '$2y$12$.gJunbWJB4I2h7AQwpkOEO64ySJZIAG0hb0FTXl/s45aGMqyCNY8.', '2026-01-07 04:09:01', '2026-01-07 12:15:30'),
(7, 3, 3, NULL, 'RAKOTONIRINA', 'Michel', 'H', '+261340002003', 'michel.rakoto@gmail.com', 'Fianarantsoa', '1996', NULL, 'en_attente', '$2y$12$Wl2WFSHlZ0YUEc5JJ8H1feP373fAdAb9tXsrui.gDKZBqVgk0.rb.', '2026-01-07 04:09:01', '2026-01-07 12:15:30'),
(9, 2, 1, NULL, 'ANDRIATIANA', 'ALPHAND AMEDEE', 'H', '+262692060753', 'alphandamedee@gmail.com', 'SAINT-DENIS', '2000', 'photos/1767976601_69612e9951088.jpg', 'valide', '$2y$12$m83zsRPrQej.k4.yqEuhVuqmUUYwkgLnOGdMg/Vc6n9kW/mEy6iSO', '2026-01-07 08:56:28', '2026-01-09 16:36:41'),
(12, 1, NULL, NULL, 'AMEDEE', 'Alphand', 'H', 'SA00000001', 'alphandamedee@gmail.mg', '', '1965', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 06:37:44', '2026-01-07 12:21:00'),
(13, 1, NULL, NULL, 'RAZAFY', 'Marie', 'H', 'SA00000002', 'marie.razafy@antambahoaka.mg', '', '1968', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:21:00'),
(14, 2, 1, NULL, 'RANDRIA', 'Paul', 'H', '+261340000001', 'paul.randria@antambahoaka.mg', '', '1970', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:21:00'),
(15, 2, 2, NULL, 'RAKOTO', 'Sophie', 'H', '+261340000002', 'sophie.rakoto@antambahoaka.mg', '', '1973', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:21:00'),
(16, 2, 1, NULL, 'RASOLOFO', 'Jean', 'H', '+261340000003', 'jean.rasolofo@antambahoaka.mg', '', '1975', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:21:00'),
(17, 2, 2, NULL, 'ANDRIANINA', 'Claudine', 'H', '+261340000004', 'claudine.andrianina@antambahoaka.mg', '', '1977', NULL, 'valide', '$2y$12$r6SGZAcIEzjOeOjx/la2MOtLe3K43yYc1gf6zm6RtWS52eEb1HE3K', '2026-01-07 07:18:07', '2026-01-07 12:21:00'),
(18, 2, 3, NULL, 'RAZAFINDRAKOTO', 'Marie', 'H', '+261340000005', 'marie.razafindrakoto@antambahoaka.mg', '', '1979', NULL, 'valide', '$2y$12$ZTShKXJZaUlkGspsiYbTGuHHqw3mb1mpHdFjRAGkO8wFE4AJ1CUve', '2026-01-07 04:00:04', '2026-01-07 12:21:00'),
(19, 1, 1, NULL, 'ADMIN', 'Super', 'H', '+261340000000', 'admin@antambahoaka.mg', 'Mananjary', '1980', NULL, 'valide', '$2y$12$yuASHiMH/0K4eW1at0YU9umF3Kv/3KaOGWN6iSM2FBaQzPuVGAHjq', '2026-01-09 16:08:10', '2026-01-09 16:08:10'),
(21, 2, 1, NULL, 'RAKOTO', 'Jean', 'H', '+261340000011', 'admin.tragnobe@antambahoaka.mg', 'Mananjary', '1985', NULL, 'valide', '$2y$12$YRZj5hnMvioEitkSRA88fOXLKJx5w5E2oALzTRMY02loNY8bptBGC', '2026-01-09 16:08:25', '2026-01-09 16:08:25'),
(23, 3, 1, NULL, 'RABE', 'Marie', 'F', '+261340000022', 'membre@antambahoaka.mg', 'Mananjary', '1990', 'photos/avatar_marie_1767976315.svg', 'valide', '$2y$12$z7Y00aO/MzKwwEplfYiOfupFxIYatDcq92pAzcDz0vTgWFvf/TnmC', '2026-01-09 16:08:40', '2026-01-09 16:31:55'),
(24, 3, 1, NULL, 'RAKOTO', 'Antoine', 'H', '+261340000099', 'test1768055035607@antambahoaka.mg', 'Mananjary', '1995', NULL, 'en_attente', '$2y$12$ijfrdwh4o9NNWdjP7ZWMqOhkjgC8T8obgAt0/.LYQHHlGNk8t/d3y', '2026-01-10 14:24:08', '2026-01-10 14:24:08'),
(34, 3, 2, NULL, 'RAKOTOMALALA', 'Antoine', 'H', '+262692060753', 'rakotomalalaantoine@antambahoaka.mg', 'Mananjary', '1923', NULL, 'valide', '$2y$12$.OcvM/Ldc2cMtKdP2GQ3WuxQyitL5thscEr8bmO0WzAmu5.YjYAAe', '2026-01-10 14:38:06', '2026-01-10 14:46:15');

--
-- Déclencheurs `users`
--
DROP TRIGGER IF EXISTS `trg_user_insert`;
DELIMITER $$
CREATE TRIGGER `trg_user_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO `logs_activites` (`acteur_type`, `acteur_id`, `action`, `description`)
    VALUES ('user', NEW.id, 'inscription', CONCAT('Nouvel utilisateur: ', NEW.prenom, ' ', NEW.nom));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `v_cotisations_par_tragnobe`
--

DROP TABLE IF EXISTS `v_cotisations_par_tragnobe`;
CREATE TABLE IF NOT EXISTS `v_cotisations_par_tragnobe` (
  `nb_paiements` bigint DEFAULT NULL,
  `total_cotisations` decimal(32,2) DEFAULT NULL,
  `tragnobe_id` int DEFAULT NULL,
  `tragnobe_nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `v_users_par_tragnobe`
--

DROP TABLE IF EXISTS `v_users_par_tragnobe`;
CREATE TABLE IF NOT EXISTS `v_users_par_tragnobe` (
  `nb_en_attente` decimal(23,0) DEFAULT NULL,
  `nb_utilisateurs` bigint DEFAULT NULL,
  `nb_valides` decimal(23,0) DEFAULT NULL,
  `tragnobe_id` int DEFAULT NULL,
  `tragnobe_nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cotisations`
--
ALTER TABLE `cotisations`
  ADD CONSTRAINT `fk_cotisation_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `dons`
--
ALTER TABLE `dons`
  ADD CONSTRAINT `fk_don_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `relations`
--
ALTER TABLE `relations`
  ADD CONSTRAINT `fk_relation_user1` FOREIGN KEY (`id_user1`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_relation_user2` FOREIGN KEY (`id_user2`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_tragnobe` FOREIGN KEY (`id_tragnobe`) REFERENCES `tragnobes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
