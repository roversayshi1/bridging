import fs from 'node:fs';

const markCode = fs.readFileSync(new URL('./weweb-mark-action.js', import.meta.url), 'utf8');

const workflow = {
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  type: 'api',
  name: 'Mark Practice Answer',
  description:
    'Deterministic binary math marker for Practice. Loads the question by id, reads metadata.marking rules, and returns only { isCorrect, verdict, questionId }.',
  folder: 'Practice/',
  meta: {
    path: '/api/practice/mark',
    method: 'POST',
    security: { accessRule: 'public' },
  },
  parameters: [
    { name: 'studentAnswer', type: 'string' },
    { name: 'questionId', type: 'string' },
  ],
  firstAction: 'FETCH_Q',
  actions: {
    FETCH_Q: {
      id: 'FETCH_Q',
      type: 'table-select',
      name: 'Load question row',
      __wwdescription: 'Fetch model answer and marking metadata for the submitted question.',
      next: 'MARK_ANSWER',
      tableName: 'questions',
      columns: {
        id: true,
        model_answer: true,
        metadata: true,
      },
      filters: {
        link: '$and',
        conditions: [
          {
            field: 'id',
            operator: '$eq',
            value: {
              __wwtype: 'js',
              code: "return context.parameters['questionId']",
            },
          },
        ],
      },
      sort: [],
      limit: 1,
      offset: 0,
      count: false,
    },
    MARK_ANSWER: {
      id: 'MARK_ANSWER',
      type: 'custom-js',
      name: 'Run deterministic marker',
      __wwdescription: 'Compare student answer to model answer using emath-marker compact engine.',
      next: 'RETURN_MARK',
      code: markCode,
    },
    RETURN_MARK: {
      id: 'RETURN_MARK',
      type: 'return-response',
      name: 'Return mark verdict',
      __wwdescription: 'Return binary Correct/Wrong verdict to the frontend.',
      next: null,
      args: {
        status: 200,
        contentType: 'application/json',
        body: {
          __wwtype: 'js',
          code: "return JSON.stringify(context.workflow['MARK_ANSWER'].result)",
        },
      },
    },
  },
};

fs.writeFileSync(new URL('./mark-practice-workflow.json', import.meta.url), JSON.stringify(workflow));
