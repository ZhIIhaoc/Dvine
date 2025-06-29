/* ------------------------------------------------------------------
   Seed data for table `users`
   – one record for every permission level 0 … 4
   – password left as plain text “1234” for quick testing
   ------------------------------------------------------------------ */

INSERT INTO users
(password,
 email,
 phone,
 postcode,
 nickName,
 firstName,
 lastName,
 avatar,
 permission)
VALUES
/* 0 – regular member */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_regular@example.com',
     '0400000000',
     '2000',
     'regularGuy',
     'Reg',
     'User',
     'https://your-cdn.com/avatar0.jpg',
     0),

/* 1 – premium member */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_premium@example.com',
     '0400000001',
     '2001',
     'premiumGal',
     'Pre',
     'Mium',
     'https://your-cdn.com/avatar1.jpg',
     1),

/* 2 – partner (lowest admin) */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_partner@example.com',
     '0400000002',
     '2002',
     'partnerPro',
     'Par',
     'Tner',
     'https://your-cdn.com/avatar2.jpg',
     2),

/* 3 – manager */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_manager@example.com',
     '0400000003',
     '2003',
     'managerMan',
     'Man',
     'Ager',
     'https://your-cdn.com/avatar3.jpg',
     3),

/* 4 – owner */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_owner@example.com',
     '0400000004',
     '2004',
     'bigOwner',
     'Own',
     'Er',
     'https://your-cdn.com/avatar4.jpg',
     4);
