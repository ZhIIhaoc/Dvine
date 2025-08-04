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
     (3, 1003, 'Starry Night at Uluru', 'Camping at Uluru, gazing up at the starry sky. Far from city light pollution, the stars here are so clear, almost within reach. The Milky Way stretches across the sky, breathtakingly beautiful.', 'Uluru, Northern Territory, Australia', 42, 12, DATE_SUB(NOW(), INTERVAL 1 DAY)),
     (4, 1004, 'Melbourne Coffee Culture Tour', 'Melbourne\'s coffee culture is truly fascinating! Each café has its own unique style and story. Today I tried the local favorite flat white, and it tasted amazing!', 'Melbourne, Victoria, Australia', 23, 5, DATE_SUB(NOW(), INTERVAL 2 DAY)),
     (5, 1005, 'Tasmania Wilderness Hiking', 'Hiking in the wilderness of Tasmania, experiencing the raw beauty of nature. Ancient rainforests, clear streams, and various wildlife. This is a true adventure!', 'Tasmania Wilderness, Australia', 35, 8, DATE_SUB(NOW(), INTERVAL 3 DAY)),
     (6, 1001, 'Gold Coast Surfing Experience', 'Learning to surf at the Gold Coast! Although I fell many times, I finally managed to stand on the surfboard. The sound of waves, the taste of sea breeze - this is the Australian beach life!', 'Gold Coast, Queensland, Australia', 19, 4, DATE_SUB(NOW(), INTERVAL 4 DAY)),
     (7, 1002, 'Perth Swan River Cruise', 'Taking a boat tour on the Swan River in Perth, enjoying the beautiful scenery on both banks. Modern city architecture perfectly blends with natural landscapes. The capital of Western Australia is truly beautiful!', 'Perth, Western Australia', 31, 6, DATE_SUB(NOW(), INTERVAL 5 DAY)),
     (8, 1003, 'Adelaide Wine Region Tour', 'Wine tasting at vineyards in the Adelaide Hills, learning about the wine-making process. The wine quality here is world-renowned, every sip is a pleasure!', 'Adelaide Hills, South Australia', 26, 9, DATE_SUB(NOW(), INTERVAL 6 DAY)),
     (9, 1004, 'Canberra Parliament House Visit', 'Visited the Parliament House in Canberra, learned about Australia\'s political history. The building itself is magnificent, and the interior decorations and artworks are impressive.', 'Canberra, ACT, Australia', 14, 3, DATE_SUB(NOW(), INTERVAL 7 DAY)),
     (10, 1005, 'Darwin Sunset Market', 'Tasting various delicacies at Darwin\'s sunset market, experiencing the multicultural diversity of the Northern Territory. The seafood here is particularly fresh, and there are various tropical fruits!', 'Darwin, Northern Territory, Australia', 22, 5, DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Insert moment image data with reliable placeholder images
INSERT INTO devine_moment_images (momentId, imageUrl, isPrimary, createTime) VALUES
(1, 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Sunset+at+Sydney', TRUE, NOW()),
(1, 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Harbour+Bridge', FALSE, NOW()),
(2, 'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Great+Barrier+Reef', TRUE, NOW()),
(2, 'https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Coral+Reef', FALSE, NOW()),
(2, 'https://via.placeholder.com/400x300/FFEAA7/FFFFFF?text=Tropical+Fish', FALSE, NOW()),
(3, 'https://via.placeholder.com/400x300/2C3E50/FFFFFF?text=Starry+Night', TRUE, NOW()),
(3, 'https://via.placeholder.com/400x300/34495E/FFFFFF?text=Milky+Way', FALSE, NOW()),
(4, 'https://via.placeholder.com/400x300/D35400/FFFFFF?text=Coffee+Culture', TRUE, NOW()),
(5, 'https://via.placeholder.com/400x300/27AE60/FFFFFF?text=Wilderness+Hiking', TRUE, NOW()),
(5, 'https://via.placeholder.com/400x300/2ECC71/FFFFFF?text=Ancient+Forest', FALSE, NOW()),
(6, 'https://via.placeholder.com/400x300/3498DB/FFFFFF?text=Surfing+Experience', TRUE, NOW()),
(7, 'https://via.placeholder.com/400x300/9B59B6/FFFFFF?text=Swan+River+Cruise', TRUE, NOW()),
(8, 'https://via.placeholder.com/400x300/E74C3C/FFFFFF?text=Wine+Region+Tour', TRUE, NOW()),
(9, 'https://via.placeholder.com/400x300/F39C12/FFFFFF?text=Parliament+House', TRUE, NOW()),
(10, 'https://via.placeholder.com/400x300/1ABC9C/FFFFFF?text=Sunset+Market', TRUE, NOW());

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
(3, 1005, NOW()),
(4, 1001, NOW()),
(4, 1003, NOW()),
(5, 1001, NOW()),
(5, 1002, NOW()),
(5, 1004, NOW()),
(6, 1002, NOW()),
(6, 1003, NOW()),
(6, 1005, NOW()),
(7, 1001, NOW()),
(7, 1002, NOW()),
(7, 1004, NOW()),
(8, 1001, NOW()),
(8, 1003, NOW()),
(8, 1005, NOW()),
(9, 1002, NOW()),
(9, 1004, NOW()),
(10, 1001, NOW()),
(10, 1003, NOW()),
(10, 1005, NOW());

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
(3, 1004, 'I want to go camping to see the stars too', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(4, 1001, 'Melbourne\'s coffee culture is indeed great', DATE_SUB(NOW(), INTERVAL 47 HOUR)),
(4, 1003, 'Recommend some good cafes!', DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(5, 1001, 'Tasmania\'s natural scenery is truly beautiful', DATE_SUB(NOW(), INTERVAL 71 HOUR)),
(5, 1002, 'How difficult is the hiking trail?', DATE_SUB(NOW(), INTERVAL 70 HOUR)),
(5, 1004, 'Are there many wild animals?', DATE_SUB(NOW(), INTERVAL 69 HOUR)),
(6, 1002, 'Surfing looks so fun!', DATE_SUB(NOW(), INTERVAL 95 HOUR)),
(6, 1003, 'Is it easy for beginners to get started?', DATE_SUB(NOW(), INTERVAL 94 HOUR)),
(6, 1005, 'The Gold Coast beaches are really beautiful', DATE_SUB(NOW(), INTERVAL 93 HOUR)),
(7, 1001, 'Perth\'s Swan River is indeed beautiful', DATE_SUB(NOW(), INTERVAL 119 HOUR)),
(7, 1002, 'How much does the boat tour cost?', DATE_SUB(NOW(), INTERVAL 118 HOUR)),
(7, 1004, 'Western Australia\'s natural scenery is great', DATE_SUB(NOW(), INTERVAL 117 HOUR)),
(8, 1001, 'The wine region tour sounds great', DATE_SUB(NOW(), INTERVAL 143 HOUR)),
(8, 1003, 'Recommend some good wineries!', DATE_SUB(NOW(), INTERVAL 142 HOUR)),
(8, 1005, 'Australian wines are indeed good', DATE_SUB(NOW(), INTERVAL 141 HOUR)),
(9, 1002, 'The Parliament House architecture is magnificent', DATE_SUB(NOW(), INTERVAL 167 HOUR)),
(9, 1004, 'Canberra has a strong political atmosphere', DATE_SUB(NOW(), INTERVAL 166 HOUR)),
(10, 1001, 'Darwin\'s market is very unique', DATE_SUB(NOW(), INTERVAL 191 HOUR)),
(10, 1003, 'The tropical fruits look delicious!', DATE_SUB(NOW(), INTERVAL 190 HOUR)),
(10, 1005, 'The Northern Territory culture is very unique', DATE_SUB(NOW(), INTERVAL 189 HOUR));

-- Update moment like and comment counts
UPDATE devine_moments SET 
    likeCount = (SELECT COUNT(*) FROM devine_moment_likes WHERE momentId = devine_moments.momentId),
    commentCount = (SELECT COUNT(*) FROM devine_moment_comments WHERE momentId = devine_moments.momentId); 