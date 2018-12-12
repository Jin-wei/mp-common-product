DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_lang` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `display_order` int(4) unsigned NULL DEFAULT '1',
  `system_flag` tinyint(1) NOT NULL DEFAULT '0',
  `display_flag` tinyint(1) NOT NULL DEFAULT '0',
  `tenant` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product and product type tags information.';

DROP TABLE IF EXISTS `prod_type`;
CREATE TABLE `prod_type` (
  `type_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `parent_type_id` bigint(11),
  `name` varchar(255) NOT NULL,
  `name_lang` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `external_id` varchar(255) DEFAULT NULL,
  `display_order` int(4) unsigned NULL DEFAULT '1',
  `biz_id` bigint(11) unsigned NOT NULL,
  `tenant` varchar(32) NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product type information.';

ALTER TABLE prod_type ADD column type_code varchar(32) DEFAULT NULL;
ALTER TABLE prod_type ADD UNIQUE (biz_id,tenant,type_code);
ALTER TABLE prod_type ADD UNIQUE (biz_id,tenant,name);
ALTER TABLE prod_type MODIFY COLUMN `parent_type_id` bigint(11)  unsigned DEFAULT NULL;
ALTER TABLE prod_type ADD FOREIGN KEY(`parent_type_id`) REFERENCES prod_type(`type_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `prod_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `type_id` bigint(11) unsigned DEFAULT NULL,
  `name_lang` varchar(100) DEFAULT NULL,
  `description_lang` varchar(500) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint(11)  DEFAULT NULL,
  `calorie` int(4) DEFAULT NULL,
  `ingredient` varchar(255) DEFAULT NULL,
  `ingredient_lang` varchar(255) DEFAULT NULL,
  `external_id` varchar(200)  default NULL,
  `tenant` varchar(32) NOT NULL,
  `prod_size` varchar(500) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  `prod_code` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`prod_id`),
  CONSTRAINT `product_type_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=103177 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product information.';

ALTER TABLE product MODIFY column prod_code varchar(32);
ALTER TABLE product ADD UNIQUE (biz_id,tenant,prod_code);
ALTER TABLE product ADD UNIQUE (biz_id,tenant,name);
ALTER TABLE product ADD `biz_name` varchar(100) DEFAULT NULL;
ALTER TABLE product ADD `weight` varchar(100) DEFAULT NULL;
ALTER TABLE product ADD `measurement` varchar(100) DEFAULT NULL;
ALTER TABLE product ADD `unit_of_measure` varchar(100) DEFAULT NULL;
ALTER TABLE product ADD `floor_price` decimal(10,2) DEFAULT NULL;
ALTER TABLE product ADD `wholesale_price` decimal(10,2) DEFAULT NULL;
ALTER TABLE product ADD `min_purchase_quantity` int(4) DEFAULT NULL;
ALTER TABLE product ADD `tax_included` tinyint(1) DEFAULT NULL;
ALTER TABLE product ADD `tax` decimal(10,3) DEFAULT NULL;
ALTER TABLE product ADD `transport_fee_payee` varchar(32) DEFAULT NULL;

DROP TABLE IF EXISTS `prod_image`;
CREATE TABLE `prod_image` (
  `tenant` varchar(32) NOT NULL,
  `img_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `prod_id` bigint(11) unsigned NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_flag` int(4) unsigned NULL DEFAULT '0',
  PRIMARY KEY (`img_id`),
  CONSTRAINT `product_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product and image one to many information.';

ALTER TABLE prod_image ADD UNIQUE (biz_id,tenant,prod_id,img_url);
ALTER TABLE prod_image ADD column img_type varchar(16) DEFAULT NULL;

DROP TABLE IF EXISTS `prod_type_tag`;
CREATE TABLE `prod_type_tag` (
  `tenant` varchar(32) NOT NULL,
  `id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `type_id` bigint(11) unsigned NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `tag_id` bigint(11) unsigned NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `product_type_tag_prod_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE Cascade ON UPDATE NO ACTION,
   CONSTRAINT `product_type_tag_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product type and tag one to many information.';
ALTER TABLE prod_type_tag ADD UNIQUE (tenant,type_id,tag_id);

DROP TABLE IF EXISTS `prod_image`;
CREATE TABLE `prod_image` (
  `tenant` varchar(32) NOT NULL,
  `img_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `prod_id` bigint(11) unsigned NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_flag` int(4) unsigned NULL DEFAULT '0',
  PRIMARY KEY (`img_id`),
  CONSTRAINT `product_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product and image one to many information.';

ALTER TABLE prod_image ADD UNIQUE (biz_id,tenant,prod_id,img_url);
ALTER TABLE prod_image ADD column img_type varchar(16) DEFAULT NULL;

DROP TABLE IF EXISTS `prod_tag`;
CREATE TABLE `prod_tag` (
  `tenant` varchar(32) NOT NULL,
  `id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `prod_id` bigint(11) unsigned NOT NULL,
  `tag_id` bigint(11) unsigned NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `prod_tag_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE Cascade ON UPDATE NO ACTION,
  CONSTRAINT `product_tag_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product and tag one to many information.';

DROP TABLE IF EXISTS `prod_comment`;
CREATE TABLE `prod_comment` (
      `tenant` varchar(32) NOT NULL,
      `comment_id` bigint(11) NOT NULL AUTO_INCREMENT,
      `prod_id` bigint(11) NOT NULL,
      `biz_id` bigint(11) unsigned NOT NULL,
      `user_id` bigint(11) NOT NULL,
      `user_name` varchar(500) NOT NULL,
      `city` varchar(500) NOT NULL,
      `comment` varchar(500) NOT NULL,
      `rating` smallint(1) NOT NULL,
      `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `active` tinyint(1) NOT NULL DEFAULT '1',
      PRIMARY KEY (`comment_id`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `prod_type_image`;
CREATE TABLE `prod_type_image` (
  `tenant` varchar(32) NOT NULL,
  `img_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `type_id` bigint(11) unsigned NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_flag` int(4) unsigned NULL DEFAULT '0',
  PRIMARY KEY (`img_id`),
  CONSTRAINT `product_type_image_product_type_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product type and image one to many information.';

ALTER TABLE prod_type_image ADD UNIQUE (biz_id,tenant,type_id,img_url);

DROP TABLE IF EXISTS `favorite_prod`;
CREATE TABLE `favorite_prod` (
  `tenant` varchar(32) NOT NULL,
  `id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `prod_id` bigint(11) unsigned NOT NULL,
  `user_id` bigint(11) unsigned NOT NULL,
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT favorite_prod_prod_id FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold user favorite product';
ALTER TABLE favorite_prod ADD UNIQUE (tenant,prod_id,user_id);

/*==============================================================*/
/* Table: prod_inventory                                         */
/*==============================================================*/
DROP TABLE IF EXISTS `prod_inventory`;
CREATE TABLE `prod_inventory` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `tenant` varchar(32) NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `prod_id` bigint(11) NOT NULL,
  `quantity` decimal(10,2)  NOT NULL DEFAULT 0,
  `note` varchar(128) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint(11) NOT NULL,
  `updated_by` bigint(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold channel product inventory';
ALTER TABLE prod_inventory ADD UNIQUE (tenant,prod_id,biz_id);

/*==============================================================*/
/* Table: prod_lov                                        */
/*==============================================================*/
DROP TABLE IF EXISTS `lov`;
CREATE TABLE `lov` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `tenant` varchar(32) NOT NULL,
  `name`   varchar(200) NOT NULL,
  `description`   varchar(500) NOT NULL,
  `timestamp_val` timestamp,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint(11),
  `updated_by` bigint(11),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold mis setting and value in product module';

