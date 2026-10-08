INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c634-72fc-a258-3b0597eb45b3'::uuid, '019f9df7-a2a0-71cf-9863-4d6d67e42e6d'::uuid, 'Your class will sell 480 packets of sugar cookies. Each packet contains 6 cookies. One batch of the recipe makes 48 cookies and uses 350 g of flour.

How much flour does your class need? Give your answer in kilograms.', '21 kg', 'Total cookies = 480 x 6 = 2880.
Batches needed = 2880 / 48 = 60.
Flour = 60 x 350 g = 21 000 g = 21 kg.', 'Medium', '{"tags":"sass-2022-p2,q11a","subtopic":"Ratio and unit conversion","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.908Z'::timestamptz, '2026-09-03T15:48:09.908Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c649-7eff-9925-e4f6c4085aea'::uuid, '019f9df7-a2a2-7839-8287-1e75e9dd37f8'::uuid, 'Your class needs 21 kg of flour. Prices (excluding 7% GST):

Supermarket A: 454 g for $0.95; 1 kg for $1.85; 2 x 1 kg for $3.50.
Supermarket B: 454 g for $0.90; 1 kg for $1.90; no multi-pack offer.

Which supermarket should your class buy the flour from? Show your calculations and reason clearly.', 'Supermarket A (cheapest unit price $1.75/kg with the 2-for-$3.50 offer)', 'A: 454 g pack ≈ $2.09/kg; 1 kg = $1.85/kg; 2-for-$3.50 = $1.75/kg (best).
B: 454 g ≈ $1.98/kg; 1 kg = $1.90/kg.
Lowest unit price is A''s 2-for-$3.50 offer, so buy flour from Supermarket A.', 'Medium', '{"tags":"sass-2022-p2,q11b","subtopic":"Best buy","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.929Z'::timestamptz, '2026-09-03T15:48:09.929Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c66e-7aff-881b-931aa62132b0'::uuid, '019f9df7-a2a2-7839-8287-1e75e9dd37f8'::uuid, 'Your class will make 60 batches of sugar cookies (48 cookies per batch) and sell 480 packets (6 cookies per packet). They must cover all ingredient and packaging costs (prices excluding 7% GST below) and donate at least $1000 to charity.

Supermarket A: flour 454g $0.95, 1kg $1.85, 2x1kg $3.50; baking soda 150g $0.80; butter 250g $4.80 (2 for $7.00); caster sugar 500g $1.65; eggs 10-pack $1.65; bags 100-pack $8.43.

Supermarket B: flour 454g $0.90, 1kg $1.90; baking soda 150g $1.15; butter 250g $4.80 (buy 2 get $2.65 off, i.e. 2 for $6.95); caster sugar 500g $1.65; eggs 30-pack $3.85; bags 100-pack $7.15.

Per batch: 350g flour, 7g baking soda, 130g butter, 300g caster sugar, 1 egg.

Suggest a sensible selling price for one packet. Show working to justify your decision.', '$3 per packet (minimum about $2.65 per packet after GST to cover costs and $1000 donation)', 'Total ingredient masses for 60 batches: 21 kg flour, 420 g baking soda, 7800 g butter, 18 000 g sugar, 60 eggs, plus 480 bags.
Cheapest sourcing (from model answer): flour A, baking soda A, butter B, sugar either, eggs B, bags B.
Total cost after GST ≈ $271; with $1000 donation target, need about $1271 over 480 packets ≈ $2.65 each.
$3 per packet is a sensible rounded price.', 'Hard', '{"tags":"sass-2022-p2,q11c","subtopic":"Financial decision making","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.966Z'::timestamptz, '2026-09-03T15:48:09.966Z'::timestamptz) ON CONFLICT (id) DO NOTHING;