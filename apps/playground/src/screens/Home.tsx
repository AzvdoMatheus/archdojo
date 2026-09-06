import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui";
import { Link } from "react-router-dom";
import { challenges } from "../challenges/registry";
import { mockChallenges } from "../mock/challenges";
import { usePlayer } from "../mock/player";
import { getChallengeThumbnail } from "../mock/thumbnail";

function ComingSoon({ description }: { description: string }) {
  return (
    <div className="border-line-2 bg-panel flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border-2 p-12 text-center">
      <span className="font-arcade text-neon-gold text-sm [text-shadow:0_0_6px_rgba(255,210,63,0.6)]">
        Em breve
      </span>
      <p className="text-muted-foreground max-w-md text-lg">{description}</p>
    </div>
  );
}

const DIFFICULTY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  Fácil: "outline",
  Médio: "secondary",
  Difícil: "default",
};

const displayChallenges = [
  ...challenges.map((challenge) => ({ ...challenge, status: "real" as const })),
  ...mockChallenges,
];

function PlayerHeader() {
  const player = usePlayer();
  const completedCount = player.completedChallengeSlugs.length;

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <Card className="border-line-2 shadow-[0_0_16px_rgba(124,58,237,0.25)] flex-row items-center gap-4 border-2 px-5 py-4">
        <img
          src={player.avatarUrl}
          alt={player.name}
          className="border-neon-cyan h-16 w-16 rounded border-2 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
        />
        <div className="flex flex-col gap-1.5 text-left">
          <span className="font-arcade text-fg text-sm">{player.name}</span>
          <Badge className="border-neon-gold text-neon-gold w-fit border bg-transparent">
            Nível {player.level} - {player.xp} XP
          </Badge>
          <span className="text-muted-foreground text-lg">
            {completedCount}/{displayChallenges.length} desafios concluídos
          </span>
        </div>
      </Card>
    </div>
  );
}

export function Home() {
  return (
    <div className="bg-[radial-gradient(circle_at_20%_-10%,#1c0f2e_0%,var(--color-ink-2)_55%)] min-h-screen p-6">
      <header className="mb-6">
        <h1 className="font-arcade text-neon-magenta text-lg leading-relaxed [text-shadow:0_0_6px_#ff2ea6,0_0_18px_rgba(255,46,166,0.6)]">
          Arch Dojo
        </h1>
      </header>
      <Tabs defaultValue="desafios">
        <TabsList className="font-arcade mb-6 h-auto gap-1 bg-transparent p-0 text-[10px]">
          <TabsTrigger
            value="desafios"
            className="border-line-2 data-[state=active]:border-neon-cyan data-[state=active]:text-fg data-[state=active]:shadow-[0_0_10px_rgba(0,229,255,0.35)] rounded border-2 bg-panel px-4 py-2.5 text-muted-foreground data-[state=active]:bg-panel"
          >
            Desafios
          </TabsTrigger>
          <TabsTrigger
            value="canvas-livre"
            className="border-line-2 data-[state=active]:border-neon-cyan data-[state=active]:text-fg data-[state=active]:shadow-[0_0_10px_rgba(0,229,255,0.35)] rounded border-2 bg-panel px-4 py-2.5 text-muted-foreground data-[state=active]:bg-panel"
          >
            Canvas Livre
          </TabsTrigger>
          <TabsTrigger
            value="explorar"
            className="border-line-2 data-[state=active]:border-neon-cyan data-[state=active]:text-fg data-[state=active]:shadow-[0_0_10px_rgba(0,229,255,0.35)] rounded border-2 bg-panel px-4 py-2.5 text-muted-foreground data-[state=active]:bg-panel"
          >
            Explorar Arquiteturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desafios">
          <PlayerHeader />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {displayChallenges.map((challenge) => {
              const cardBody = (
                <Card
                  className={`border-line-2 h-full overflow-hidden border-2 py-0 transition-colors ${
                    challenge.status === "mock"
                      ? "opacity-60"
                      : "hover:border-neon-cyan cursor-pointer"
                  }`}
                >
                  <img
                    src={getChallengeThumbnail(challenge.slug)}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                  <CardHeader className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-arcade text-neon-gold text-xs">
                        {challenge.title}
                      </CardTitle>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={DIFFICULTY_VARIANT[challenge.difficulty] ?? "outline"}>
                          {challenge.difficulty}
                        </Badge>
                        {challenge.status === "mock" && (
                          <Badge
                            variant="outline"
                            className="border-neon-gold text-neon-gold text-[8px]"
                          >
                            Em breve
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-lg">
                    {challenge.summary}
                  </CardContent>
                </Card>
              );

              if (challenge.status === "mock") {
                return (
                  <div key={challenge.slug} className="cursor-not-allowed">
                    {cardBody}
                  </div>
                );
              }

              return (
                <Link
                  key={challenge.slug}
                  to={`/challenges/${challenge.slug}`}
                  className="no-underline"
                >
                  {cardBody}
                </Link>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="canvas-livre">
          <ComingSoon description="Um canvas livre para desenhar qualquer arquitetura, sem um desafio guiado - previsto para uma próxima fase." />
        </TabsContent>

        <TabsContent value="explorar">
          <ComingSoon description="Explore arquiteturas de referência de sistemas reais para se inspirar - previsto para uma próxima fase." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
