/**
 * Numbers below follow the standard "Design a URL Shortener (TinyURL)" writeup
 * (the assumptions used across Grokking the System Design Interview-style treatments
 * of this exact problem): 500M new URLs/month, 100:1 read:write ratio, 5-year retention.
 * Anything not directly stated there (e.g. peak multiplier, cache hit rate) is derived
 * from it and noted inline so it stays auditable.
 */

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60; // 2,592,000s

const NEW_URLS_PER_MONTH = 500_000_000; // standard assumption for this challenge
const READ_WRITE_RATIO = 100; // 100 reads (redirects) per 1 write (shorten)

const writeRps = NEW_URLS_PER_MONTH / SECONDS_PER_MONTH; // ~192.9 rps average
const readRps = writeRps * READ_WRITE_RATIO; // ~19,290 rps average

// Peak traffic is modeled as 3x the daily average, a common rule of thumb for
// consumer web traffic diurnal peaks (used here purely to size the challenge's
// "Simular" load - not from the original writeup).
const PEAK_MULTIPLIER = 3;

export const urlShortenerChallenge = {
  slug: "url-shortener",
  title: "URL Shortener",
  difficulty: "Fácil",
  summary: "Desenhe um encurtador de URLs estilo TinyURL/bit.ly: escrita rara, leitura em massa.",
  context:
    "Um serviço estilo TinyURL/bit.ly: o usuário envia uma URL longa e recebe uma URL curta; " +
    "acessar a URL curta redireciona (HTTP 301/302) para a URL longa original.",
  functionalRequirements: [
    "Criar uma URL curta a partir de uma URL longa (POST /shorten).",
    "Redirecionar uma URL curta para a URL longa correspondente (GET /:code).",
    "Códigos curtos não devem colidir e devem ser praticamente impossíveis de adivinhar em sequência.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Volume de escrita",
      value: `${NEW_URLS_PER_MONTH.toLocaleString("pt-BR")} novas URLs/mês (~${writeRps.toFixed(1)} req/s em média)`,
      note: "Premissa padrão do problema clássico de URL shortener.",
    },
    {
      label: "Proporção leitura:escrita",
      value: `${READ_WRITE_RATIO}:1 (redirecionamento é MUITO mais frequente que criação)`,
      note: "Premissa padrão do problema clássico de URL shortener.",
    },
    {
      label: "Volume de leitura",
      value: `~${readRps.toFixed(0)} req/s em média (derivado de escrita x proporção)`,
      note: `${writeRps.toFixed(1)} req/s x ${READ_WRITE_RATIO}`,
    },
    {
      label: "Pico de tráfego (para a simulação)",
      value: `~${(readRps * PEAK_MULTIPLIER).toFixed(0)} req/s de leitura no pico`,
      note: `Regra prática de pico ~3x a média (${PEAK_MULTIPLIER}x) para tráfego web consumidor - não vem do problema original.`,
    },
    {
      label: "Latência alvo (redirecionamento)",
      value: "p99 < 100ms",
      note: "Redirecionamento é o caminho quente e precisa parecer instantâneo para o usuário.",
    },
    {
      label: "Retenção",
      value: "5 anos",
      note: "Premissa padrão do problema clássico de URL shortener (usada para dimensionar armazenamento).",
    },
  ],
  /** RPS the Client node injects into the graph when "Simular" runs: the read-path peak. */
  simulationTrafficRps: Math.round(readRps * PEAK_MULTIPLIER),
  latencyTargetMs: 100,
} as const;
