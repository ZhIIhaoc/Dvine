/* ------------------------------------------------------------------
   Seed data for table `users`
   – one record for every permission level 0 … 5 (including PARTNER_UNPAID)
   – password left as plain text "1234" for quick testing
   – NEW HIERARCHY: 0=Regular, 1=Premium, 2=Partner(unpaid), 3=Partner(paid), 4=Manager, 5=Owner
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
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     0),

/* 1 – premium member */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_premium@example.com',
     '0400000001',
     '2001',
     'premiumGal',
     'Pre',
     'Mium',
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     1),

/* 2 – partner (unpaid) - lost subscription but keeps partner status */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_partner_unpaid@example.com',
     '0400000002',
     '2002',
     'unpaidPartner',
     'Unpaid',
     'Partner',
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     2),

/* 3 – partner (paid/admin) */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_partner@example.com',
     '0400000003',
     '2003',
     'partnerPro',
     'Active',
     'Partner',
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     3),

/* 4 – manager */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_manager@example.com',
     '0400000004',
     '2004',
     'managerMan',
     'Man',
     'Ager',
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     4),

/* 5 – owner */
    ('$2a$10$WraUHTgrwgHsjS6Oc01JbeyLjiTqS4egE5nOy4I0Q7IgJl9qHQw5.',
     'i_am_owner@example.com',
     '0400000005',
     '2005',
     'bigOwner',
     'Own',
     'Er',
     'https://dvine-media.s3.ap-southeast-2.amazonaws.com/avatars/0/default-user.jpg',
     5);
