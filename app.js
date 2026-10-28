(() => {
  'use strict';
  const { plants, teams, orders } = window.PCM360;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const labels = {
    overview: ['Visão geral', 'Visão geral da operação', 'Indicadores integrados de manutenção para uma visão estadual.'],
    engineering: ['Engenharia', 'Engenharia e confiabilidade', 'Recorrências, ativos críticos e sinais para análise técnica.'],
    diagnostics: ['Itens, causas e ações', 'Diagnóstico da manutenção', 'Explore os registros associados às ordens concluídas.'],
    plans: ['Planos e prazos', 'Planos e prazos', 'Aderência ilustrativa das rotinas preventivas e preditivas.'],
    orders: ['Ordens de serviço', 'Ordens de serviço', 'Carteira fictícia de manutenção por unidade e equipe.'],
    stops: ['Paradas', 'Paradas e disponibilidade', 'Histórico ilustrativo de eventos de indisponibilidade.'],
    teams: ['Equipes e horas', 'Equipes e horas apontadas', 'Capacidade e execução agregadas por equipe fictícia.']
  };
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const selected = { page: 'overview', plant: '', type: '', team: '', days: 365 };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const formatNumber = value => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const formatDate = value => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')) : '—';
  const percent = value => (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
  const now = new Date('2026-10-28T12:00:00Z');

  function filteredOrders() {
    const cutoff = new Date(now);
    cutoff.setUTCDate(cutoff.getUTCDate() - selected.days);
    const cutoffText = cutoff.toISOString().slice(0, 10);
    return orders.filter(order =>
      order.opened >= cutoffText &&
      (!selected.plant || order.plantId === selected.plant) &&
      (!selected.type || order.type === selected.type) &&
      (!selected.team || order.teamId === selected.team)
    );
  }

  function statusClass(adherence) {
    return adherence >= 0.85 ? 'good' : adherence >= 0.6 ? 'warn' : 'bad';
  }

  function statusLabel(adherence) {
    return adherence >= 0.85 ? 'Dentro da meta' : adherence >= 0.6 ? 'Atenção' : 'Crítico';
  }

  function kpi(label, value, note, icon, color = 'orange') {
    const palettes = {
      orange: ['#fff0e5', '#bd4f16'],
      green: ['#e9f5ee', '#378461'],
      amber: ['#fff4e2', '#ad791c'],
      teal: ['#e8f4f2', '#167a70']
    };
    const [bg, accent] = palettes[color];
    return `<article class="kpi" data-icon="${esc(icon)}" style="--kpi-bg:${bg};--kpi-color:${accent}"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(value)}</div><div class="kpi-note">${esc(note)}</div></article>`;
  }

  function renderHeader() {
    const [short, title, description] = labels[selected.page];
    $('#pageName').textContent = short;
    $('#pageTitle').textContent = title;
    $('#pageDescription').textContent = description;
    $('#pageDescription').textContent = description;
    $$('[data-page]').forEach(button => button.classList.toggle('active', button.dataset.page === selected.page));
    $$('[data-view]').forEach(view => { view.hidden = view.dataset.view !== selected.page; });
  }

  function renderKpis(rows) {
    const completed = rows.filter(order => order.status === 'Concluída').length;
    const laborHours = rows.reduce((sum, order) => sum + order.hours, 0);
    const adherencePlants = plants.filter(plant => !selected.plant || plant.id === selected.plant);
    const planned = adherencePlants.reduce((sum, plant) => sum + plant.plan, 0);
    const done = adherencePlants.reduce((sum, plant) => sum + plant.done, 0);
    const adherence = planned ? done / planned : 0;
    const insideTarget = adherencePlants.filter(plant => plant.adherence >= 0.85).length;
    $('#kpis').innerHTML = [
      kpi('Ordens no período', formatNumber(rows.length), `${completed} concluídas no recorte`, '≡', 'orange'),
      kpi('Aderência aos planos', percent(adherence), 'Ordens preventivas e preditivas', '◷', statusClass(adherence) === 'good' ? 'green' : 'amber'),
      kpi('Plantas dentro da meta', `${insideTarget}/${adherencePlants.length}`, 'Meta de aderência igual ou acima de 85%', '⌖', 'teal'),
      kpi('Horas apontadas', formatNumber(laborHours) + ' h', `${rows.reduce((sum, order) => sum + order.overtime, 0)} h extras fictícias`, '◴', 'amber')
    ].join('');
  }

  function plantColor(plant) {
    return plant.adherence >= 0.85 ? '#2e8a68' : plant.adherence >= 0.6 ? '#db9a2c' : '#d65b4b';
  }

  function renderMap() {
    const visiblePlants = plants.filter(plant => !selected.plant || plant.id === selected.plant);
    const point = plant => ({ x: 100 + plant.x * 7.9, y: 25 + plant.y * 2.45 });
    const hub = { x: 620, y: 108 };
    const outline = 'M315 30 L485 18 L620 43 L733 31 L828 80 L851 155 L818 226 L733 268 L624 256 L522 290 L395 270 L304 221 L261 139 Z';
    const routes = visiblePlants.map(plant => {
      const { x, y } = point(plant);
      return `<path class="route" d="M${hub.x} ${hub.y} Q${(hub.x + x) / 2} ${(hub.y + y) / 2 - 18} ${x} ${y}"/>`;
    }).join('');
    const nodes = visiblePlants.map(plant => {
      const { x, y } = point(plant);
      const color = plantColor(plant);
      return `<g class="node" role="button" tabindex="0" aria-label="Filtrar por ${esc(plant.name)}" data-map-plant="${esc(plant.id)}" style="--node-color:${color}"><circle class="halo" cx="${x}" cy="${y}" r="12"/><circle cx="${x}" cy="${y}" r="5"/><text x="${x + 9}" y="${y + 3}">${esc(plant.id)}</text><title>${esc(plant.name)} · ${esc(plant.city)} · ${percent(plant.adherence)} de aderência fictícia</title></g>`;
    }).join('');
    $('#stateMap').innerHTML = `<svg viewBox="0 0 1000 315" role="img" aria-label="Diagrama esquemático, sem escala, com plantas fictícias no Piauí"><path class="land" d="${outline}"/><text class="map-caption" x="445" y="157">PIAUÍ</text><text class="map-caption" x="420" y="173">DIAGRAMA SEM ESCALA</text>${routes}${nodes}</svg>`;
    $$('[data-map-plant]').forEach(node => {
      const apply = () => {
        selected.plant = selected.plant === node.dataset.mapPlant ? '' : node.dataset.mapPlant;
        $('#plantFilter').value = selected.plant;
        render();
      };
      node.addEventListener('click', apply);
      node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); apply(); } });
    });
  }

  function renderMonthly(rows) {
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(2025, 10 + index, 1));
      const year = date.getUTCFullYear(), month = date.getUTCMonth();
      const values = rows.filter(order => {
        const orderDate = new Date(order.opened + 'T12:00:00Z');
        return orderDate.getUTCFullYear() === year && orderDate.getUTCMonth() === month;
      });
      return { label: monthNames[month], total: values.length, closed: values.filter(order => order.status === 'Concluída').length };
    });
    const max = Math.max(1, ...months.map(month => month.total));
    $('#monthlyChart').innerHTML = months.map(month => `<div class="month-column" title="${month.total} ordens, ${month.closed} concluídas"><div class="bar-pair"><span class="bar" style="height:${Math.max(3, month.total / max * 100)}%"></span><span class="bar closed" style="height:${Math.max(3, month.closed / max * 100)}%"></span></div><span class="month-label">${month.label}</span></div>`).join('') + '<div class="chart-legend"><span><i></i>Total</span><span><i class="closed-key"></i>Concluídas</span></div>';
  }

  function renderPlantHealth() {
    const visible = plants.filter(plant => !selected.plant || plant.id === selected.plant)
      .sort((a, b) => a.adherence - b.adherence).slice(0, 6);
    $('#plantHealth').innerHTML = visible.map(plant => `<div class="health-row"><div class="health-name" title="${esc(plant.name)}">${esc(plant.name)}<small>${esc(plant.city)}</small></div><div class="progress"><span style="width:${plant.adherence * 100}%;--bar-color:${plantColor(plant)}"></span></div><div class="health-value">${percent(plant.adherence)}</div></div>`).join('');
  }

  function renderTypeBreakdown(rows) {
    const colors = { Preventiva: '#e97732', Corretiva: '#167a70', Preditiva: '#7593a0', Emergencial: '#d65b4b' };
    const counts = Object.fromEntries(['Preventiva', 'Corretiva', 'Preditiva', 'Emergencial'].map(type => [type, rows.filter(row => row.type === type).length]));
    const max = Math.max(1, ...Object.values(counts));
    $('#typeBreakdown').innerHTML = Object.entries(counts).map(([type, count]) => `<div><div class="type-row-head"><span>${type}</span><b>${count}</b></div><div class="progress"><span style="width:${count / max * 100}%;--bar-color:${colors[type]}"></span></div></div>`).join('');
  }

  function groupBy(rows, key, labelKey) {
    const map = new Map();
    rows.forEach(row => {
      const value = row[key];
      const item = map.get(value) || { label: row[labelKey], count: 0, hours: 0, downtime: 0 };
      item.count++;
      item.hours += row.hours;
      item.downtime += row.downtime;
      map.set(value, item);
    });
    return [...map.entries()].map(([id, value]) => ({ id, ...value })).sort((a, b) => b.count - a.count);
  }

  function table(headers, rows, emptyMessage = 'Nenhum registro corresponde aos filtros.') {
    if (!rows.length) return `<div class="table-empty">${esc(emptyMessage)}</div>`;
    return `<table><thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }

  function statusPill(text, kind) {
    return `<span class="status ${kind}">${esc(text)}</span>`;
  }

  function renderEngineering(rows) {
    const completed = rows.filter(row => row.status === 'Concluída');
    const corrective = completed.filter(row => row.type === 'Corretiva' || row.type === 'Emergencial');
    const assetsByCount = groupBy(corrective, 'asset', 'asset').slice(0, 10);
    const meanHours = completed.length ? completed.reduce((sum, row) => sum + row.hours, 0) / completed.length : 0;
    const assetsCount = new Set(rows.map(row => row.asset)).size;
    $('#engineeringSummary').innerHTML = [
      kpi('Ordens corretivas concluídas', corrective.length, 'Corretivas e emergenciais', '⌁'),
      kpi('Ativos com intervenção', assetsCount, 'No recorte selecionado', '⚙', 'teal'),
      kpi('Tempo médio por ordem', formatNumber(meanHours) + ' h', 'Horas fictícias nas ordens concluídas', '◴', 'amber')
    ].join('');
    $('#assetRanking').innerHTML = table(['Ativo', 'Intervenções', 'Horas apontadas', 'Tipo mais frequente'], assetsByCount.map(item => {
      const assetOrders = corrective.filter(row => row.asset === item.id);
      const dominantType = groupBy(assetOrders, 'type', 'type')[0]?.label || '—';
      return `<tr><td><strong>${esc(item.label)}</strong></td><td>${item.count}</td><td>${formatNumber(item.hours)} h</td><td>${esc(dominantType)}</td></tr>`;
    }));
    const repeated = groupBy(completed, 'problem', 'problem').filter(item => item.count >= 4).slice(0, 6);
    $('#recurrenceCards').innerHTML = repeated.length ? repeated.map(item => `<div class="recurrence"><strong>${esc(item.label)}</strong><span>${item.count} ordens concluídas associadas. Avaliar histórico e contexto operacional.</span></div>`).join('') : '<div class="table-empty">Sem recorrências destacadas neste recorte.</div>';
  }

  function renderDiagnostics(rows) {
    const completed = rows.filter(row => row.status === 'Concluída');
    const sets = [
      ['Componentes', 'component'],
      ['Problemas registrados', 'problem'],
      ['Causas registradas', 'cause'],
      ['Ações registradas', 'action']
    ];
    $('#diagnosticGrid').innerHTML = sets.map(([title, key]) => {
      const ranking = groupBy(completed, key, key).slice(0, 5);
      return `<article class="diagnostic-card"><h3>${title}</h3><ol>${ranking.map(item => `<li>${esc(item.label)} <span>${item.count} OS</span></li>`).join('') || '<li>Sem registros no período</li>'}</ol></article>`;
    }).join('');
    const evidence = completed.slice().sort((a, b) => b.opened.localeCompare(a.opened)).slice(0, 24);
    $('#diagnosticTable').innerHTML = table(['Ordem', 'Planta', 'Ativo', 'Item', 'Problema', 'Causa registrada', 'Ação'], evidence.map(row => `<tr><td><strong>${esc(row.id)}</strong></td><td>${esc(row.plant)}</td><td>${esc(row.asset)}</td><td>${esc(row.component)}</td><td>${esc(row.problem)}</td><td>${esc(row.cause)}</td><td>${esc(row.action)}</td></tr>`));
  }

  function renderPlans() {
    const visible = plants.filter(plant => !selected.plant || plant.id === selected.plant);
    const totalPlan = visible.reduce((sum, plant) => sum + plant.plan, 0);
    const totalDone = visible.reduce((sum, plant) => sum + plant.done, 0);
    const delayed = visible.filter(plant => plant.adherence < 0.6).length;
    $('#planKpis').innerHTML = [
      kpi('Ordens previstas', totalPlan, 'Programação fictícia do período', '◷'),
      kpi('Ordens executadas', totalDone, `${totalPlan ? percent(totalDone / totalPlan) : '0%'} de aderência agregada`, '✓', 'green'),
      kpi('Plantas em situação crítica', delayed, 'Aderência abaixo de 60%', '!', delayed ? 'amber' : 'green')
    ].join('');
    $('#plansTable').innerHTML = table(['Unidade', 'Município', 'Ordens planejadas', 'Executadas', 'Aderência', 'Situação'], visible.slice().sort((a, b) => a.adherence - b.adherence).map(plant => `<tr><td><strong>${esc(plant.name)}</strong></td><td>${esc(plant.city)}</td><td>${plant.plan}</td><td>${plant.done}</td><td>${percent(plant.adherence)}</td><td>${statusPill(statusLabel(plant.adherence), statusClass(plant.adherence))}</td></tr>`));
  }

  function renderOrders(rows) {
    const ordered = rows.slice().sort((a, b) => b.opened.localeCompare(a.opened));
    $('#ordersCount').textContent = `${rows.length} ordens no recorte`;
    $('#ordersTable').innerHTML = table(['Ordem', 'Unidade', 'Ativo', 'Tipo', 'Prioridade', 'Abertura', 'Equipe', 'Horas', 'Status'], ordered.map(row => {
      const kind = row.status === 'Concluída' ? 'good' : row.status === 'Em andamento' ? 'warn' : 'neutral';
      return `<tr><td><strong>${esc(row.id)}</strong></td><td>${esc(row.plant)}</td><td>${esc(row.asset)}</td><td>${esc(row.type)}</td><td>${esc(row.priority)}</td><td>${formatDate(row.opened)}</td><td>${esc(row.team)}</td><td>${row.hours} h</td><td>${statusPill(row.status, kind)}</td></tr>`;
    }));
  }

  function renderStops(rows) {
    const stopOrders = rows.filter(row => row.stopped);
    const events = stopOrders.length;
    const downtime = stopOrders.reduce((sum, row) => sum + row.downtime, 0);
    const operatingHours = selected.days * 24;
    const availability = operatingHours ? Math.max(0, 1 - downtime / operatingHours) : 0;
    $('#stopKpis').innerHTML = [
      kpi('Eventos de parada', events, 'Ordens fictícias com parada registrada', 'Ⅱ', events ? 'amber' : 'green'),
      kpi('Horas indisponíveis', formatNumber(downtime) + ' h', 'Somatório cenográfico de eventos', '◴', 'orange'),
      kpi('Disponibilidade estimada', percent(availability), 'Estimativa agregada para demonstração', '◉', availability >= 0.85 ? 'green' : 'amber')
    ].join('');
    const grouped = groupBy(stopOrders, 'plantId', 'plant');
    const visiblePlants = plants.filter(plant => !selected.plant || plant.id === selected.plant);
    const reportDays = Math.min(selected.days, 365);
    $('#stopsTable').innerHTML = table(['Unidade', 'Município', 'Eventos', 'Horas paradas', 'Disponibilidade estimada'], visiblePlants.map(plant => {
      const item = grouped.find(row => row.id === plant.id);
      const hours = item?.downtime || 0;
      const estimate = Math.max(0, 1 - hours / (reportDays * 24));
      return `<tr><td><strong>${esc(plant.name)}</strong></td><td>${esc(plant.city)}</td><td>${item?.count || 0}</td><td>${formatNumber(hours)} h</td><td>${percent(estimate)}</td></tr>`;
    }));
  }

  function renderTeams(rows) {
    const groups = groupBy(rows, 'teamId', 'team');
    const hours = rows.reduce((sum, row) => sum + row.hours, 0);
    const overtime = rows.reduce((sum, row) => sum + row.overtime, 0);
    const completed = rows.filter(row => row.status === 'Concluída').length;
    $('#teamKpis').innerHTML = [
      kpi('Horas apontadas', formatNumber(hours) + ' h', 'Horas de trabalho nas ordens filtradas', '◴'),
      kpi('Horas extras', formatNumber(overtime) + ' h', 'Valor agregado fictício', '＋', 'amber'),
      kpi('Ordens concluídas', completed, 'Execução no período selecionado', '✓', 'green')
    ].join('');
    $('#teamsTable').innerHTML = table(['Equipe', 'Especialidade', 'Ordens', 'Concluídas', 'Horas apontadas', 'Horas extras', 'OS concluídas / 100 h'], teams.filter(team => !selected.team || team.id === selected.team).map(team => {
      const teamOrders = rows.filter(row => row.teamId === team.id);
      const done = teamOrders.filter(row => row.status === 'Concluída').length;
      const teamHours = teamOrders.reduce((sum, row) => sum + row.hours, 0);
      const extra = teamOrders.reduce((sum, row) => sum + row.overtime, 0);
      const productivity = teamHours ? done / teamHours * 100 : 0;
      return `<tr><td><strong>${esc(team.name)}</strong></td><td>${esc(team.specialty)}</td><td>${teamOrders.length}</td><td>${done}</td><td>${teamHours} h</td><td>${extra} h</td><td>${formatNumber(productivity)}</td></tr>`;
    }));
    if (!groups.length) $('#teamsTable').innerHTML = '<div class="table-empty">Sem ordens para as equipes selecionadas.</div>';
  }

  function render() {
    renderHeader();
    const rows = filteredOrders();
    renderKpis(rows);
    renderMap();
    renderMonthly(rows);
    renderPlantHealth();
    renderTypeBreakdown(rows);
    renderEngineering(rows);
    renderDiagnostics(rows);
    renderPlans();
    renderOrders(rows);
    renderStops(rows);
    renderTeams(rows);
  }

  function downloadCsv(key) {
    const rows = filteredOrders();
    const exports = {
      orders: {
        filename: 'pcm360-ordens-ficticias.csv',
        fields: ['id', 'plant', 'city', 'asset', 'type', 'priority', 'opened', 'closed', 'team', 'hours', 'overtime', 'status'],
        headers: ['Ordem', 'Planta', 'Município', 'Ativo', 'Tipo', 'Prioridade', 'Abertura', 'Conclusão', 'Equipe', 'Horas', 'Horas extras', 'Status'],
        data: rows
      },
      diagnostics: {
        filename: 'pcm360-diagnostico-ficticio.csv',
        fields: ['id', 'plant', 'asset', 'component', 'problem', 'cause', 'action'],
        headers: ['Ordem', 'Planta', 'Ativo', 'Item', 'Problema', 'Causa registrada', 'Ação'],
        data: rows.filter(row => row.status === 'Concluída')
      },
      plans: {
        filename: 'pcm360-planos-ficticios.csv',
        fields: ['name', 'city', 'plan', 'done', 'adherence'],
        headers: ['Planta', 'Município', 'Planejadas', 'Executadas', 'Aderência'],
        data: plants.filter(plant => !selected.plant || plant.id === selected.plant).map(plant => ({ ...plant, name: plant.name }))
      },
      teams: {
        filename: 'pcm360-equipes-ficticias.csv',
        fields: ['name', 'specialty', 'orders', 'completed', 'hours', 'overtime', 'productivity'],
        headers: ['Equipe', 'Especialidade', 'Ordens', 'Concluídas', 'Horas', 'Horas extras', 'OS concluídas por 100 h'],
        data: teams.filter(team => !selected.team || team.id === selected.team).map(team => {
          const teamOrders = rows.filter(row => row.teamId === team.id);
          const hours = teamOrders.reduce((sum, row) => sum + row.hours, 0);
          const completed = teamOrders.filter(row => row.status === 'Concluída').length;
          return { ...team, orders: teamOrders.length, completed, hours, overtime: teamOrders.reduce((sum, row) => sum + row.overtime, 0), productivity: hours ? completed / hours * 100 : 0 };
        })
      }
    };
    const config = exports[key];
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [config.headers, ...config.data.map(row => config.fields.map(field => row[field]))]
      .map(line => line.map(quote).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + lines], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = config.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setup() {
    $('#plantFilter').innerHTML += plants.map(plant => `<option value="${esc(plant.id)}">${esc(plant.name)} · ${esc(plant.city)}</option>`).join('');
    [...new Set(orders.map(order => order.type))].sort().forEach(type => $('#typeFilter').insertAdjacentHTML('beforeend', `<option value="${esc(type)}">${esc(type)}</option>`));
    teams.forEach(team => $('#teamFilter').insertAdjacentHTML('beforeend', `<option value="${esc(team.id)}">${esc(team.name)}</option>`));
    $$('[data-page]').forEach(button => button.addEventListener('click', () => {
      selected.page = button.dataset.page;
      document.body.classList.remove('nav-open');
      render();
    }));
    $$('[data-go]').forEach(button => button.addEventListener('click', () => {
      selected.page = button.dataset.go;
      render();
    }));
    $('#plantFilter').addEventListener('change', event => { selected.plant = event.target.value; render(); });
    $('#typeFilter').addEventListener('change', event => { selected.type = event.target.value; render(); });
    $('#teamFilter').addEventListener('change', event => { selected.team = event.target.value; render(); });
    $('#period').addEventListener('change', event => { selected.days = Number(event.target.value); render(); });
    $('#resetFilters').addEventListener('click', () => {
      selected.plant = ''; selected.type = ''; selected.team = '';
      $('#plantFilter').value = ''; $('#typeFilter').value = ''; $('#teamFilter').value = '';
      render();
    });
    $('#mobileMenu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $$('[data-export]').forEach(button => button.addEventListener('click', () => downloadCsv(button.dataset.export)));
    render();
  }

  setup();
})();
