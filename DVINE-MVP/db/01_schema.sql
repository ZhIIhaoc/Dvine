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
    regularPrice DECIMAL(10,2) NOT NULL COMMENT "Price for regular members (permission 0)",
    premiumPrice DECIMAL(10,2) NOT NULL COMMENT "Price for premium members (permission 1+)",
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
    regularPrice DECIMAL(10,2) NOT NULL COMMENT "Price for regular members (permission 0)",
    premiumPrice DECIMAL(10,2) NOT NULL COMMENT "Price for premium members (permission 1+)",
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

CREATE TABLE IF NOT EXISTS featured_tours (
    featuredTourId BIGINT AUTO_INCREMENT PRIMARY KEY,
    tourId BIGINT NOT NULL UNIQUE,
    displayOrder INT NOT NULL COMMENT "Order in which the tour appears on the main page (1 = first)",
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tourId) REFERENCES tours(tourId) ON DELETE CASCADE
);

-- Index for efficient ordering on main page
CREATE INDEX idx_featured_tours_order ON featured_tours (displayOrder);

-- FAQ table for frequently asked questions
CREATE TABLE IF NOT EXISTS faqs (
    faqId BIGINT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default catalogue for tours not assigned to any catalogue
INSERT INTO catalogues
(title, description, coverImage)
VALUES
    ('Default Catalogue',
     'Build-in catalogue for the tours not assigned to any catalogue',
     'https://this-is-image-cover.jpg'
    );

-- Insert sample FAQ data
INSERT INTO faqs (question, answer)
VALUES
    ('How do I book a tour?', 'You can book a tour by browsing our catalogue, selecting your preferred tour, and following the booking process. Payment can be made securely online.'),
    ('What is your cancellation policy?', 'Tours can be cancelled up to 48 hours before the scheduled date for a full refund. Cancellations within 48 hours are subject to a 50% cancellation fee.'),
    ('Are tours suitable for children?', 'Most of our tours are family-friendly. Please check the specific tour details for age recommendations and any restrictions.'),
    ('What should I bring on a tour?', 'We recommend comfortable walking shoes, weather-appropriate clothing, a camera, and any personal items you may need. Specific requirements will be listed in your tour confirmation.'),
    ('How do I become a tour partner?', 'To become a tour partner, please contact our partnership team through the contact form. We will review your application and get back to you within 5 business days.');