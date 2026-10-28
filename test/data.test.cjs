const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const { plants, teams, orders } = sandbox.window.PCM360;

test('fixture provides a statewide set of uniquely identified fictional plants and teams', () => {
  assert.ok(plants.length >= 8);
  assert.equal(new Set(plants.map(plant => plant.id)).size, plants.length);
  assert.ok(plants.every(plant => plant.name && plant.city && plant.adherence >= 0 && plant.adherence <= 1));
  assert.ok(teams.length >= 4);
  assert.equal(new Set(teams.map(team => team.id)).size, teams.length);
});

test('orders have unique identifiers and reference valid plants and teams', () => {
  assert.ok(orders.length >= 100);
  assert.equal(new Set(orders.map(order => order.id)).size, orders.length);
  const plantIds = new Set(plants.map(plant => plant.id));
  const teamIds = new Set(teams.map(team => team.id));
  assert.ok(orders.every(order =>
    plantIds.has(order.plantId) &&
    teamIds.has(order.teamId) &&
    order.hours > 0 &&
    order.opened.match(/^\d{4}-\d{2}-\d{2}$/) &&
    ['Concluída', 'Em andamento', 'Programada'].includes(order.status)
  ));
});

test('all generated orders fall within the documented 2025–2026 demo range', () => {
  const dates = orders.map(order => order.opened).sort();
  assert.ok(dates[0] >= '2025-11-01');
  assert.ok(dates.at(-1) <= '2026-10-31');
  assert.ok(orders.some(order => order.stopped && order.downtime > 0));
});
