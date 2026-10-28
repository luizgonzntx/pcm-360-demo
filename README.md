# PCM 360º

Protótipo demonstrativo de Planejamento e Controle da Manutenção para uma operação fictícia distribuída pelo Piauí. A interface reproduz o fluxo de um painel PCM completo, com identidade visual própria em tons de laranja.

> **Portfólio, não operação real.** Plantas, equipes, ordens, ativos, apontamentos de horas, paradas e indicadores são inteiramente fictícios. Não use os números para decisões operacionais ou avaliação de pessoas.

## Funcionalidades

- Visão executiva com indicadores, evolução mensal, instalações e mapa.
- Filtros de período, planta, ativo, tipo de ordem e prioridade.
- Engenharia: mix de manutenção, ativos recorrentes, retrabalho e confiabilidade.
- Itens, causas registradas e medidas realizadas, com evidências por ordem.
- Aderência preventiva e preditiva, prazos e vencimentos.
- Consulta paginada de ordens, busca e exportação CSV.
- Paradas, MTBF, MTTR e disponibilidade estimada, com critérios explícitos.
- Horas apontadas e horas extras fictícias, agregadas por equipe.
- Relatórios para impressão e interface responsiva.

## Executar localmente

Requer Node.js, sem instalação de pacotes:

```sh
npm test
python3 -m http.server 4173
```

Abra `http://localhost:4173`. O mapa usa Leaflet e tiles do OpenStreetMap; esses recursos externos servem apenas para renderizar o fundo cartográfico.

## Transparência e limites

- Dados sintéticos locais em `data.js`; o protótipo não tem login, banco de dados, importação operacional nem serviço de telemetria.
- O mapa mostra posições aproximadas das cidades para fins ilustrativos; os nomes de instalações e tags são inventados.
- As horas são agregadas por equipe. Não há nomes, registros individuais de jornada ou monitoramento de atividade.
- Produtividade é apresentada como ordens concluídas por 100 horas apontadas; não deve ser interpretada isoladamente como avaliação de desempenho.
- Uma causa apontada não equivale a uma causa raiz confirmada.
- MTBF, MTTR e disponibilidade são estimativas cenográficas e não substituem medições operacionais.
