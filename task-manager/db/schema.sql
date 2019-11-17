CREATE database tasks;

USE tasks;

 CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_by` varchar(150) NOT NULL,
  `assignee` varchar(150) DEFAULT NULL,
  `status` enum('TO-DO','PENDING','DOING','DONE') DEFAULT 'TO-DO',
  `verified` tinyint(1) DEFAULT '0',
  `dependency_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dependeny_fk` (`dependency_id`),
  CONSTRAINT `dependeny_fk` FOREIGN KEY (`dependency_id`) REFERENCES `tasks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;