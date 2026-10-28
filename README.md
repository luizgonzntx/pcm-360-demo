# PCM 360º

Protótipo de portfólio de um painel integrado de Planejamento e Controle da Manutenção (PCM), pensado para uma operação fictícia com unidades distribuídas pelo Piauí.

> **Demonstração somente:** todas as plantas, equipes, ordens, horas, paradas e métricas são geradas para este protótipo. Não representam pessoas, instalações ou resultados operacionais reais.

## Funcionalidades

- Visão executiva com indicadores, tendências mensais e diagrama territorial esquemático.
- Filtros por período, planta, tipo de ordem e equipe.
- Acompanhamento ilustrativo de aderência preventiva e preditiva.
- Análises de recorrência por ativo e diagnóstico de itens, problemas, causas registradas e ações.
- Consulta e exportação CSV de ordens, planos, diagnósticos e apontamentos agregados por equipe.
- Histórico fictício de paradas e estimativa de disponibilidade claramente identificada como cenográfica.
- Horas trabalhadas, horas extras e produtividade agregada por equipe, sem dados pessoais ou monitoramento individual.
- Layout responsivo para desktop e dispositivos móveis.

## Executar localmente

Não há dependências de terceiros nem integração com banco de dados. Abra `index.html` no navegador ou inicie um servidor estático na raiz do projeto:

```sh
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173`.

## Limites e critérios da demonstração

- O mapa é um diagrama ilustrativo sem escala, não um mapa operacional nem uma representação geográfica precisa.
- Os indicadores são calculados sobre registros sintéticos definidos em `data.js`.
- A produtividade é expressa como ordens concluídas por 100 horas apontadas; não deve ser interpretada isoladamente como avaliação de desempenho.
- Os registros de causa são categorias fictícias e não equivalem a uma análise de causa raiz.
- Os números e as classificações não devem ser usados para decisões operacionais ou de pessoal.
- O protótipo não contém login, persistência de dados, telemetria, localização de trabalhadores ou envio de dados a serviços externos.
