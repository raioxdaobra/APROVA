/**
 * Hero da entrada: saudação dinâmica + frase motivacional rotativa.
 * Server component (decisão da frase determinística por dia).
 */
import { firstName, getGreeting, getQuoteForUser } from '@/lib/motivational/quotes';

interface Props {
  userId: string;
  displayName: string | null;
  streakDays: number;
  hadHigherStreak: boolean;
  questionsToday: number;
}

const TZ = 'America/Fortaleza';

function fortalezaIsoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function HeroGreeting({
  userId,
  displayName,
  streakDays,
  hadHigherStreak,
  questionsToday,
}: Props) {
  const greeting = getGreeting();
  const name = firstName(displayName);
  const quote = getQuoteForUser({
    userId,
    isoDate: fortalezaIsoDate(),
    streakDays,
    hadHigherStreak,
    questionsToday,
  });

  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {greeting}
        {name ? `, ${name}` : ''}.
      </h1>
      <p className="text-base italic text-muted-foreground">&ldquo;{quote}&rdquo;</p>
    </header>
  );
}
