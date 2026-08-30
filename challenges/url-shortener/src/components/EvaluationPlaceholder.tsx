import { Card, CardContent } from "@packages/ui";
import { PixelIcon } from "./PixelIcon";

export function EvaluationPlaceholder() {
  return (
    <Card className="border-line-2 bg-panel gap-0 rounded-lg border-2 border-dashed py-4 opacity-85">
      <CardContent className="flex gap-3">
        <PixelIcon name="circle-question" size="lg" className="text-neon-purple flex-none" />
        <div>
          <p className="font-arcade text-neon-gold mb-2 text-xs [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
            Avaliação em breve
          </p>
          <p className="text-muted-foreground text-base leading-snug">
            Em uma próxima versão, uma IA vai analisar seu desenho e dar feedback sobre a
            arquitetura. Por enquanto, use os stats da simulação para julgar sua própria solução.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
