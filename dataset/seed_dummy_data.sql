-- ============================================================
-- Seed Data: Update dummy analyses with generated image URLs
-- ============================================================

UPDATE analyses
SET image_url = 'https://adfhubqrgunuuwcqssro.supabase.co/storage/v1/object/public/beach-waste-images/1784957818545-beach_waste_high.jpg'
WHERE id = 'a1b2c3d4-0001-0000-0000-000000000001';

UPDATE analyses
SET image_url = 'https://adfhubqrgunuuwcqssro.supabase.co/storage/v1/object/public/beach-waste-images/1784957819201-beach_waste_moderate.jpg'
WHERE id = 'a1b2c3d4-0002-0000-0000-000000000002';

UPDATE analyses
SET image_url = 'https://adfhubqrgunuuwcqssro.supabase.co/storage/v1/object/public/beach-waste-images/1784957819713-beach_waste_low.jpg'
WHERE id = 'a1b2c3d4-0003-0000-0000-000000000003';
