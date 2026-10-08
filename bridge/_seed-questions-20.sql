INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-353f-74c4-9c9f-db38c7a48ecf'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'The first four terms of a sequence T_1, T_2, T_3, T_4, ... are given by:
T_1 = 3(1) - 2 = 1
T_2 = 3(2) + 1 = 7
T_3 = 3(3) + 4 = 13
T_4 = 3(4) + 7 = 19

(a) Write down an expression for T_5.
(b) Find an expression, in terms of n, for the n-th term T_n.
(c) Evaluate T_{25}.
(d) Explain why 304 cannot be a term in this sequence.', '(a) T_5 = 3(5) + 10 = 25
(b) T_n = 6n - 5
(c) 145
(d) Setting 6n - 5 = 304 gives n = 51.5, which is not an integer.', '(a) T_5 = 3(5) + 10 = 25.
(b) Terms are 1, 7, 13, 19, ... with common difference 6. T_n = 6n - 5.
(c) T_25 = 6(25) - 5 = 145.
(d) 6n - 5 = 304 => 6n = 309 => n = 51.5. Since n must be a positive integer, 304 is not a term in the sequence (also, all terms in T_n are odd, whereas 304 is even).', 'Hard', '{"tags":"sequences,nth term","subtopic":"sequences","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.479Z'::timestamptz, '2026-07-27T15:23:08.479Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a00459-8a73-7aba-b797-a6522fae2515'::uuid, '019f9df7-a2a0-71cf-9863-4d6d67e42e6d'::uuid, 'Write x^2 - 10x + 7 in the form (x - a)^2 + b.', '(x - 5)^2 - 18', 'Complete the square: x^2 - 10x + 7 = (x^2 - 10x + 25) - 25 + 7 = (x - 5)^2 - 18.', 'Easy', '{"diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15T07:36:12.144Z'::timestamptz, '2026-08-15T07:36:12.144Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a00459-8a87-7d4f-9e67-1a70093813e2'::uuid, '019f9df7-a2a2-7839-8287-1e75e9dd37f8'::uuid, 'A shirt costs £14.75 in one country. In another country, the same shirt costs $21.99. If the exchange rate is $1 = £0.73, calculate how much more the second price is than the first, in pounds.', '£1.30', 'Convert $21.99 to pounds: 21.99 × 0.73 = 16.0527. Subtract 14.75: 16.0527 - 14.75 = 1.3027. To the nearest penny, the difference is £1.30.', 'Easy', '{"diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-15T07:36:12.167Z'::timestamptz, '2026-08-15T07:36:12.167Z'::timestamptz) ON CONFLICT (id) DO NOTHING;