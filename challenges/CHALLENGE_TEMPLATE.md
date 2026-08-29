# Template de desafio

Copiar essa estrutura para `challenges/<nome-do-desafio>/` ao iniciar um novo
desafio, e depois registrar o componente exportado em
`apps/playground/src/challenges/registry.ts` pra ele aparecer na navegação.

```
challenges/<nome-do-desafio>/
├── package.json
├── tsconfig.json           # extends ../../tsconfig.base.json
├── README.md                # requisitos + decisões de arquitetura
└── src/
    ├── index.ts              # export { X } from "./X"
    ├── <Componente>.tsx
    └── <Componente>.test.tsx
```

## README.md do desafio deve conter

- **Contexto**: o que o sistema faz, em 1-2 frases.
- **Requisitos funcionais**: o que o sistema precisa fazer.
- **Requisitos não funcionais**: escala, latência, consistência,
  disponibilidade, durabilidade — construídos junto conforme o desafio avança.
- **Decisões de arquitetura**: trade-offs escolhidos e por quê.
- **Fora de escopo**: o que foi conscientemente deixado de fora.

## package.json do desafio (exemplo mínimo)

```json
{
  "name": "@challenges/<nome-do-desafio>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.2.8"
  },
  "devDependencies": {
    "@types/react": "^19.2.7"
  }
}
```

## tsconfig.json do desafio (exemplo mínimo)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src"]
}
```

## Registrar no playground

Em `apps/playground/src/challenges/registry.ts`:

```ts
import { UrlShortener } from "@challenges/url-shortener";

export const challenges: ChallengeEntry[] = [
  { slug: "url-shortener", title: "URL Shortener", Component: UrlShortener },
];
```

E adicionar a dependência workspace no `apps/playground/package.json`:

```json
"@challenges/url-shortener": "workspace:*"
```
