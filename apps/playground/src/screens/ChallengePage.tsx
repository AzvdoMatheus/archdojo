import { Link, Navigate, useParams } from "react-router-dom";
import { challenges } from "../challenges/registry";

export function ChallengePage() {
  const { challengeId } = useParams();
  const challenge = challenges.find((c) => c.slug === challengeId);

  if (!challenge) {
    return <Navigate to="/" replace />;
  }

  const { Component } = challenge;

  return (
    <div className="flex h-screen min-h-0 flex-col">
      <header className="border-line flex flex-none items-center gap-3 border-b-2 bg-ink px-4 py-2">
        <Link
          to="/"
          className="font-arcade text-neon-cyan text-[10px] leading-relaxed no-underline hover:text-fg"
        >
          &lt; Arch Dojo
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <Component />
      </div>
    </div>
  );
}
