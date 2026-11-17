import type { Emotion, Human, SimulationStats } from "../types/human";

const COLORS = ["#F28B72", "#78A9E8", "#E8B85C", "#A78BDB", "#67B99A", "#E78DB5"];
const random = (min: number, max: number) => min + Math.random() * (max - min);

function changeEmotion(human: Human, emotion: Emotion, duration = random(7, 15)) {
  human.emotion = emotion;
  human.emotionTimer = duration;
}
const PERSONALITIES = ["friendly", "shy", "energetic", "romantic", "curious", "calm"] as const;

const movementFactor = (personality: Human["personality"]) => ({
  friendly: 1.0,
  shy: 0.82,
  energetic: 1.35,
  romantic: 0.95,
  curious: 1.18,
  calm: 0.72,
}[personality]);

export function createHuman(
  id: number,
  x: number,
  y: number,
  age = random(18, 45),
  parentIds: number[] = [],
  generation = 1,
): Human {
  return {
    id, x, y, age,
    gender: Math.random() > 0.5 ? "male" : "female",
    personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
    speed: random(0.018, 0.035),
    direction: random(0, Math.PI * 2),
    targetX: random(0.08, 0.92),
    targetY: random(0.08, 0.92),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alive: true,
    cooldown: random(2, 8),
    partnerId: null,
    relationshipProgress: 0,
    pregnancyTimer: null,
    parentIds,
    childrenIds: [],
    generation,
    emotion: "calm",
    emotionTimer: random(2, 6),
  };
}

export function createInitialWorld(): { humans: Human[]; stats: SimulationStats; nextId: number } {
  const humans = Array.from({ length: 24 }, (_, i) =>
    createHuman(i + 1, random(0.18, 0.82), random(0.18, 0.82)),
  );
  return {
    humans,
    stats: { population: humans.length, births: 0, deaths: 0, couples: 0, day: 1, generation: 1 },
    nextId: humans.length + 1,
  };
}

export function tickWorld(
  humans: Human[],
  stats: SimulationStats,
  nextId: number,
  delta: number,
) {
  const updated = humans.map((human) => ({
    ...human,
    parentIds: [...human.parentIds],
    childrenIds: [...human.childrenIds],
  }));
  const births: Human[] = [];
  let deaths = 0;

  const byId = new Map(updated.map((human) => [human.id, human]));

  // Age, move, and update existing relationships.
  for (const human of updated) {
    if (!human.alive) continue;

    human.emotionTimer = Math.max(0, human.emotionTimer - delta);
    human.age += delta * 0.12;
    human.cooldown = Math.max(0, human.cooldown - delta);

    if (human.age >= 78 + random(-8, 8)) {
      human.alive = false;
      deaths++;
      const partner = human.partnerId === null ? undefined : byId.get(human.partnerId);
      if (partner) {
        partner.partnerId = null;
        partner.relationshipProgress = 0;
        changeEmotion(partner, "sad", 22);
      }
      // Losing a close relative affects the remaining family members too.
      for (const relativeId of [...human.parentIds, ...human.childrenIds]) {
        const relative = byId.get(relativeId);
        if (relative?.alive) changeEmotion(relative, "sad", 16);
      }
      human.partnerId = null;
      continue;
    }

    if (human.partnerId !== null) {
      const partner = byId.get(human.partnerId);
      if (!partner || !partner.alive) {
        human.partnerId = null;
        human.relationshipProgress = 0;
      } else {
        human.relationshipProgress += delta;
        // Partners occasionally choose nearby destinations, so they tend to stay together.
        if (Math.random() < delta * 0.035) {
          const centerX = (human.x + partner.x) / 2;
          const centerY = (human.y + partner.y) / 2;
          const targetX = Math.max(0.06, Math.min(0.94, centerX + random(-0.07, 0.07)));
          const targetY = Math.max(0.06, Math.min(0.94, centerY + random(-0.07, 0.07)));
          human.targetX = targetX;
          human.targetY = targetY;
          partner.targetX = targetX;
          partner.targetY = targetY;
        }
      }
    }

    if (human.pregnancyTimer !== null) {
      human.pregnancyTimer -= delta;
      if (human.pregnancyTimer <= 0) {
        const child = createHuman(
          nextId + births.length,
          human.x + random(-0.012, 0.012),
          human.y + random(-0.012, 0.012),
          0,
          human.partnerId === null ? [human.id] : [human.id, human.partnerId],
          human.generation + 1,
        );
        births.push(child);
        human.childrenIds.push(child.id);
        const partner = human.partnerId === null ? undefined : byId.get(human.partnerId);
        if (partner) partner.childrenIds.push(child.id);
        human.pregnancyTimer = null;
        human.cooldown = 32;
        changeEmotion(human, "happy", 18);
        if (partner) {
          partner.cooldown = 32;
          changeEmotion(partner, "happy", 18);
        }
      }
    }

    const dx = human.targetX - human.x;
    const dy = human.targetY - human.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.025) {
      human.targetX = random(0.06, 0.94);
      human.targetY = random(0.06, 0.94);
    } else {
      const step = human.speed * movementFactor(human.personality) * delta;
      human.x += (dx / distance) * step;
      human.y += (dy / distance) * step;
      human.direction = Math.atan2(dy, dx);
    }

    human.x = Math.max(0.04, Math.min(0.96, human.x));
    human.y = Math.max(0.04, Math.min(0.96, human.y));

    if (human.emotionTimer <= 0) {
      const nearby = updated.filter((other) => other.id !== human.id && other.alive && Math.hypot(other.x - human.x, other.y - human.y) < 0.075);
      const partnerNearby = human.partnerId !== null && nearby.some((other) => other.id === human.partnerId);
      if (human.pregnancyTimer !== null && Math.random() < delta * 0.035) {
        changeEmotion(human, "stressed", random(5, 10));
      } else if (partnerNearby && Math.random() < delta * 0.12) {
        changeEmotion(human, "in_love", random(8, 16));
      } else if (nearby.length >= 2 && Math.random() < delta * 0.09) {
        changeEmotion(human, "happy", random(6, 13));
      } else if (human.age >= 18 && human.partnerId === null && nearby.length === 0 && Math.random() < delta * 0.08) {
        changeEmotion(human, "lonely", random(8, 16));
      } else if (Math.random() < delta * 0.035) {
        changeEmotion(human, "calm", random(5, 12));
      }
    }
  }

  // Families occasionally choose a shared destination and walk together.
  for (const parent of updated) {
    if (!parent.alive || parent.childrenIds.length === 0 || Math.random() >= delta * (parent.personality === "friendly" || parent.personality === "energetic" ? 0.032 : 0.012)) continue;
    const children = parent.childrenIds
      .map((id) => byId.get(id))
      .filter((child): child is Human => Boolean(child && child.alive && child.age < 18));
    if (children.length === 0) continue;
    const centerX = parent.x;
    const centerY = parent.y;
    const destinationX = Math.max(0.08, Math.min(0.92, centerX + random(-0.09, 0.09)));
    const destinationY = Math.max(0.08, Math.min(0.92, centerY + random(-0.09, 0.09)));
    parent.targetX = destinationX;
    parent.targetY = destinationY;
    children.forEach((child, index) => {
      const offset = (index - (children.length - 1) / 2) * 0.018;
      child.targetX = Math.max(0.05, Math.min(0.95, destinationX + offset));
      child.targetY = Math.max(0.05, Math.min(0.95, destinationY + Math.abs(offset) * 0.6));
    });
    if (parent.partnerId !== null) {
      const partner = byId.get(parent.partnerId);
      if (partner?.alive) { partner.targetX = destinationX; partner.targetY = destinationY; }
    }
  }

  // Single adults can meet and become a couple.
  const adults = updated.filter((human) =>
    human.alive &&
    human.age >= 18 &&
    human.age <= 55 &&
    human.partnerId === null &&
    human.cooldown <= 0,
  );

  for (const person of adults) {
    if (person.gender !== "female" || person.partnerId !== null) continue;
    const possiblePartner = adults.find((candidate) =>
      candidate.gender === "male" &&
      candidate.partnerId === null &&
      Math.hypot(person.x - candidate.x, person.y - candidate.y) < 0.055,
    );

    const socialFactor = person.personality === "shy" ? 0.45 : person.personality === "friendly" ? 1.45 : person.personality === "romantic" ? 1.3 : 1;
    if (possiblePartner && Math.random() < delta * 0.11 * socialFactor) {
      person.partnerId = possiblePartner.id;
      possiblePartner.partnerId = person.id;
      person.relationshipProgress = 0;
      possiblePartner.relationshipProgress = 0;
      person.cooldown = 4;
      possiblePartner.cooldown = 4;
      changeEmotion(person, "in_love", 18);
      changeEmotion(possiblePartner, "in_love", 18);
    }
  }

  // A couple may decide to have a child after spending time together.
  for (const person of updated) {
    if (!person.alive || person.gender !== "female" || person.partnerId === null) continue;
    if (person.pregnancyTimer !== null || person.age > 46 || person.age < 18) continue;
    const partner = byId.get(person.partnerId);
    if (!partner || !partner.alive || partner.age > 60) continue;

    if (person.relationshipProgress >= 12 && person.cooldown <= 0 && partner.cooldown <= 0) {
      const romanticFactor = person.personality === "romantic" ? 1.45 : person.personality === "shy" ? 0.7 : 1;
      if (Math.random() < delta * 0.055 * romanticFactor) {
        person.pregnancyTimer = 8;
      }
    }
  }

  const allHumans = [...updated, ...births];
  const living = allHumans.filter((human) => human.alive);
  const couples = living.filter((human) =>
    human.partnerId !== null && human.gender === "female",
  ).length;

  const nextStats: SimulationStats = {
    ...stats,
    population: living.length,
    births: stats.births + births.length,
    deaths: stats.deaths + deaths,
    couples,
    day: stats.day + delta * 0.08,
    generation: Math.max(stats.generation, ...allHumans.map((human) => human.generation)),
  };

  return { humans: allHumans, stats: nextStats, nextId: nextId + births.length };
}
