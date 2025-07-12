-- DVINE initial schema --------------------------

CREATE DATABASE IF NOT EXISTS dvine_db;
USE dvine_db;

CREATE TABLE IF NOT EXISTS users (
     userId     BIGINT AUTO_INCREMENT PRIMARY KEY,
     email       VARCHAR(255) UNIQUE NOT NULL,
     nickName   VARCHAR(50),
     firstName  VARCHAR(50),
     lastName   VARCHAR(50),
     password    VARCHAR(255) NOT NULL,
     phone       VARCHAR(20),
     postcode    VARCHAR(20),
     avatar      VARCHAR(255),
     permission  INT DEFAULT 0 COMMENT "0 Regular member, 1 premium member, 2 partner(lowest admin), 3 manager, 4 owner",
     createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
     updateTime DATETIME DEFAULT CURRENT_TIMESTAMP
         ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogues (
    catalogueId BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    coverImage VARCHAR(255),
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
    tourId BIGINT AUTO_INCREMENT PRIMARY KEY,
    catalogueId BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (catalogueId) REFERENCES catalogues(catalogueId)
);

CREATE TABLE IF NOT EXISTS images (
    imageId BIGINT AUTO_INCREMENT PRIMARY KEY,
    tourId BIGINT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    isPrimary BOOLEAN DEFAULT FALSE COMMENT "Tour Primary image, each tour only have 1 primary image",
    FOREIGN KEY (tourId) REFERENCES tours(tourId)
);
