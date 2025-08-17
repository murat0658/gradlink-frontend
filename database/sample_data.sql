-- GradLink Sample Data
-- PostgreSQL DML for populating the database with sample data

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, phone_number, bio, location, university, graduation_year, major, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@harvard.edu', '$2a$10$example.hash.for.password', 'John Doe', '+15551234567', 'Software engineer passionate about AI and machine learning', 'Cambridge, MA', 'Harvard University', 2020, 'Computer Science', 'USER', true),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@stanford.edu', '$2a$10$example.hash.for.password', 'Jane Smith', '+15551234568', 'Product manager with expertise in fintech', 'San Francisco, CA', 'Stanford University', 2019, 'Business Administration', 'USER', true),
('550e8400-e29b-41d4-a716-446655440003', 'mike.johnson@mit.edu', '$2a$10$example.hash.for.password', 'Mike Johnson', '+15551234569', 'Research scientist in quantum computing', 'Cambridge, MA', 'MIT', 2021, 'Physics', 'USER', true),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.wilson@oxford.edu', '$2a$10$example.hash.for.password', 'Sarah Wilson', '+15551234570', 'Data scientist working on climate change models', 'London, UK', 'Oxford University', 2018, 'Mathematics', 'USER', true),
('550e8400-e29b-41d4-a716-446655440005', 'ahmet.yilmaz@metu.edu.tr', '$2a$10$example.hash.for.password', 'Ahmet Yılmaz', '+905551234567', 'Civil engineer specializing in sustainable infrastructure', 'Ankara, Turkey', 'Middle East Technical University', 2022, 'Civil Engineering', 'USER', true),
('550e8400-e29b-41d4-a716-446655440006', 'admin@gradlink.com', '$2a$10$example.hash.for.admin.password', 'System Admin', '+15551234571', 'System administrator for GradLink platform', 'Remote', 'GradLink', 2020, 'Information Technology', 'ADMIN', true);

-- Insert sample groups
INSERT INTO groups (id, code, university, description, location, founded, color, icon, member_count, created_by) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'harvard', 'Harvard University', 'A group for Harvard graduates to connect and network. Share opportunities, experiences, and build lasting professional relationships.', 'Cambridge, MA, USA', 1636, '#a51c30', 'university', 210, '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440002', 'stanford', 'Stanford University', 'Stanford alumni sharing opportunities and experiences. Connect with fellow graduates and explore new possibilities.', 'Stanford, CA, USA', 1885, '#8c1515', 'graduation-cap', 180, '550e8400-e29b-41d4-a716-446655440002'),
('650e8400-e29b-41d4-a716-446655440003', 'mit', 'MIT', 'MIT graduates collaborating on tech and research. Join discussions on cutting-edge technology and innovation.', 'Cambridge, MA, USA', 1861, '#a2a2a1', 'flask', 150, '550e8400-e29b-41d4-a716-446655440003'),
('650e8400-e29b-41d4-a716-446655440004', 'oxford', 'Oxford University', 'Oxford alumni group for global networking. Connect with graduates worldwide and explore international opportunities.', 'Oxford, England', 1096, '#002147', 'book', 120, '550e8400-e29b-41d4-a716-446655440004'),
('650e8400-e29b-41d4-a716-446655440005', 'metu', 'Middle East Technical University', 'A group for METU graduates to connect and network. Share experiences and opportunities in Turkey and beyond.', 'Ankara, Türkiye', 1952, '#a51c30', 'building', 210, '550e8400-e29b-41d4-a716-446655440005');

-- Insert group memberships
INSERT INTO group_memberships (user_id, group_id, role, status) VALUES
-- Harvard group members
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'USER', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'USER', 'ACTIVE'),

-- Stanford group members
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'ADMIN', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'USER', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'USER', 'ACTIVE'),

-- MIT group members
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'ADMIN', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'USER', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'USER', 'ACTIVE'),

-- Oxford group members
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'ADMIN', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'USER', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 'USER', 'ACTIVE'),

-- METU group members
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'ADMIN', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005', 'USER', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', 'USER', 'ACTIVE');

-- Insert sample events
INSERT INTO events (id, title, description, start_time, end_time, location, capacity, group_id, created_by, status) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Harvard Alumni Networking Mixer', 'Join fellow Harvard graduates for an evening of networking, drinks, and professional connections. Meet alumni from various industries and share experiences.', '2024-02-15 18:00:00+00', '2024-02-15 21:00:00+00', 'The Harvard Club of New York City', 50, '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'UPCOMING'),
('750e8400-e29b-41d4-a716-446655440002', 'Stanford Tech Innovation Summit', 'Annual summit bringing together Stanford alumni in technology to discuss the latest innovations, trends, and opportunities in the tech industry.', '2024-03-20 09:00:00+00', '2024-03-20 17:00:00+00', 'Stanford University Campus', 100, '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'UPCOMING'),
('750e8400-e29b-41d4-a716-446655440003', 'MIT Quantum Computing Workshop', 'Hands-on workshop on quantum computing fundamentals and applications. Led by MIT researchers and industry experts.', '2024-02-28 14:00:00+00', '2024-02-28 18:00:00+00', 'MIT Building 32', 30, '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'UPCOMING'),
('750e8400-e29b-41d4-a716-446655440004', 'Oxford Global Alumni Conference', 'International conference connecting Oxford alumni worldwide. Keynote speakers, panel discussions, and networking opportunities.', '2024-04-10 10:00:00+00', '2024-04-12 18:00:00+00', 'Oxford University', 200, '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'UPCOMING'),
('750e8400-e29b-41d4-a716-446655440005', 'METU Engineering Career Fair', 'Career fair specifically for METU engineering graduates. Meet with top companies and explore job opportunities in Turkey and abroad.', '2024-03-05 10:00:00+00', '2024-03-05 16:00:00+00', 'METU Campus, Ankara', 150, '650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'UPCOMING');

-- Insert event enrollments
INSERT INTO event_enrollments (event_id, user_id) VALUES
-- Harvard event enrollments
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),

-- Stanford event enrollments
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),

-- MIT event enrollments
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005');

-- Insert sample topics
INSERT INTO topics (id, group_id, title, content, author_id, view_count, reply_count) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Career Advice for Recent Graduates', 'Hello fellow Harvard alumni! I''m a recent graduate looking for advice on navigating the job market. What tips do you have for recent graduates entering the workforce? Any specific strategies that worked for you?', '550e8400-e29b-41d4-a716-446655440001', 45, 3),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Startup Funding Strategies', 'I''m working on a tech startup and would love to hear from Stanford alumni about funding strategies. What worked for you? Any advice on approaching VCs or angel investors?', '550e8400-e29b-41d4-a716-446655440002', 32, 2),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'AI Ethics in Research', 'As AI becomes more prevalent in research, what are your thoughts on ethical considerations? How do we balance innovation with responsibility?', '550e8400-e29b-41d4-a716-446655440003', 28, 1),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'International Job Opportunities', 'Oxford alumni working internationally - what advice do you have for finding opportunities abroad? Any specific countries or industries you''d recommend?', '550e8400-e29b-41d4-a716-446655440004', 38, 2),
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'Sustainable Engineering Projects', 'METU engineers working on sustainable projects - let''s share our experiences and discuss how we can contribute to a greener future.', '550e8400-e29b-41d4-a716-446655440005', 25, 1);

-- Insert sample topic replies
INSERT INTO topic_replies (id, topic_id, author_id, content, parent_id, upvotes) VALUES
-- Replies to Harvard topic
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Great question! I graduated 3 years ago and found that networking was key. Attend alumni events, reach out to people in your field, and don''t be afraid to ask for informational interviews.', NULL, 5),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'I agree with Jane. Also, focus on building a strong online presence - LinkedIn, GitHub if you''re in tech, and consider contributing to open source projects.', NULL, 3),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Don''t forget about internships and entry-level positions. Sometimes you need to start smaller to get your foot in the door.', '950e8400-e29b-41d4-a716-446655440001', 2),

-- Replies to Stanford topic
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'I''ve been through this! Start with your network - Stanford alumni are incredibly supportive. Also, perfect your pitch and have a solid business plan.', NULL, 4),
('950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Consider accelerators like Y Combinator or 500 Startups. They provide funding, mentorship, and valuable connections.', NULL, 6),

-- Reply to MIT topic
('950e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'This is a crucial discussion. We need to establish clear guidelines and ensure AI research benefits humanity while minimizing risks.', NULL, 7),

-- Replies to Oxford topic
('950e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'I''ve been working in Singapore for 5 years. The tech scene here is booming, and there are great opportunities for international professionals.', NULL, 3),
('950e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Germany has excellent opportunities in engineering and manufacturing. The work-life balance is great too!', NULL, 4),

-- Reply to METU topic
('950e8400-e29b-41d4-a716-446655440009', '850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'I''m working on renewable energy projects in Turkey. The government is investing heavily in sustainable infrastructure.', NULL, 5);

-- Insert topic upvotes
INSERT INTO topic_upvotes (reply_id, user_id) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004'),
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003'),
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003'),
('950e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, event_id, group_id, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'EVENT', 'Event Reminder: Harvard Alumni Networking Mixer', 'Your event "Harvard Alumni Networking Mixer" starts in 2 hours. Don''t forget to attend!', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', false),
('550e8400-e29b-41d4-a716-446655440002', 'EVENT', 'Event Reminder: Stanford Tech Innovation Summit', 'Your event "Stanford Tech Innovation Summit" starts in 1 day. Prepare for an exciting day of innovation!', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', false),
('550e8400-e29b-41d4-a716-446655440003', 'GENERAL', 'Welcome to MIT Alumni Group', 'Welcome to the MIT alumni group! Connect with fellow graduates and explore opportunities.', NULL, '650e8400-e29b-41d4-a716-446655440003', true),
('550e8400-e29b-41d4-a716-446655440004', 'SYSTEM', 'Account Verification Complete', 'Your account has been successfully verified. Welcome to GradLink!', NULL, NULL, true),
('550e8400-e29b-41d4-a716-446655440005', 'GENERAL', 'New Topic in METU Group', 'A new topic "Sustainable Engineering Projects" has been created in your METU group.', NULL, '650e8400-e29b-41d4-a716-446655440005', false);

-- Insert subscriptions
INSERT INTO subscriptions (user_id, group_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005');

-- Insert sample file uploads
INSERT INTO file_uploads (id, filename, original_name, file_path, file_size, mime_type, upload_type, uploaded_by, related_id) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'avatar_001.jpg', 'profile_photo.jpg', '/uploads/avatars/avatar_001.jpg', 102400, 'image/jpeg', 'avatar', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440002', 'event_001.jpg', 'networking_event.jpg', '/uploads/events/event_001.jpg', 204800, 'image/jpeg', 'event', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440003', 'avatar_002.jpg', 'jane_profile.jpg', '/uploads/avatars/avatar_002.jpg', 153600, 'image/jpeg', 'avatar', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample search history
INSERT INTO search_history (user_id, query, search_type, results_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'software engineer', 'users', 12),
('550e8400-e29b-41d4-a716-446655440001', 'networking events', 'events', 8),
('550e8400-e29b-41d4-a716-446655440002', 'startup funding', 'topics', 15),
('550e8400-e29b-41d4-a716-446655440003', 'quantum computing', 'topics', 6),
('550e8400-e29b-41d4-a716-446655440004', 'international opportunities', 'topics', 22);

-- Update member counts (triggers should handle this automatically, but adding for completeness)
UPDATE groups SET member_count = (
    SELECT COUNT(*) FROM group_memberships 
    WHERE group_id = groups.id AND status = 'ACTIVE'
);

-- Update enrollment counts (triggers should handle this automatically, but adding for completeness)
UPDATE events SET enrolled_count = (
    SELECT COUNT(*) FROM event_enrollments 
    WHERE event_id = events.id
);

-- Update reply counts (triggers should handle this automatically, but adding for completeness)
UPDATE topics SET reply_count = (
    SELECT COUNT(*) FROM topic_replies 
    WHERE topic_id = topics.id
);

-- Update upvote counts (triggers should handle this automatically, but adding for completeness)
UPDATE topic_replies SET upvotes = (
    SELECT COUNT(*) FROM topic_upvotes 
    WHERE reply_id = topic_replies.id
);
