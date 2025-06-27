-- DVINE initial schema --------------------------

CREATE DATABASE IF NOT EXISTS dvine_db;
USE dvine_db;

CREATE TABLE IF NOT EXISTS users (
     user_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
     password    VARCHAR(255) NOT NULL,
     email       VARCHAR(255) UNIQUE NOT NULL,
     phone       VARCHAR(20),
     postcode    VARCHAR(20),
     nick_name   VARCHAR(50),
     first_name  VARCHAR(50),
     last_name   VARCHAR(50),
     avatar      VARCHAR(255),
     permission  INT DEFAULT 0,
     create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
     update_time DATETIME DEFAULT CURRENT_TIMESTAMP
         ON UPDATE CURRENT_TIMESTAMP
);