INSERT INTO `tag` (`id`, `name`, `name_lang`, `description`, `active`, `created_by`, `created_on`, `updated_on`, `display_order`, `system_flag`, `display_flag`, `tenant`)
VALUES
	(1,'置顶',NULL,'显示在首页',1,NULL,'2016-07-22 16:30:27','2016-07-22 16:30:27',1,1,0,'jjc');
INSERT INTO `tag` (`id`, `name`, `name_lang`, `description`, `active`, `created_by`, `created_on`, `updated_on`, `display_order`, `system_flag`, `display_flag`, `tenant`)
VALUES
	(2,'Banner',NULL,'显示在Banner',1,NULL,'2017-08-13 16:30:27','2017-08-13 16:30:27',1,1,0,'jjc');

-- setting for auto decrement inventory based on order item create date
INSERT INTO `lov` (`id`, `name`, `description`, `timestamp_val`, `created_by`, `created_on`, `updated_on`, `updated_by`, `tenant`)
VALUES
	(1,'updateinventory_lastorderitemcreatedate','last order item created date to update inventory','2017-08-19',NULL,'2017-08-19','2017-08-19',NULL,'jjc');
