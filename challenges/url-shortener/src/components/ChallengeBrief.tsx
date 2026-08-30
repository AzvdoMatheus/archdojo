import { urlShortenerChallenge } from "../challenge";

export function ChallengeBrief() {
  return (
    <details className="border-line-2 bg-panel flex-none rounded-lg border-2" open>
      <summary className="font-arcade text-neon-gold cursor-pointer px-4 py-3 text-xs [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
        Desafio: {urlShortenerChallenge.title}
      </summary>
      <div className="max-h-[30vh] overflow-y-auto px-4 pb-4">
        <p>{urlShortenerChallenge.context}</p>
        <h3 className="font-arcade text-neon-cyan mt-4 mb-2 text-xs">Requisitos funcionais</h3>
        <ul className="list-disc space-y-1 pl-5">
          {urlShortenerChallenge.functionalRequirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
        <h3 className="font-arcade text-neon-cyan mt-4 mb-2 text-xs">Requisitos não funcionais</h3>
        <table className="w-full border-collapse">
          <tbody>
            {urlShortenerChallenge.nonFunctionalRequirements.map((req) => (
              <tr key={req.label}>
                <th className="text-muted w-56 py-1 pr-3 text-left align-top font-normal whitespace-nowrap">
                  {req.label}
                </th>
                <td className="py-1">
                  {req.value}
                  <div className="text-muted text-base">{req.note}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
