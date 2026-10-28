(() => {
  'use strict';
  const systems = [
    { tag: 'PI-ETA-01', name: 'ETA Sol do Norte', district: 'Parnaíba', lat: -2.91, lng: -41.78, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-02', name: 'Elevatória Dunas', district: 'Luís Correia', lat: -2.88, lng: -41.67, status: 'Operacional', critical: 'Média' },
    { tag: 'PI-ETA-03', name: 'ETA Riacho Claro', district: 'Piripiri', lat: -4.27, lng: -41.78, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-04', name: 'Elevatória Ipê', district: 'Campo Maior', lat: -4.83, lng: -42.17, status: 'Operacional', critical: 'Média' },
    { tag: 'PI-ETA-05', name: 'ETA Pedra Branca', district: 'Teresina', lat: -5.08, lng: -42.81, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-06', name: 'Elevatória Carnaúba', district: 'Altos', lat: -5.04, lng: -42.46, status: 'Operacional', critical: 'Baixa' },
    { tag: 'PI-ETA-07', name: 'ETA Serra Dourada', district: 'Floriano', lat: -6.77, lng: -43.02, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-08', name: 'Elevatória Mandacaru', district: 'Oeiras', lat: -7.02, lng: -42.13, status: 'Operacional', critical: 'Média' },
    { tag: 'PI-ETA-09', name: 'ETA Vale das Águas', district: 'Picos', lat: -7.08, lng: -41.47, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-10', name: 'Elevatória Umbuzeiro', district: 'Bom Jesus', lat: -9.07, lng: -44.36, status: 'Operacional', critical: 'Média' },
    { tag: 'PI-ETA-11', name: 'ETA Lagoa Serena', district: 'São Raimundo Nonato', lat: -9.02, lng: -42.70, status: 'Operacional', critical: 'Alta' },
    { tag: 'PI-ELE-12', name: 'Elevatória Jatobá', district: 'Uruçuí', lat: -7.23, lng: -44.56, status: 'Operacional', critical: 'Média' }
  ];
  const types = ['ZTPF', 'ZTPD', 'ZTPC', 'ZNTP', 'ZNTE', 'ZTEN', 'ZTCO'];
  const assets = ['TAG-BC-101', 'TAG-MT-204', 'TAG-VR-016', 'TAG-PA-032', 'TAG-SN-008', 'TAG-CM-113', 'TAG-INV-021', 'TAG-MV-014'];
  const equipment = ['Bomba centrífuga', 'Motor elétrico', 'Válvula de retenção', 'Painel de comando', 'Sensor de pressão', 'Conjunto motobomba', 'Inversor de frequência', 'Medidor de vazão'];
  const components = ['Rolamento', 'Selo mecânico', 'Acoplamento', 'Motor elétrico', 'Painel elétrico', 'Válvula', 'Sensor', 'Filtro'];
  const problems = ['Vibração elevada', 'Falha de partida', 'Vazamento', 'Leitura instável', 'Aquecimento', 'Baixa vazão', 'Ruído anormal'];
  const causes = ['Desgaste natural', 'Desalinhamento', 'Conexão elétrica', 'Obstrução', 'Ajuste operacional', 'Inspeção programada'];
  const actions = ['Substituição de componente', 'Alinhamento do conjunto', 'Revisão de conexões', 'Limpeza do equipamento', 'Calibração do instrumento', 'Monitoramento de tendência'];
  const now = new Date();
  const date = (monthsAgo, day) => {
    const month = now.getUTCMonth() - monthsAgo;
    const dayLimit = monthsAgo === 0 ? Math.min(now.getUTCDate(), 27) : 27;
    return new Date(Date.UTC(now.getUTCFullYear(), month, Math.min(day, dayLimit))).toISOString().slice(0, 10);
  };
  const orders = Array.from({ length: 216 }, (_, index) => {
    const system = systems[(index * 7 + Math.floor(index / 5)) % systems.length];
    const stop = index % 8 === 0;
    const type = stop ? (index % 16 === 0 ? 'ZNTP' : 'ZNTE') : types[(index * 5 + Math.floor(index / 9)) % types.length];
    const status = ['ENTE', 'ENTE', 'ENTE', 'ABER', 'LIB', 'NEXE'][index % 6];
    const monthsAgo = (index * 7 + Math.floor(index / 11)) % 12;
    const created = date(monthsAgo, 1 + (index * 11) % 26);
    const start = status === 'ENTE' ? date(Math.max(0, monthsAgo - index % 2), 2 + (index * 3) % 24) : '';
    const finished = start ? date(Math.max(0, monthsAgo - index % 2), Math.min(27, Number(start.slice(-2)) + 1)) : '';
    return {
      id: 'OS-' + String(260001 + index), center: 'DEMO', tag: system.tag,
      asset: assets[(index * 3 + Math.floor(index / 8)) % assets.length],
      equipment: equipment[(index * 3 + Math.floor(index / 8)) % equipment.length],
      type, priority: index % 17 === 0 ? 'EMERG' : index % 5 === 0 ? 'ALTA' : index % 3 === 0 ? 'MÉDIA' : 'BAIXA',
      status, created, date: created, start, due: date(Math.max(0, monthsAgo - 1), 6 + (index * 5) % 20),
      finished, plan: ['ZTPF', 'ZTPD', 'ZTPC'].includes(type) ? 'Plano ' + String(1 + index % 12).padStart(2, '0') : '',
      text: ['Inspeção e ajuste do conjunto de bombeamento', 'Verificar vibração e condição de rolamentos', 'Substituição de componente com desgaste', 'Calibração e teste funcional do equipamento', 'Revisão preventiva do painel de comando', 'Avaliação de vazão e pressão operacional'][index % 6],
      stopStart: stop ? created : '', stopEnd: stop && status === 'ENTE' ? start : '',
      stopConfirmed: stop && status === 'ENTE',
      stopReason: stop ? ['Falha ou avaria', 'Parada para manutenção', 'Indisponibilidade operacional'][index % 3] : '',
      stopImpact: stop ? 'Redução temporária de disponibilidade' : '',
      hours: 2 + (index * 13) % 31,
      overtime: index % 8 === 0 ? 2 : 0,
      team: ['Equipe Laranja', 'Equipe Carnaúba', 'Equipe Jatobá', 'Equipe Ipê'][index % 4]
    };
  });
  const completed = orders.filter(order => order.status === 'ENTE');
  const items = completed.map((order, index) => ({
    order: order.id, component: components[index % components.length],
    problem: problems[(index * 2) % problems.length], cause: causes[(index * 3) % causes.length]
  }));
  const actionsList = completed.map((order, index) => ({ order: order.id, action: actions[(index * 5) % actions.length] }));
  const stoppageNotes = orders.filter(order => order.stopStart).map((order, index) => ({
    order: order.id,
    tag: order.tag,
    asset: order.asset,
    plant: systems.find(system => system.tag === order.tag).name,
    priority: order.priority,
    flag: 'X',
    date: order.stopStart,
    startDate: order.stopStart,
    startTime: '08:00:00',
    endDate: order.stopEnd,
    endTime: order.stopEnd ? '10:00:00' : '',
    note: 'NOTA-' + String(810001 + index),
    description: 'Evento fictício de indisponibilidade para demonstração'
  }));
  window.PCM_DEMO_DATA = { systems, orders, items, actions: actionsList, stoppageNotes };
})();
