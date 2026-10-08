import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = dirname(fileURLToPath(import.meta.url));
const projectId = 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0';
const workflowId = '76a75cf3-a89f-4e2a-a0ab-e833a43bc43b';
const addTrackingCode = fs.readFileSync(join(dir, 'admin-analytics-add-tracking.js'), 'utf8');

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', 'https://ai-api.weweb.io/v1/mcp'],
});

const client = new Client({ name: 'invoke-edit-admin-analytics', version: '1.0.0' });
await client.connect(transport);

function toolText(result) {
  return result.content?.map((c) => c.text).join('\n') ?? JSON.stringify(result);
}

const getResult = await client.callTool({
  name: 'getBackendWorkflow',
  arguments: { projectId, id: workflowId },
});
const wf = JSON.parse(toolText(getResult));

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
  code: addTrackingCode,
};

wf.actions.RETURN_OK.args.body = {
  __wwtype: 'js',
  code: "return JSON.stringify(context.workflow['ADD_TRACKING'].result || {});",
};

const editArgs = {
  projectId,
  id: workflowId,
  description: wf.description,
  firstAction: wf.firstAction,
  actions: wf.actions,
};

fs.writeFileSync(join(dir, '_admin-analytics-edit.json'), JSON.stringify(editArgs));

const editResult = await client.callTool({
  name: 'editBackendWorkflow',
  arguments: editArgs,
});
console.log(toolText(editResult));
await client.close();
