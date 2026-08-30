export function EvaluationPlaceholder() {
  return (
    <div className="dojo-eval-placeholder">
      <span className="dojo-eval-placeholder__icon">🔮</span>
      <div>
        <p className="dojo-eval-placeholder__title">Avaliação em breve</p>
        <p className="dojo-eval-placeholder__body">
          Em uma próxima versão, uma IA vai analisar seu desenho e dar feedback sobre a arquitetura.
          Por enquanto, use os stats da simulação para julgar sua própria solução.
        </p>
      </div>
    </div>
  );
}
