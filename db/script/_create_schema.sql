drop schema if exists `common_product`;
CREATE SCHEMA `common_product` ;
CREATE USER 'biz'@'localhost' IDENTIFIED BY 'wise';

GRANT ALL privileges ON common_product.* TO 'biz'@'%'IDENTIFIED BY 'wise';