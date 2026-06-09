-- Seed users (password is 123456 encoded with some secret, but for now just raw or placeholder if not using BCrypt yet)
-- Admin: admin / 123456
-- Seed users
-- Password '123456' hashed with BCrypt
INSERT INTO `users` (`id`, `username`, `password`, `role`, `nickname`) VALUES 
(1, 'admin', '$2b$12$901O3oktLN0z38QaFBfdV.eoPZueTdtbmG89zblwvLIAygZ7koeRG', 'ADMIN', '超级管理员'),
(2, 'user', '$2b$12$901O3oktLN0z38QaFBfdV.eoPZueTdtbmG89zblwvLIAygZ7koeRG', 'USER', '普通员工')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `role` = VALUES(`role`), `nickname` = VALUES(`nickname`);

-- Categories
INSERT INTO `categories` (`id`, `name`, `description`) VALUES 
(1, '电子产品', '手机、电脑、显示器等'),
(2, '办公用品', '笔、本子、文件夹等'),
(3, '生活用品', '水杯、清洁用品等')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- Goods
INSERT INTO `goods` (`id`, `name`, `code`, `category_id`, `stock`, `unit`, `price`, `remark`) VALUES 
(1, 'iPhone 15', 'G001', 1, 100, '台', 5999.00, '首批入库'),
(2, 'MacBook Air', 'G002', 1, 50, '台', 8999.00, '新款 M3'),
(3, '得力 0.5 签字笔', 'G003', 2, 500, '支', 2.50, '常规备货')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `code` = VALUES(`code`), `category_id` = VALUES(`category_id`), `stock` = VALUES(`stock`), `unit` = VALUES(`unit`), `price` = VALUES(`price`), `remark` = VALUES(`remark`);

-- Inventory records
INSERT INTO `inventory_records` (`id`, `goods_id`, `type`, `quantity`, `operator_id`, `operator_name`) VALUES 
(1, 1, 'IN', 100, 1, '超级管理员'),
(2, 2, 'IN', 50, 1, '超级管理员'),
(3, 3, 'IN', 500, 1, '超级管理员')
ON DUPLICATE KEY UPDATE `goods_id` = VALUES(`goods_id`), `type` = VALUES(`type`), `quantity` = VALUES(`quantity`), `operator_id` = VALUES(`operator_id`), `operator_name` = VALUES(`operator_name`);
