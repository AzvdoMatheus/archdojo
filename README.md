# Design System Playground

Playground pessoal para praticar system design através de desafios no estilo
leetcode: simular a arquitetura de sistemas consolidados (ex.: url shortener,
rate limiter, feed de notícias, etc.) como componentes React interativos, e
evoluir requisitos funcionais e não funcionais desafio a desafio.

## Estrutura

```
apps/playground/   shell React (Vite) com navegação entre os desafios
challenges/         um pacote por desafio (ex.: challenges/url-shortener)
packages/           código compartilhado entre desafios (criado sob demanda)
```

Cada desafio é um pacote pnpm que exporta um componente React, consumido pelo
shell em `apps/playground`. Nenhum desafio depende de outro por padrão; se
algo se repetir entre desafios, extraímos para `packages/`.

## Workflow de um desafio

1. Definir o problema e construir juntos os requisitos funcionais e não
   funcionais (throughput, latência, consistência, disponibilidade, etc.) —
   ver `challenges/CHALLENGE_TEMPLATE.md`.
2. Implementar em `challenges/<nome>/src`.
3. Testar em `challenges/<nome>/src/**/*.test.tsx`.
4. Registrar em `apps/playground/src/challenges/registry.ts` pra navegar até
   ele no playground.

## Comandos

```
pnpm install       # instala dependências do monorepo
pnpm dev            # sobe o playground em modo dev (Vite)
pnpm build          # build de produção do playground
pnpm lint            # biome check
pnpm lint:fix        # biome check --write
pnpm format           # biome format --write
pnpm typecheck        # tsc --noEmit em cada pacote
pnpm test              # vitest run em todos os pacotes
pnpm test:watch        # vitest em modo watch
```

## Stack

- React + TypeScript (strict) via `tsconfig.base.json`
- Vite (dev server + build do playground)
- React Router (navegação entre desafios)
- Tailwind CSS v4 + shadcn/ui (`packages/ui`) para estilização
- Biome (lint + format)
- pnpm workspaces (monorepo)
- Vitest + Testing Library (testes de componente)

Infra adicional (Docker, filas, bancos, CI) é adicionada por desafio, quando
o próprio desafio exigir.
