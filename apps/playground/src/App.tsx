import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { challenges } from "./challenges/registry";

function EmptyState() {
  return (
    <div className="empty-state">
      <p>Nenhum desafio cadastrado ainda.</p>
      <p>
        Copie <code>challenges/CHALLENGE_TEMPLATE.md</code> pra começar um novo e registre-o em{" "}
        <code>src/challenges/registry.ts</code>.
      </p>
    </div>
  );
}

export function App() {
  const firstChallenge = challenges[0];

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>Arch Dojo</h1>
        <ul>
          {challenges.map((challenge) => (
            <li key={challenge.slug}>
              <NavLink to={`/${challenge.slug}`}>{challenge.title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content">
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
