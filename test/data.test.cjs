const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const P = require('../core.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const data = sandbox.window.PCM_DEMO_DATA;
const { systems, orders, items, actions, stoppageNotes } = data;

test('fixture provides statewide fictional installations with unique tags and valid coordinates', () => {
  assert.ok(systems.length >= 10);
  assert.equal(new Set(systems.map(system => system.tag)).size, systems.length);
  assert.ok(systems.every(system =>
    system.name &&
    system.district &&
    Number.isFinite(system.lat) && system.lat >= -10 && system.lat <= -2 &&
    Number.isFinite(system.lng) && system.lng >= -46 && system.lng <= -40
  ));
});

test('fictional work orders have unique identifiers and reference existing installations', () => {
  assert.ok(orders.length >= 200);
  assert.equal(new Set(orders.map(order => order.id)).size, orders.length);
  const systemTags = new Set(systems.map(system => system.tag));
  assert.ok(orders.every(order =>
    order.center === 'DEMO' &&
    systemTags.has(order.tag) &&
    order.hours > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(order.created) &&
    ['ENTE', 'ABER', 'LIB', 'NEXE'].includes(order.status)
  ));
});

test('synthetic order references are valid and the PCM calculations accept the demo dataset', () => {
  const orderIds = new Set(orders.map(order => order.id));
  assert.ok(items.every(item => orderIds.has(item.order)));
  assert.ok(actions.every(action => orderIds.has(action.order)));
  assert.ok(stoppageNotes.every(note => orderIds.has(note.order)));

  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(now.getUTCFullYear(), 11, 31)).toISOString().slice(0, 10);
  const filters = {
    from, to, dateField: 'created',
    tag: [], asset: [], type: [], priority: []
  };
  const rows = P.filter(data, filters);
  assert.ok(rows.length > 0);
  assert.equal(P.stats(rows).total, rows.length);
  assert.ok(P.adherence(data, filters).total > 0);
  assert.ok(P.icmMatrix(data, rows).length > 0);
  assert.ok(P.reliabilityByPlant(data, filters).length > 0);
  assert.ok(P.reliabilityByAsset(data, filters).length > 0);
  assert.ok(P.stopRecords(data, rows).length > 0);
  assert.ok(P.flaggedStopOrders(data, filters).length > 0);
  assert.ok(P.badActors(rows).length > 0);
  assert.ok(P.engineeringMetrics(data, rows, new Date().toISOString().slice(0, 10)).total > 0);
  assert.ok(P.decisionInsights(data, rows, filters).length > 0);
});

test('demo fixture contains only generated service dates in its declared date range', () => {
  const dates = orders.map(order => order.created).sort();
  const now = new Date();
  const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const earliest = firstMonth.toISOString().slice(0, 10);
  const latest = now.toISOString().slice(0, 10);
  assert.ok(dates[0] >= earliest);
  assert.ok(dates.at(-1) <= latest);
  assert.ok(orders.some(order => order.stopConfirmed));
  assert.ok(new Set(orders.map(order => order.team)).size >= 4);
});
