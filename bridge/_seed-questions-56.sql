INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c581-7d5e-926a-a04c1c4b3639'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'S = RV / (3V - 1)

Calculate the value of S when R = 100 and V = -13.', '32.5', 'S = 100(-13) / [3(-13) - 1]
= -1300 / (-40)
= 32.5.', 'Easy', '{"tags":"sass-2022-p2,q1ai","subtopic":"Substitution into formulae","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.729Z'::timestamptz, '2026-09-03T15:48:09.729Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c595-7b20-98d0-f619d46d57d3'::uuid, '019f9df7-a2a2-7853-96ff-2c02dc5e1f10'::uuid, 'S = RV / (3V - 1)

Rearrange the formula to make V the subject.', 'V = S / (3S - R)', 'S(3V - 1) = RV
3SV - S = RV
3SV - RV = S
V(3S - R) = S
V = S / (3S - R).', 'Hard', '{"tags":"sass-2022-p2,q1aii","subtopic":"Changing the subject","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.749Z'::timestamptz, '2026-09-03T15:48:09.749Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c5a6-7895-bcbb-6d23b21386a6'::uuid, '019f9df7-a2a0-71cf-9863-4d6d67e42e6d'::uuid, 'Given that n is an integer and n > 1, decide whether each statement is true or false. If false, give a counter-example.

(i) n^3 > 1
(ii) 1/n > 1/n^2
(iii) (n - 1)(n + 3) is always odd', '(i) True (ii) True (iii) False; e.g. n = 3 gives (2)(6) = 12 which is even', '(i) For n > 1, n^3 > 1.
(ii) For n > 1, 1/n > 1/n^2 since n > 1.
(iii) When n = 3, (n - 1)(n + 3) = 2 x 6 = 12, which is even, so the statement is false.', 'Medium', '{"tags":"sass-2022-p2,q1b","subtopic":"Number properties","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.766Z'::timestamptz, '2026-09-03T15:48:09.766Z'::timestamptz) ON CONFLICT (id) DO NOTHING;