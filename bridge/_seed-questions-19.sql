INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-351d-7bfa-bdd5-0ac062b11d83'::uuid, '019f9df7-a2a2-77cc-bb88-40ce254805a8'::uuid, 'A scale model of a water reservoir dam is constructed such that an actual length of 1800 m is represented by 45 cm on the model.
(a) Express the scale of the model in the form 1 : n.
(b) The surface area of the reservoir on the scale model is 0.24 m^2. Calculate the actual surface area of the reservoir in square kilometres.', '(a) 1 : 4000
(b) 3.84 km^2', '(a) 45 cm : 1800 m = 45 cm : 180,000 cm = 1 : 4000.
(b) 1 m on model represents 4000 m = 4 km in actual distance.
Area ratio: 1 m^2 : (4 km)^2 = 1 m^2 : 16 km^2.
Actual surface area = 0.24 × 16 = 3.84 km^2.', 'Medium', '{"tags":"scale,ratio,area","subtopic":"scale","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.445Z'::timestamptz, '2026-07-27T15:23:08.445Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-352e-7aab-a740-ebe0b122792f'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, '(a) Solve the linear equation 5(2x - 3) - 4(x + 2) = 3(4x + 1) - 10.
(b) Solve the inequality \frac{3 - 2x}{4} \ge 2 - \frac{x + 1}{3}.', '(a) x = -8/3 (or -2 2/3)
(b) x <= -5.5', '(a) Expand: 10x - 15 - 4x - 8 = 12x + 3 - 10
6x - 23 = 12x - 7
-6x = 16 => x = -16/6 = -8/3.
(b) Multiply by 12: 3(3 - 2x) ≥ 24 - 4(x + 1)
9 - 6x ≥ 24 - 4x - 4
9 - 6x ≥ 20 - 4x
-2x ≥ 11 => x ≤ -5.5.', 'Medium', '{"tags":"equations,inequalities","subtopic":"inequalities","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.462Z'::timestamptz, '2026-07-27T15:23:08.462Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('019fa42c-3539-72ee-bb1a-0117f6884016'::uuid, '019f9df7-a2a2-7877-afdf-c436930f3059'::uuid, 'Solve the simultaneous equations:
3x - 2y = -12
4x + 5y = 7', 'x = -2, y = 3', 'Multiply 3x - 2y = -12 by 5: 15x - 10y = -60.
Multiply 4x + 5y = 7 by 2: 8x + 10y = 14.
Add the two equations: 23x = -46 => x = -2.
Substitute x = -2 into 3x - 2y = -12:
3(-2) - 2y = -12 => -6 - 2y = -12 => 2y = 6 => y = 3.', 'Medium', '{"tags":"simultaneous equations","subtopic":"simultaneous equations","question_type":"open-ended","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-27T15:23:08.473Z'::timestamptz, '2026-07-27T15:23:08.473Z'::timestamptz) ON CONFLICT (id) DO NOTHING;