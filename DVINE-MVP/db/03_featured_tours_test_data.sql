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
    (1, 'https://example.com/tokyo-skyline.jpg', TRUE),
    (1, 'https://example.com/tokyo-temple.jpg', FALSE),
    (1, 'https://example.com/tokyo-cuisine.jpg', FALSE),
    
    -- Images for Paris tour (tourId: 2)
    (2, 'https://example.com/paris-eiffel.jpg', TRUE),
    (2, 'https://example.com/paris-louvre.jpg', FALSE),
    (2, 'https://example.com/paris-dining.jpg', FALSE),
    
    -- Images for Swiss Alps tour (tourId: 3)
    (3, 'https://example.com/alps-mountain.jpg', TRUE),
    (3, 'https://example.com/alps-skiing.jpg', FALSE),
    (3, 'https://example.com/alps-spa.jpg', FALSE),
    
    -- Images for Amazon tour (tourId: 4)
    (4, 'https://example.com/amazon-rainforest.jpg', TRUE),
    (4, 'https://example.com/amazon-wildlife.jpg', FALSE),
    (4, 'https://example.com/amazon-river.jpg', FALSE),
    
    -- Images for Himalayan tour (tourId: 5)
    (5, 'https://example.com/everest-basecamp.jpg', TRUE),
    (5, 'https://example.com/himalayan-peaks.jpg', FALSE),
    (5, 'https://example.com/sherpa-guide.jpg', FALSE),
    
    -- Images for Safari tour (tourId: 6)
    (6, 'https://example.com/serengeti-lions.jpg', TRUE),
    (6, 'https://example.com/safari-elephants.jpg', FALSE),
    (6, 'https://example.com/migration-scene.jpg', FALSE),
    
    -- Images for Rome tour (tourId: 7)
    (7, 'https://example.com/colosseum.jpg', TRUE),
    (7, 'https://example.com/roman-forum.jpg', FALSE),
    (7, 'https://example.com/vatican-city.jpg', FALSE),
    
    -- Images for Kyoto tour (tourId: 8)
    (8, 'https://example.com/kyoto-temple.jpg', TRUE),
    (8, 'https://example.com/tea-ceremony.jpg', FALSE),
    (8, 'https://example.com/zen-garden.jpg', FALSE),
    
    -- Images for Egypt tour (tourId: 9)
    (9, 'https://example.com/giza-pyramids.jpg', TRUE),
    (9, 'https://example.com/sphinx.jpg', FALSE),
    (9, 'https://example.com/cairo-museum.jpg', FALSE);

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