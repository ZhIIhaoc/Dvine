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
    createdBy BIGINT NOT NULL COMMENT "User ID who created this tour",
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (catalogueId) REFERENCES catalogues(catalogueId),
    FOREIGN KEY (createdBy) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS images (
    imageId BIGINT AUTO_INCREMENT PRIMARY KEY,
    tourId BIGINT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    isPrimary BOOLEAN DEFAULT FALSE COMMENT "Tour Primary image, each tour only have 1 primary image",
    FOREIGN KEY (tourId) REFERENCES tours(tourId)
);

CREATE TABLE IF NOT EXISTS pending_tours (
    pendingTourId BIGINT AUTO_INCREMENT PRIMARY KEY,
    catalogueId BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    primaryImageUrl VARCHAR(255),
    submittedBy BIGINT NOT NULL COMMENT "User ID who submitted this tour for approval",
    operationType ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL COMMENT "Type of operation requested",
    originalTourId BIGINT NULL COMMENT "Reference to original tour for UPDATE/DELETE operations",
    status TINYINT NOT NULL DEFAULT 0 COMMENT "0=PENDING, 1=APPROVED, 2=REJECTED",
    reviewedBy BIGINT NULL COMMENT "User ID who reviewed this request",
    submissionTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewTime DATETIME NULL,
    FOREIGN KEY (catalogueId) REFERENCES catalogues(catalogueId),
    FOREIGN KEY (submittedBy) REFERENCES users(userId),
    FOREIGN KEY (reviewedBy) REFERENCES users(userId),
    FOREIGN KEY (originalTourId) REFERENCES tours(tourId)
);

CREATE TABLE IF NOT EXISTS pending_tour_images (
    pendingImageId BIGINT AUTO_INCREMENT PRIMARY KEY,
    pendingTourId BIGINT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    isPrimary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (pendingTourId) REFERENCES pending_tours(pendingTourId) ON DELETE CASCADE
);

-- Insert default catalogue for tours not assigned to any catalogue
INSERT INTO catalogues
(title, description, coverImage)
VALUES
    ('Default Catalogue',
     'Build-in catalogue for the tours not assigned to any catalogue',
     'https://this-is-image-cover.jpg'
    );