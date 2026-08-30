import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { challenges } from "./challenges/registry";

function EmptyState() {
  return (
    <div className="text-muted-foreground p-8 text-lg leading-relaxed">
      <p>Nenhum desafio cadastrado ainda.</p>
      <p>
        Copie{" "}
        <code className="border border-line bg-panel rounded px-1.5 py-0.5">
          challenges/CHALLENGE_TEMPLATE.md
        </code>{" "}
        pra começar um novo e registre-o em{" "}
        <code className="border border-line bg-panel rounded px-1.5 py-0.5">
          src/challenges/registry.ts
        </code>
        .
      </p>
    </div>
  );
}

export function App() {
  const firstChallenge = challenges[0];

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-[radial-gradient(circle_at_20%_-10%,#1c0f2e_0%,var(--color-ink-2)_55%)]">
      <nav className="border-line border-r-4 bg-ink p-6">
        <h1 className="font-arcade text-neon-magenta mb-6 text-base leading-relaxed [text-shadow:0_0_6px_#ff2ea6,0_0_18px_rgba(255,46,166,0.6)]">
          Arch Dojo
        </h1>
        <ul className="flex flex-col gap-2">
          {challenges.map((challenge) => (
            <li key={challenge.slug}>
              <NavLink
                to={`/${challenge.slug}`}
                className={({ isActive }) =>
                  `text-muted-foreground block rounded border-2 px-3 py-2 text-lg tracking-wide no-underline ${
                    isActive
                      ? "border-neon-cyan text-fg bg-panel shadow-[0_0_10px_rgba(0,229,255,0.35)]"
                      : "border-transparent"
                  }`
                }
              >
                {challenge.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="min-w-0 p-6">
        <Routes>
          <Route
            path="/"
            element={
              firstChallenge ? <Navigate to={`/${firstChallenge.slug}`} replace /> : <EmptyState />
            }
          />
          {challenges.map(({ slug, Component }) => (
            <Route key={slug} path={`/${slug}`} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
