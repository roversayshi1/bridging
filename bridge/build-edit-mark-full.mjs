import fs from 'fs';

const code = fs.readFileSync(new URL('./weweb-mark-action.js', import.meta.url), 'utf8');

const payload = {
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  id: 'baabb281-d2bf-4c1b-875d-6d7194cbd506',
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
        question_type: true,
        answer_tolerance: true,
        accepted_answers: true,
        case_sensitive: true,
        require_simplified_form: true,
        require_units: true,
        required_unit: true,
        accepted_units: true,
        marking_notes: true,
      },
      formulaColumns: {},
      filters: {
        link: '$and',
        conditions: [
          {
            field: 'id',
            operator: '$eq',
            value: { __wwtype: 'js', code: "return context.parameters['questionId']" },
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
      code,
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
          code: "return context.workflow['MARK_ANSWER'].result",
        },
      },
    },
  },
};

fs.writeFileSync(new URL('./_edit-mark-full.json', import.meta.url), JSON.stringify(payload));
console.log('wrote', JSON.stringify(payload).length, 'bytes');
