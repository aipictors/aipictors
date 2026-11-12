-- プラン限定のアイコン枠（画像は public/avatar-frames/deco/plan-*.webp、作り方は scripts/avatar-frames）
-- core の D1（aipictors-core-staging = 本番）に入れる。required_pass_type 以上のプランの間だけ使える（price_coins は NULL）
-- sort は既存の枠（10〜480）より前。止めるときは is_active = 0（下の「止める」を参照）
-- 本番へは --command で入れる（--file は取り込みジョブになり、実行中にほかの問い合わせが失敗する）:
--   npx wrangler d1 execute aipictors-core-staging --remote --command "<下の INSERT>"
INSERT INTO user_avatar_frames (slug, name, description, required_pass_type, price_coins, frame_type, background_style, overlay_image_url, border_padding, sort, is_active) VALUES
('deco-plan-lite-silver', '銀細工の輪', '細い銀の輪に唐草とサファイアをひと粒', 'LITE', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-lite-silver.webp?v=1', 0, 1, 1),
('deco-plan-lite-rose', 'ローズゴールドの小枝', 'ローズゴールドの輪に小枝と真珠、ピンクの宝石', 'LITE', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-lite-rose.webp?v=1', 0, 2, 1),
('deco-plan-standard-laurel', '黄金の月桂冠', '彫金の厚い金の輪を月桂樹が囲み、ルビーが光る', 'STANDARD', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-standard-laurel.webp?v=1', 0, 3, 1),
('deco-plan-standard-sapphire', '蒼玉の金環', '縄目を刻んだ金の輪に四つのサファイアと百合の紋章', 'STANDARD', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-standard-sapphire.webp?v=1', 0, 4, 1),
('deco-plan-premium-crown', '白金とダイヤの王冠', 'ダイヤを敷き詰めた白金の輪と王冠、オーロラの光', 'PREMIUM', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-premium-crown.webp?v=1', 0, 5, 1),
('deco-plan-premium-aurora', '極光の星冠', 'オーロラ色に移ろう輪と、頂に輝く星のダイヤ', 'PREMIUM', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-premium-aurora.webp?v=1', 0, 6, 1),
('deco-plan-premium-noir', '漆黒と黄金の王冠', '漆黒の輪に金の月桂樹と王冠、深紅のルビー', 'PREMIUM', NULL, 'DECORATION', NULL, '/avatar-frames/deco/plan-premium-noir.webp?v=1', 0, 7, 1);

-- 止める（選んでいる人のアイコンからも消える。行は残す）:
-- UPDATE user_avatar_frames SET is_active = 0 WHERE slug LIKE 'deco-plan-%';
