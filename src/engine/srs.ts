import { DefaultScheduler, Rating } from 'ts-fsrs';

export { Rating };
export type Grade = typeof Rating.Again | typeof Rating.Hard | typeof Rating.Good | typeof Rating.Easy;

/** Du résultat d'une carte à la note FSRS. Une carte FSRS = une compétence (D-009). */
export function gradeFrom(credit: number, hints: number, fast = false): Grade {
  if (credit < .5) return Rating.Again;
  if (credit < 1 || hints > 0) return Rating.Hard;
  return fast ? Rating.Easy : Rating.Good;
}

/** Planificateur FSRS (rétention cible réglable, 90 % par défaut). */
export async function createSrs(retention = 0.9) {
  const scheduler = await DefaultScheduler({ desiredRetention: retention, enableFuzz: false });
  return {
    newCard: (now: Date) => scheduler.newCard({ now }),
    review: (card: ReturnType<typeof scheduler.newCard>, grade: Grade, now: Date) => scheduler.review({ card, grade, now }),
    scheduler,
  };
}
