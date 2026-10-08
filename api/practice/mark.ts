import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { markMathAnswer } from '../../src/markMathAnswer.js';
import { FALLBACK_DAILY } from './dailyBank.js';

type MarkBody = {
  studentAnswer?: string;
  questionId?: string;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as MarkBody;
  const studentAnswer = String(body.studentAnswer ?? '');
  const questionId = String(body.questionId ?? '');

  if (!studentAnswer || !questionId) {
    sendJson(res, 400, { error: 'studentAnswer and questionId are required' });
    return;
  }

  const fallback = FALLBACK_DAILY.find((item) => item.id === questionId);
  if (fallback) {
    const mark = markMathAnswer({
      studentAnswer,
      expectedAnswer: fallback.model_answer,
      questionType: fallback.question_type,
      options: { requireSimplifiedForm: true },
    });
    sendJson(res, 200, {
      isCorrect: mark.isCorrect,
      verdict: mark.status,
      questionId,
      feedback: mark.feedback,
      method: mark.method,
      normalizedStudentAnswer: mark.normalizedStudentAnswer,
      attemptId: null,
    });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    sendJson(res, 500, { error: 'Supabase env not configured on API' });
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    db: { schema: 'bridging' },
    auth: { persistSession: false },
  });

  const { data: question, error } = await supabase
    .from('questions')
    .select(
      'id, model_answer, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, metadata'
    )
    .eq('id', questionId)
    .maybeSingle();

  if (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  if (!question) {
    sendJson(res, 404, { error: 'Question not found' });
    return;
  }

  const meta = (question.metadata as Record<string, unknown>) || {};
  const questionType =
    question.question_type ||
    (meta.question_type as string) ||
    (meta.marking as Record<string, string> | undefined)?.questionType;

  const mark = markMathAnswer({
    studentAnswer,
    expectedAnswer: question.model_answer,
    questionType: questionType as string | undefined,
    tolerance: question.answer_tolerance ?? undefined,
    acceptedAnswers: question.accepted_answers ?? undefined,
    options: {
      caseSensitive: question.case_sensitive ?? undefined,
      requireSimplifiedForm: question.require_simplified_form ?? undefined,
      requireUnits: question.require_units ?? undefined,
      requiredUnit: question.required_unit ?? undefined,
      acceptedUnits: question.accepted_units ?? undefined,
      markingNotes: question.marking_notes ?? undefined,
    },
  });

  const authHeader = req.headers.authorization;
  let attemptId: string | null = null;

  if (authHeader?.startsWith('Bearer ') && anonKey) {
    const userClient = createClient(supabaseUrl, anonKey!, {
      global: { headers: { Authorization: authHeader } },
      db: { schema: 'bridging' },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (user) {
      const { data: inserted } = await userClient.from('attempts').insert({
        user_id: user.id,
        question_id: questionId,
        student_answer: studentAnswer,
        normalized_submitted_answer: mark.normalizedStudentAnswer,
        is_correct: mark.isCorrect,
        status: mark.status,
        marking_method: mark.method,
      }).select('id').maybeSingle();
      attemptId = inserted?.id ?? null;
    }
  }

  sendJson(res, 200, {
    isCorrect: mark.isCorrect,
    verdict: mark.status,
    questionId,
    feedback: mark.feedback,
    method: mark.method,
    normalizedStudentAnswer: mark.normalizedStudentAnswer,
    attemptId,
  });
}
