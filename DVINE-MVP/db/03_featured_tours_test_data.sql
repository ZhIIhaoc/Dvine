/* ------------------------------------------------------------------
   Test data for featured tours system
   – Creates sample catalogues, tours, images, and featured tours
   – Provides comprehensive data to test all featured tour endpoints
   ------------------------------------------------------------------ */

-- Insert test catalogues first
INSERT INTO catalogues (title, description, coverImage)
VALUES
    ('Premium Destinations', 'Exclusive tours featuring luxury destinations and premium experiences.', 'https://example.com/premium-cover.jpg'),
    ('Adventure Tours', 'Thrilling adventures for the bold and brave.', 'https://example.com/adventure-cover.jpg'),
    ('Cultural Heritage', 'Discover rich cultural heritage and historical sites.', 'https://example.com/culture-cover.jpg');

-- Insert test tours
INSERT INTO tours (catalogueId, title, destination, description, regularPrice, premiumPrice, createdBy)
VALUES
    -- Tours for catalogue 1 (Premium Destinations) - Created by Owner (5) and Manager (4)
    (1, 'Luxury Tokyo Experience', 'Tokyo, Japan', 'Experience Tokyo like never before with luxury accommodations, private guides, and exclusive access to hidden gems.', 3500.00, 3150.00, 5),
    (1, 'Paris Elite Tour', 'Paris, France', 'A sophisticated journey through Paris including Michelin-starred dining, private museum tours, and luxury shopping.', 4200.00, 3780.00, 5),
    (1, 'Swiss Alps Retreat', 'Swiss Alps, Switzerland', 'Ultimate luxury mountain retreat with helicopter tours, spa treatments, and world-class skiing.', 5800.00, 5220.00, 4),
    
    -- Tours for catalogue 2 (Adventure Tours) - Created by Manager (4) and Owner (5) 
    (2, 'Amazon Jungle Expedition', 'Amazon Rainforest, Brazil', 'Deep jungle exploration with wildlife spotting, indigenous culture encounters, and river adventures.', 2100.00, 1890.00, 4),
    (2, 'Himalayan Base Camp Trek', 'Everest Region, Nepal', 'Epic trekking adventure to Everest Base Camp with experienced guides and stunning mountain views.', 2800.00, 2520.00, 4),
    (2, 'African Safari Adventure', 'Serengeti, Tanzania', 'Witness the Great Migration and Big Five wildlife in luxury safari camps.', 3200.00, 2880.00, 5),
    
    -- Tours for catalogue 3 (Cultural Heritage) - Created by Manager (4) and Owner (5)
    (3, 'Ancient Rome Discovery', 'Rome, Italy', 'Explore ancient Roman history with expert archaeologists and exclusive access to historical sites.', 1800.00, 1620.00, 4),
    (3, 'Kyoto Temple Journey', 'Kyoto, Japan', 'Immerse yourself in traditional Japanese culture with temple visits, tea ceremonies, and zen gardens.', 2200.00, 1980.00, 5),
    (3, 'Egyptian Pyramid Quest', 'Giza, Egypt', 'Uncover the mysteries of ancient Egypt with guided pyramid tours and museum visits.', 2500.00, 2250.00, 4);

-- Insert test images for tours
INSERT INTO images (tourId, imageUrl, isPrimary)
VALUES
    -- Images for Tokyo tour (tourId: 1)
    (1, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/1/Tokyo1.jpg', TRUE),
    (1, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/1/tokyo2.jpeg', FALSE),
    -- Images for Paris tour (tourId: 2)
    (2, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/2/Paris1.jpg', TRUE),
    (2, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/2/Paris2.jpeg', FALSE),
    (2, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/2/Paris3.jpeg', FALSE),
    
    -- Images for Swiss Alps tour (tourId: 3)
    (3, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/3/Swiss1.jpeg', TRUE),
    (3, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/3/Swiss2.jpeg', FALSE),

    -- Images for Amazon tour (tourId: 4)
    (4, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/4/Amazon1.jpeg', TRUE),
    (4, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/4/Amazon2.jpeg', FALSE),

    -- Images for Himalayan tour (tourId: 5)
    (5, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/5/Himalayan1.jpeg', TRUE),
    
    -- Images for Safari tour (tourId: 6)
    (6, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/6/Safari2.jpeg', TRUE),
    (6, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/6/Safari2.jpeg', FALSE),

    -- Images for Rome tour (tourId: 7)
    (7, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/7/Rome1.jpeg', TRUE),
    
    -- Images for Kyoto tour (tourId: 8)
    (8, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/8/Kyoto.jpeg', TRUE),
    
    -- Images for Egypt tour (tourId: 9)
    (9, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/tours/9/Egypt.jpeg', TRUE);

-- Insert featured tours (these will be displayed on the main page)
-- Adding 5 featured tours in specific display order
INSERT INTO featured_tours (tourId, displayOrder)
VALUES
    (1, 1),  -- Luxury Tokyo Experience (Premium destination)
    (4, 2),  -- Amazon Jungle Expedition (Adventure)
    (2, 3),  -- Paris Elite Tour (Premium destination)
    (8, 4),  -- Kyoto Temple Journey (Cultural)
    (6, 5);  -- African Safari Adventure (Adventure)

-- Additional data comments:
-- This provides:
-- 1. 3 catalogues with different themes
-- 2. 9 tours across different price ranges ($1800-$5800)
-- 3. 27 images (3 per tour with primary image marked)
-- 4. 5 featured tours for testing the main page functionality
--
-- Featured tours selection represents a good mix:
-- - Different price points
-- - Different categories (Premium, Adventure, Cultural)
-- - Different destinations (Asia, Europe, Africa, South America)
--
-- This allows testing:
-- ✓ GET /featured-tours (public access)
-- ✓ GET /featured-tours/management (manager access)
-- ✓ POST /featured-tours/{tourId} (add new featured tour)
-- ✓ DELETE /featured-tours/{tourId} (remove featured tour)
-- ✓ PUT /featured-tours/reorder (reorder featured tours)