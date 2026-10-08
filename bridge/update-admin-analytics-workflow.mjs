import { readFileSync, writeFileSync } from 'fs';

const wfPath = process.argv[2];
const outPath = process.argv[3];
const wf = JSON.parse(readFileSync(wfPath, 'utf8'));

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
  code: `const analytics = context.workflow['AGGREGATE'].result || {};
const events = context.workflow['FETCH_EVENTS'].result?.data || [];
const topics = context.workflow['FETCH_TOPICS'].result?.data || [];
const range = analytics.range || {};
const start = range.start ? new Date(range.start + 'T00:00:00.000Z').getTime() : 0;
const end = range.end ? new Date(range.end + 'T23:59:59.999Z').getTime() : Date.now();

const topicById = {};
for (let t = 0; t < topics.length; t++) {
  if (topics[t]?.id) topicById[topics[t].id] = topics[t].name || 'Topic';
}

function isInRange(event) {
  const timestamp = new Date(event.createdAt).getTime();
  return !isNaN(timestamp) && timestamp >= start && timestamp <= end;
}
function addCount(counts, value, fallback) {
  const key = String(value || '').trim() || fallback;
  counts[key] = (counts[key] || 0) + 1;
}
function toRows(counts) {
  return Object.keys(counts).map(function (name) {
    return { name: name, count: counts[name] };
  }).sort(function (a, b) { return b.count - a.count; });
}

const sources = {};
const media = {};
const campaigns = {};
const referrers = {};
const devices = {};
const noteViews = {};
let notesViewed = 0;
let pageViews = 0;

for (let index = 0; index < events.length; index++) {
  const event = events[index];
  if (!isInRange(event)) continue;
  const type = event.event_type || 'page_view';
  if (type === 'page_view') {
    pageViews++;
    addCount(sources, event.utm_source, 'Direct');
    addCount(media, event.utm_medium, 'None');
    addCount(campaigns, event.utm_campaign, 'None');
    addCount(referrers, event.referrer_host, 'Direct');
    addCount(devices, event.device_type, 'Desktop');
  }
  if (type === 'notes_view' || type === 'lesson_view') {
    notesViewed++;
    let label = 'Notes';
    if (event.topic_id && topicById[event.topic_id]) label = topicById[event.topic_id];
    else if (event.page_path) label = event.page_path;
    addCount(noteViews, label, 'Notes');
  }
}

analytics.overview = analytics.overview || {};
analytics.content = analytics.content || {};
analytics.overview.notesViewed = notesViewed;
analytics.content.mostViewedNotes = toRows(noteViews).slice(0, 10);
analytics.traffic = {
  pageViews: pageViews,
  bySource: toRows(sources),
  byMedium: toRows(media),
  byCampaign: toRows(campaigns),
  byReferrer: toRows(referrers),
  byDevice: toRows(devices)
};
return analytics;`,
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

writeFileSync(outPath, JSON.stringify(payload));
