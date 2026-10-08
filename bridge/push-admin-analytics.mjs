import { readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';

const wf = JSON.parse(readFileSync('bridge/_admin-analytics-wf.json', 'utf8'));

wf.description =
  'Read-only admin analytics aggregates from registered_users, attempts, questions, topics, user_settings, and tracked analytics events. Never writes or deletes data.';

wf.actions.FETCH_SETTINGS.next = 'FETCH_EVENTS';

wf.actions.FETCH_EVENTS = {
  id: 'FETCH_EVENTS',
  name: 'Select tracked analytics events',
  next: 'AGGREGATE',
  type: 'table-select',
  count: false,
  limit: 50000,
  columns: {
    id: true,
    createdAt: true,
    event_type: true,
    page_path: true,
    topic_id: true,
    note_id: true,
    user_id: true,
    utm_source: true,
    utm_medium: true,
    utm_campaign: true,
    referrer_host: true,
    device_type: true,
  },
  tableName: 'analytics_events',
  formulaColumns: {},
  __wwdescription:
    'Read captured page, notes, and lesson events for traffic and content-view analytics (SELECT only).',
};

wf.actions.AGGREGATE.next = 'ADD_TRACKING';

wf.actions.ADD_TRACKING = {
  id: 'ADD_TRACKING',
  name: 'Add tracked traffic and views',
  next: 'RETURN_OK',
  type: 'custom-js',
  __wwdescription:
    'Merge events captured during the selected date range into the admin analytics response.',
  code: readFileSync('bridge/admin-analytics-add-tracking.js', 'utf8'),
};

wf.actions.RETURN_OK.args.body = {
  __wwtype: 'js',
  code: "return JSON.stringify(context.workflow['ADD_TRACKING'].result || {});",
};

const payload = {
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  id: wf.id,
  description: wf.description,
  firstAction: wf.firstAction,
  actions: wf.actions,
};

writeFileSync('bridge/_admin-analytics-edit.json', JSON.stringify(payload));
console.log('Wrote bridge/_admin-analytics-edit.json');
