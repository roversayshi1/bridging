INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c4cb-7039-9ab9-f4e865c3d2d8'::uuid, '019f9df7-a2a2-7930-a717-cd252273c91f'::uuid, 'The stem-and-leaf diagram shows the distribution of the lengths of fish caught by a fisherman. The numbers x and y are non-negative digits. The mode and range of the data are 24 cm and 22 cm respectively.

Stem | Leaf
1 | x 4 5 7 8
2 | 0 1 2 y 4 4 5 8
3 | 0 0 3
Key: 2|0 means 20 cm.

Find the value of x and the value of y.', 'x = 1, y = 4', 'Maximum value = 33 cm.
Range = 22 cm, so minimum = 33 - 22 = 11 cm, hence x = 1.
Mode = 24 cm, so y = 4 (24 appears most often).', 'Medium', '{"tags":"sass-2022-p1,q17a","subtopic":"Stem-and-leaf diagrams","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.546Z'::timestamptz, '2026-09-03T15:48:09.546Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c4df-74a0-9f00-fae0a8bc1aec'::uuid, '019f9df7-a2a2-7941-9e48-3d4dda1f252c'::uuid, 'The stem-and-leaf data below has 16 fish lengths in total (with x = 1 and y = 4):

11, 14, 15, 17, 18, 20, 21, 22, 24, 24, 24, 25, 28, 30, 30, 33 (all in cm).

If two of the fishes caught are selected at random, find the probability that at least one of them is longer than or equal to 25 cm.', '13/24', 'Fish shorter than 25 cm: 11 values.
P(both < 25) = (11/16) x (10/15) = 11/24.
P(at least one >= 25) = 1 - 11/24 = 13/24.', 'Medium', '{"tags":"sass-2022-p1,q17b","subtopic":"Probability without replacement","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.567Z'::timestamptz, '2026-09-03T15:48:09.567Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c4f3-7379-9dc7-91ee5eff2730'::uuid, '019f9df7-a2a2-7888-aef2-fd58477eb864'::uuid, 'E = {x : x is a positive integer, x <= 12}
X = {x : x is a prime number}
Y = {x : x <= 6}

Find X ∩ Y.', '{2, 3, 5}', 'Primes in E: {2, 3, 5, 7, 11}.
Y = {1, 2, 3, 4, 5, 6}.
X ∩ Y = {2, 3, 5}.', 'Easy', '{"tags":"sass-2022-p1,q18ai","subtopic":"Set intersection","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.587Z'::timestamptz, '2026-09-03T15:48:09.587Z'::timestamptz) ON CONFLICT (id) DO NOTHING;