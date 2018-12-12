DROP TABLE IF EXISTS `product_label`;
CREATE TABLE `product_label` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `prod_id` bigint(11) NOT NULL,
  `label_id` bigint(11) NOT NULL,
  `label_name` varchar(30) DEFAULT '0',
  PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

DROP TABLE IF EXISTS `all_label`;
CREATE TABLE `all_label` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `label_name` varchar(30) DEFAULT NULL,
  `label_name_lan` varchar(30) DEFAULT NULL,
  `key_word` varchar(1000) DEFAULT NULL,
  `key_word_lan` varchar(1000) DEFAULT NULL,
  `label_kind` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 ;
