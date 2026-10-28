(() => {
  'use strict';
  const plants = [
    { id: 'TER-01', name: 'ETA Aurora', city: 'Teresina', x: 67, y: 30, adherence: 0.91, plan: 42, done: 38 },
    { id: 'PAR-02', name: 'Elevatória Horizonte', city: 'Parnaíba', x: 39, y: 12, adherence: 0.79, plan: 29, done: 23 },
    { id: 'PIR-03', name: 'ETA Vale Verde', city: 'Picos', x: 53, y: 63, adherence: 0.86, plan: 35, done: 30 },
    { id: 'FLR-04', name: 'Unidade Ipê', city: 'Floriano', x: 39, y: 53, adherence: 0.62, plan: 24, done: 15 },
    { id: 'CAM-05', name: 'ETA Campo Claro', city: 'Campo Maior', x: 73, y: 23, adherence: 0.94, plan: 31, done: 29 },
    { id: 'PIR-06', name: 'Elevatória Mandacaru', city: 'Piripiri', x: 69, y: 15, adherence: 0.55, plan: 22, done: 12 },
    { id: 'BOM-07', name: 'ETA Serra Azul', city: 'Bom Jesus', x: 48, y: 82, adherence: 0.83, plan: 27, done: 22 },
    { id: 'OEI-08', name: 'Unidade Carnaúba', city: 'Oeiras', x: 50, y: 48, adherence: 0.89, plan: 26, done: 23 },
    { id: 'UNI-09', name: 'ETA Rio Longá', city: 'União', x: 77, y: 32, adherence: 0.72, plan: 25, done: 18 }
  ];
  const teams = [
    { id: 'EQ-01', name: 'Equipe Laranja', specialty: 'Mecânica' },
    { id: 'EQ-02', name: 'Equipe Caju', specialty: 'Elétrica' },
    { id: 'EQ-03', name: 'Equipe Carnaúba', specialty: 'Instrumentação' },
    { id: 'EQ-04', name: 'Equipe Mandacaru', specialty: 'Multidisciplinar' }
  ];
  const assets = ['Bomba centrífuga', 'Motor elétrico', 'Painel de comando', 'Válvula de retenção', 'Sensor de pressão', 'Conjunto motobomba', 'Inversor de frequência', 'Medidor de vazão'];
  const components = ['Rolamento', 'Selo mecânico', 'Acoplamento', 'Motor', 'Painel elétrico', 'Válvula', 'Sensor', 'Filtro'];
  const problems = ['Vibração elevada', 'Falha de partida', 'Vazamento', 'Leitura instável', 'Aquecimento', 'Baixa vazão', 'Ruído anormal'];
  const causes = ['Desgaste natural', 'Desalinhamento', 'Conexão elétrica', 'Obstrução', 'Ajuste operacional', 'Inspeção programada'];
  const actions = ['Substituir componente', 'Realizar alinhamento', 'Revisar conexão', 'Limpar conjunto', 'Calibrar instrumento', 'Monitorar tendência'];
  const types = ['Preventiva', 'Corretiva', 'Preditiva', 'Emergencial'];
  const statuses = ['Concluída', 'Concluída', 'Concluída', 'Em andamento', 'Programada'];
  const date = (offset, day) => {
    const d = new Date(Date.UTC(2026, 9, 1));
    d.setUTCMonth(d.getUTCMonth() - offset);
    d.setUTCDate(Math.min(day, 27));
    return d.toISOString().slice(0, 10);
  };
  const orders = Array.from({ length: 108 }, (_, i) => {
    const plant = plants[(i * 7 + Math.floor(i / 4)) % plants.length];
    const team = teams[(i * 3 + Math.floor(i / 5)) % teams.length];
    const type = types[(i * 5 + Math.floor(i / 7)) % types.length];
    const status = statuses[(i * 3 + Math.floor(i / 9)) % statuses.length];
    const monthOffset = (i * 7 + Math.floor(i / 8)) % 12;
    const opened = date(monthOffset, 1 + (i * 11) % 26);
    const closed = status === 'Concluída' ? date(Math.max(0, monthOffset - (i % 3)), 2 + (i * 9) % 24) : '';
    const hours = 2 + ((i * 13) % 31);
    const row = {
      id: 'OS-' + String(260001 + i), plantId: plant.id, plant: plant.name, city: plant.city,
      teamId: team.id, team: team.name, asset: assets[(i * 3) % assets.length],
      type, priority: ['Baixa', 'Média', 'Alta', 'Urgente'][i % 4], status,
      opened, closed, plan: type === 'Preventiva' || type === 'Preditiva',
      due: date(Math.max(0, monthOffset - 1), 5 + (i * 3) % 20),
      hours, overtime: i % 8 === 0 ? 2 : 0,
      component: components[i % components.length], problem: problems[(i * 2) % problems.length],
      cause: causes[(i * 3) % causes.length], action: actions[(i * 5) % actions.length],
      stopped: i % 9 === 0, downtime: i % 9 === 0 ? 3 + (i * 7) % 26 : 0
    };
    return row;
  });
  window.PCM360 = { plants, teams, orders };
})();
