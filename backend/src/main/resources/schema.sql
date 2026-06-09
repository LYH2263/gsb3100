-- Create database if not exists
-- CREATE DATABASE IF NOT EXISTS warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE warehouse;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `nickname` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Goods table
CREATE TABLE IF NOT EXISTS `goods` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `category_id` BIGINT,
    `stock` INT NOT NULL DEFAULT 0,
    `unit` VARCHAR(20),
    `price` DECIMAL(10, 2),
    `remark` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory records table
CREATE TABLE IF NOT EXISTS `inventory_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `goods_id` BIGINT NOT NULL,
    `type` VARCHAR(10) NOT NULL, -- IN or OUT
    `quantity` INT NOT NULL,
    `operator_id` BIGINT NOT NULL,
    `operator_name` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`goods_id`) REFERENCES `goods`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Operation logs table
CREATE TABLE IF NOT EXISTS `operation_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50),
    `operation` VARCHAR(100),
    `method` VARCHAR(200),
    `params` TEXT,
    `ip` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stocktakes table
CREATE TABLE IF NOT EXISTS `stocktakes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `category_id` BIGINT,
    `creator_id` BIGINT,
    `creator_name` VARCHAR(50),
    `confirmer_id` BIGINT,
    `confirmer_name` VARCHAR(50),
    `confirmed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stocktake items table
CREATE TABLE IF NOT EXISTS `stocktake_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `stocktake_id` BIGINT NOT NULL,
    `goods_id` BIGINT NOT NULL,
    `goods_name` VARCHAR(100),
    `goods_code` VARCHAR(50),
    `system_stock` INT NOT NULL DEFAULT 0,
    `actual_stock` INT NULL,
    `difference` INT NULL,
    `unit` VARCHAR(20),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`stocktake_id`) REFERENCES `stocktakes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`goods_id`) REFERENCES `goods`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
