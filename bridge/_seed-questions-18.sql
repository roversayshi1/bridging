INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-350a-7fe3-ba72-d7e208575c05'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'It is given that y = \sqrt{\frac{5x}{3x + 4z}}.
(a) Calculate the value of y when x = 4 and z = 3.5.
(b) Express x in terms of y and z.', '(a) 0.877
(b) x = (4z y^2) / (5 - 3y^2)', '(a) y = sqrt(20 / (12 + 14)) = sqrt(20/26) ≈ 0.877 (3 s.f.).
(b) Square both sides: y^2 = 5x / (3x + 4z).
3x y^2 + 4z y^2 = 5x.
4z y^2 = 5x - 3x y^2 = x(5 - 3y^2).
x = (4z y^2) / (5 - 3y^2).', 'Medium', '{"tags":"formulae,rearranging","subtopic":"changing subject","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.426Z'::timestamptz, '2026-07-27T15:23:08.426Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-3514-7687-939c-e809ec8ecb21'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'Solve the equation \frac{x + 2}{x - 1} - \frac{x - 3}{x + 3} = 3, giving your answers correct to 2 decimal places.', 'x = 2.56 or x = -1.56', '[(x+2)(x+3) - (x-3)(x-1)] / [(x-1)(x+3)] = 3
(x^2 + 5x + 6 - (x^2 - 4x + 3)) / (x^2 + 2x - 3) = 3
(9x + 3) = 3(x^2 + 2x - 3)
9x + 3 = 3x^2 + 6x - 9
3x^2 - 3x - 12 = 0
x^2 - x - 4 = 0
Using quadratic formula: x = [1 ± sqrt(1 - 4(1)(-4))] / 2 = [1 ± sqrt(17)] / 2
x ≈ 2.56 or x ≈ -1.56.', 'Hard', '{"tags":"algebraic fractions,equations","subtopic":"algebraic fractions","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.436Z'::timestamptz, '2026-07-27T15:23:08.436Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-3519-7299-b589-8853125f9320'::uuid, '019f9df7-a2a2-7839-8287-1e75e9dd37f8'::uuid, 'In 2023, a motor company produced 4 620 000 hybrid vehicles.
(a) Express 4 620 000 in standard form.
(b) In 2018, the company produced 3.25 million hybrid vehicles. Calculate the percentage increase in hybrid vehicle production from 2018 to 2023.
(c) In 2023, 78.5% of all motor vehicles produced by the company were non-hybrid vehicles. Calculate the total number of motor vehicles produced by the company in 2023, giving your answer to the nearest million.
(d) Given that there were 350 vehicles produced per 1000 people in the region in 2023, estimate the total population of the region in standard form correct to 3 significant figures.', '(a) 4.62 × 10^6
(b) 42.2%
(c) 21 million
(d) 6.14 × 10^7', '(a) 4 620 000 = 4.62 × 10^6.
(b) Percentage increase = [(4.62 - 3.25) / 3.25] × 100% = 42.15% ≈ 42.2%.
(c) Hybrid percentage = 100% - 78.5% = 21.5%.
Total vehicles = 4,620,000 / 0.215 = 21,488,372 ≈ 21 million.
(d) Population = (21,488,372 / 350) × 1000 = 61,395,348 ≈ 6.14 × 10^7.', 'Hard', '{"tags":"percentages,standard form","subtopic":"percentages","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.441Z'::timestamptz, '2026-07-27T15:23:08.441Z'::timestamptz) ON CONFLICT (id) DO NOTHING;