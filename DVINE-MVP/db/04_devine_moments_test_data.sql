-- DVINE Moments Test Data
-- Insert test users (if not exist)
INSERT IGNORE INTO users (userId, email, nickName, firstName, lastName, password, permission, createTime) VALUES
(1001, 'traveler1@test.com', 'TravelLover', 'John', 'Smith', '$2a$10$test', 0, NOW()),
(1002, 'photographer@test.com', 'PhotoPro', 'Sarah', 'Johnson', '$2a$10$test', 0, NOW()),
(1003, 'adventurer@test.com', 'AdventureSeeker', 'Mike', 'Brown', '$2a$10$test', 0, NOW()),
(1004, 'explorer@test.com', 'WorldExplorer', 'Emma', 'Davis', '$2a$10$test', 0, NOW()),
(1005, 'wanderer@test.com', 'Wanderlust', 'David', 'Wilson', '$2a$10$test', 0, NOW());

-- Insert DVINE Moments test data
INSERT INTO devine_moments (momentId, userId, title, content, location, likeCount, commentCount, createTime) VALUES
     (1, 1001, 'Stunning Sunset at Sydney Harbour Bridge', 'Today I captured an amazing sunset at Sydney Harbour Bridge! The golden sunlight spread across the sea, painting the entire city in gold. This is definitely one of the most beautiful sunsets I have ever seen!', 'Sydney Harbour Bridge, Australia', 15, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
     (2, 1002, 'Great Barrier Reef Diving Experience', 'Diving at the Great Barrier Reef was an unforgettable experience! The crystal clear water, colorful coral reefs, and various tropical fish swimming around. This is truly a miracle of nature!', 'Great Barrier Reef, Australia', 28, 7, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
     (3, 1003, 'Starry Night at Uluru', 'Camping at Uluru, gazing up at the starry sky. Far from city light pollution, the stars here are so clear, almost within reach. The Milky Way stretches across the sky, breathtakingly beautiful.', 'Uluru, Northern Territory, Australia', 42, 12, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert moment image data with reliable placeholder images
INSERT INTO devine_moment_images (imageId, momentId, imageUrl, isPrimary, createTime) VALUES
(1, 1, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/1/6606cd8678d77b7a757349ac00416de2.jpeg', TRUE, NOW()),
(6, 1, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/1/32bd948e38682e4226a87d9091e8d86a.webp', FALSE, NOW()),
(2, 1, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/1/%E5%A5%87%E7%89%A9%E9%AA%B0%E5%AD%90.jpeg', FALSE, NOW()),
(3, 2, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/2/57fui6cuoxm91.webp', TRUE, NOW()),
(4, 2, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/2/1a45f3b2174f194c4f5c5bca899e740c.jpeg', FALSE, NOW()),
(5, 3, 'https://dvine-media.s3.ap-southeast-2.amazonaws.com/moments/%E4%B8%8B%E5%8D%88%E8%8C%B6.jpeg', TRUE, NOW());

-- Insert like data
INSERT INTO devine_moment_likes (momentId, userId, createTime) VALUES
(1, 1002, NOW()),
(1, 1003, NOW()),
(1, 1004, NOW()),
(2, 1001, NOW()),
(2, 1003, NOW()),
(2, 1005, NOW()),
(3, 1001, NOW()),
(3, 1002, NOW()),
(3, 1004, NOW()),
(3, 1005, NOW());

-- Insert comment data
INSERT INTO devine_moment_comments (momentId, userId, content, createTime) VALUES
(1, 1002, 'So beautiful! I want to see the sunset in Sydney too!', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 1003, 'Great photo! The composition is excellent!', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 1004, 'Sydney\'s sunset is indeed beautiful, especially from the Harbour Bridge', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(2, 1001, 'The Great Barrier Reef is my dream destination!', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1003, 'How was the diving experience? Do you need any certificates?', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 1005, 'The coral colors are so beautiful!', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 1001, 'What equipment do you need for astrophotography?', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(3, 1002, 'The starry sky at Uluru is truly breathtaking!', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(3, 1004, 'I want to go camping to see the stars too', DATE_SUB(NOW(), INTERVAL 21 HOUR));

-- Update moment like and comment counts
UPDATE devine_moments SET 
    likeCount = (SELECT COUNT(*) FROM devine_moment_likes WHERE momentId = devine_moments.momentId),
    commentCount = (SELECT COUNT(*) FROM devine_moment_comments WHERE momentId = devine_moments.momentId);