INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c51a-7e36-94fc-85b4652e57d2'::uuid, '019f9df7-a2a2-7941-9e48-3d4dda1f252c'::uuid, 'E = {x : x is a positive integer, x <= 12}
X = {x : x is a prime number}
Y = {x : x <= 6}

A number k is chosen at random from E. Find the probability that k is not in (X ∪ Y). Give your answer as a fraction in lowest terms.', '1/3', 'X ∪ Y = {1, 2, 3, 4, 5, 6, 7, 11}.
Elements not in X ∪ Y: {8, 9, 10, 12} — 4 outcomes out of 12.
P = 4/12 = 1/3.', 'Easy', '{"tags":"sass-2022-p1,q18aii","subtopic":"Set probability","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.626Z'::timestamptz, '2026-09-03T15:48:09.626Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c52f-7039-9483-4a2097734f5e'::uuid, '019f9df7-a2a2-7839-8287-1e75e9dd37f8'::uuid, 'Khalid has savings of $15 000 which he would like to deposit in a bank for 5 years. He is deciding between the schemes offered by two banks.

Bank A: Simple interest of 1.2% per annum.
Bank B: Compound interest compounded monthly at 0.85% per annum.

Which bank should he leave his money with? Explain briefly.', 'Bank A (interest about $900 vs about $651 from Bank B)', 'Bank A interest = 15000 x 1.2 x 5 / 100 = $900.
Bank B amount = 15000(1 + 0.85/1200)^60 ≈ $15 651.
Bank B interest ≈ $651.
Bank A gives more interest, so choose Bank A.', 'Hard', '{"tags":"sass-2022-p1,q21","subtopic":"Simple and compound interest","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.646Z'::timestamptz, '2026-09-03T15:48:09.646Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c542-7e85-b45e-49aa8ecc47b4'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'The expression x^2 - 10x + 17 can be written in the form (x - 5)^2 + n.

Find the value of n.', '-8', '(x - 5)^2 + n = x^2 - 10x + 25 + n.
Compare constant terms: 25 + n = 17, so n = -8.', 'Medium', '{"tags":"sass-2022-p1,q22ai","subtopic":"Completing the square","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.666Z'::timestamptz, '2026-09-03T15:48:09.666Z'::timestamptz) ON CONFLICT (id) DO NOTHING;