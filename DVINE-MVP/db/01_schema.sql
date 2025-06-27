-- DVINE initial schema --------------------------

CREATE DATABASE IF NOT EXISTS dvine_db;
USE dvine_db;

CREATE TABLE IF NOT EXISTS users (
     userId     BIGINT AUTO_INCREMENT PRIMARY KEY,
     password    VARCHAR(255) NOT NULL,
     email       VARCHAR(255) UNIQUE NOT NULL,
     phone       VARCHAR(20),
     postcode    VARCHAR(20),
     nickName   VARCHAR(50),
     firstName  VARCHAR(50),
     lastName   VARCHAR(50),
     avatar      VARCHAR(255),
     permission  INT DEFAULT 0,
     createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
     updateTime DATETIME DEFAULT CURRENT_TIMESTAMP
         ON UPDATE CURRENT_TIMESTAMP
);