export type Gender = "male" | "female";
export type Emotion = "happy" | "sad" | "lonely" | "in_love" | "stressed" | "calm";

export type Human = {
  id: number;
  x: number;
  y: number;
  age: number;
  gender: Gender;
  speed: number;
  direction: number;
  targetX: number;
  targetY: number;
  color: string;
  alive: boolean;
  cooldown: number;
  partnerId: number | null;
  relationshipProgress: number;
  pregnancyTimer: number | null;
  parentIds: number[];
  childrenIds: number[];
  generation: number;
  emotion: Emotion;
  emotionTimer: number;
};

export type SimulationStats = {
  population: number;
  births: number;
  deaths: number;
  couples: number;
  day: number;
  generation: number;
};
