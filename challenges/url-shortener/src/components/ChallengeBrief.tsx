import { urlShortenerChallenge } from "../challenge";

export function ChallengeBrief() {
  return (
    <details className="dojo-brief" open>
      <summary className="dojo-brief__summary">Desafio: {urlShortenerChallenge.title}</summary>
      <div className="dojo-brief__body">
        <p>{urlShortenerChallenge.context}</p>
        <h3>Requisitos funcionais</h3>
        <ul>
          {urlShortenerChallenge.functionalRequirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
        <h3>Requisitos não funcionais</h3>
        <table className="dojo-brief__table">
          <tbody>
            {urlShortenerChallenge.nonFunctionalRequirements.map((req) => (
              <tr key={req.label}>
                <th>{req.label}</th>
                <td>
                  {req.value}
                  <div className="dojo-brief__note">{req.note}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
