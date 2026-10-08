INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c5ac-76fe-b1d2-e52f68221658'::uuid, '019f9df7-a2a2-7877-afdf-c436930f3059'::uuid, 'Solve these simultaneous equations. You must show your working.

(1/4)x + (3/5)y = -6
3y = -4x + 3', 'x = 12, y = -15', 'From (1): 5x + 12y = -120 ... (3)
From (2): 4x + 3y = 3, so 12y = 12 - 16x ... (4)
Substitute (4) into (3):
5x + 12 - 16x = -120
-11x = -132
x = 12.
3y = 3 - 48 = -45, so y = -15.', 'Medium', '{"tags":"sass-2022-p2,q1c","subtopic":"Simultaneous equations","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.772Z'::timestamptz, '2026-09-03T15:48:09.772Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c5bb-79f8-9ece-28d63cb2fe1a'::uuid, '019f9df7-a2a2-7899-9f80-1aed5da88c11'::uuid, 'A gift shop sells two types of fruit hampers, A and B.

Hamper A: 3 apples, 4 oranges, 2 pears, 0 pineapples
Hamper B: 4 apples, 6 oranges, 5 pears, 1 pineapple

This is represented by P = [[3, 4, 2, 0], [4, 6, 5, 1]].

The cost price of an apple, orange, pear and pineapple are $0.50, $0.45, $0.60 and $1.80 respectively.

Write down a 4 x 1 matrix Q to represent the cost price of the fruits.', 'Q = [[0.50], [0.45], [0.60], [1.80]]', 'Order the prices to match columns of P: apple, orange, pear, pineapple.', 'Easy', '{"tags":"sass-2022-p2,q2a","subtopic":"Matrix representation","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.787Z'::timestamptz, '2026-09-03T15:48:09.787Z'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES ('01a067f4-c5d2-7002-91fe-b8c637c82dfa'::uuid, '019f9df7-a2a2-7899-9f80-1aed5da88c11'::uuid, 'Using P = [[3, 4, 2, 0], [4, 6, 5, 1]] and Q = [[0.50], [0.45], [0.60], [1.80]], calculate PQ.', 'PQ = [[4.50], [9.50]]', 'Row 1: 3(0.50) + 4(0.45) + 2(0.60) + 0 = 4.50.
Row 2: 4(0.50) + 6(0.45) + 5(0.60) + 1(1.80) = 9.50.', 'Medium', '{"tags":"sass-2022-p2,q2b","subtopic":"Matrix multiplication","question_type":"open","diagram_required":false}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-03T15:48:09.809Z'::timestamptz, '2026-09-03T15:48:09.809Z'::timestamptz) ON CONFLICT (id) DO NOTHING;