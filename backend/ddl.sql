CREATE TABLE `foire_vetements` (
	`id` INT NOT NULL AUTO_INCREMENT ,
	`uuid` VARCHAR(36) NOT NULL ,
	`first_name` TEXT NOT NULL ,
	`last_name` TEXT NOT NULL ,
	`email` TEXT NOT NULL ,
	`slots` INT(1) NOT NULL ,
	`member` BOOLEAN NOT NULL ,
	`confirmed` BOOLEAN NOT NULL DEFAULT 0 ,
	`cancelled` BOOLEAN NOT NULL DEFAULT 0 ,
	`created_on` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' , -- http://stackoverflow.com/questions/267658/having-both-a-created-and-last-updated-timestamp-columns-in-mysql-4-0
	`updated_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
	`client_ip` TEXT NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = MyISAM;

CREATE TABLE `foire_vetements_meta` (
	`id` INT NOT NULL AUTO_INCREMENT ,
	`total_slots` INT(3) NOT NULL ,
	PRIMARY KEY (`id`)
) ENGINE = MyISAM;

INSERT INTO `foire_vetements_meta` (total_slots) VALUES (100);



-- Example: INSERT INTO `foire_vetements` (uuid, first_name, last_name, email, slots, created_on, client_ip) VALUES ('aaaa-bbbb-cccc-dddd', 'Seb', 'Dub', 'lol@lol.com', 2, now(), '127.0.0.1');
-- Note that we MUST provide a value for created_on (it can't have CURRENT_TIMESTAMP unless Mysql >= 5.6.5 is used)
