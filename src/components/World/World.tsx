import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import type { Human } from "../../types/human";
import "./world.css";

type Props = { humans: Human[]; selectedId: number | null; onSelect: (human: Human) => void };

const W = 900;
const H = 520;

const SKIN_TONES = ["#F6C7A5", "#E9AD83", "#C9855D", "#8F5B43", "#F1D1B0"];
const HAIR_COLORS = ["#49352F", "#6A4937", "#2F2928", "#B77A43", "#D8B46D", "#8B5C48"];

function project(x: number, y: number) {
  return { x: W / 2 + (x - y) * 390, y: 30 + (x + y) * 195 };
}

function seeded(id: number, salt: number, length: number) {
  return Math.abs(Math.sin(id * 127.1 + salt * 311.7) * 43758.5453) % 1 * length;
}

function drawHuman(
  ctx: CanvasRenderingContext2D,
  human: Human,
  time: number,
  selected: boolean,
) {
  const p = project(human.x, human.y);
  const child = human.age < 13;
  const elder = human.age > 60;
  const scale = child ? 0.68 : elder ? 0.96 : 1;
  const phase = time * (human.speed * 9 + 1.4) + human.id * 2.1;
  const walking = Math.hypot(human.targetX - human.x, human.targetY - human.y) > 0.025;
  const stride = walking ? Math.sin(phase) : Math.sin(time * 2 + human.id) * 0.08;
  const bob = walking ? Math.abs(Math.cos(phase)) * 1.8 : Math.sin(time * 2.2 + human.id) * 0.9;
  const skin = SKIN_TONES[Math.floor(seeded(human.id, 1, SKIN_TONES.length))];
  const hair = elder ? "#C9C9C2" : HAIR_COLORS[Math.floor(seeded(human.id, 2, HAIR_COLORS.length))];
  const outfit = human.color;
  const hairStyle = Math.floor(seeded(human.id, 3, 4));
  const direction = human.direction || 0;
  const facing = Math.cos(direction) >= 0 ? 1 : -1;

  ctx.save();
  ctx.translate(p.x, p.y - bob);
  ctx.scale(scale, scale);

  // Selection ring.
  if (selected) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 5, 15, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ground shadow.
  ctx.fillStyle = "rgba(49, 75, 54, .18)";
  ctx.beginPath();
  ctx.ellipse(0, 5, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs with a tiny walking cycle.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#51464A";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-3, -3);
  ctx.lineTo(-4 + stride * 3.5, 5);
  ctx.moveTo(3, -3);
  ctx.lineTo(4 - stride * 3.5, 5);
  ctx.stroke();

  // Shoes.
  ctx.fillStyle = "#F7F1E7";
  ctx.beginPath();
  ctx.ellipse(-4 + stride * 3.5, 5.5, 3.3, 1.8, -0.1, 0, Math.PI * 2);
  ctx.ellipse(4 - stride * 3.5, 5.5, 3.3, 1.8, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Arms swing opposite to legs.
  ctx.strokeStyle = skin;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(-8 - stride * 2.5, -3);
  ctx.moveTo(6, -10);
  ctx.lineTo(8 + stride * 2.5, -3);
  ctx.stroke();

  // Body.
  ctx.fillStyle = outfit;
  ctx.beginPath();
  ctx.roundRect(-7, -17, 14, 16, 5);
  ctx.fill();

  // Small collar detail.
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.moveTo(-3, -16);
  ctx.lineTo(0, -12);
  ctx.lineTo(3, -16);
  ctx.closePath();
  ctx.fill();

  // Head.
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -23, 7.2, 0, Math.PI * 2);
  ctx.fill();

  // Ears.
  ctx.beginPath();
  ctx.arc(-7, -23, 2, 0, Math.PI * 2);
  ctx.arc(7, -23, 2, 0, Math.PI * 2);
  ctx.fill();

  // Hair styles.
  ctx.fillStyle = hair;
  if (hairStyle === 0) {
    ctx.beginPath();
    ctx.arc(0, -26, 7.5, Math.PI, Math.PI * 2);
    ctx.lineTo(7, -23);
    ctx.quadraticCurveTo(3, -25, 0, -23);
    ctx.quadraticCurveTo(-4, -21, -7, -24);
    ctx.closePath();
    ctx.fill();
  } else if (hairStyle === 1) {
    ctx.beginPath();
    ctx.arc(0, -27, 7.8, Math.PI, Math.PI * 2);
    ctx.lineTo(8, -21);
    ctx.quadraticCurveTo(5, -17, 4, -20);
    ctx.lineTo(-5, -20);
    ctx.quadraticCurveTo(-8, -18, -8, -23);
    ctx.closePath();
    ctx.fill();
  } else if (hairStyle === 2) {
    ctx.beginPath();
    ctx.arc(0, -27, 8, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5, -29, 3, 0, Math.PI * 2);
    ctx.arc(0, -31, 3.5, 0, Math.PI * 2);
    ctx.arc(5, -29, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -26, 7.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-6, -21, 2.2, 5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6, -21, 2.2, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face: eyes and a tiny smile.
  ctx.fillStyle = "#463B39";
  const eyeX = facing > 0 ? 2 : -2;
  ctx.beginPath();
  ctx.arc(eyeX, -23, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#A86659";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(facing > 0 ? 1 : -1, -20.5, 1.5, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // A little hair accessory on some characters.
  if (human.id % 7 === 0) {
    ctx.fillStyle = "#F5C65E";
    ctx.beginPath();
    ctx.arc(-5, -29, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small mood marker makes the emotional state readable at a glance.
  const emotionIcons: Record<Human["emotion"], string> = {
    happy: "☺", sad: "☹", lonely: "…", in_love: "♥", stressed: "!", calm: "·",
  };
  const emotionColors: Record<Human["emotion"], string> = {
    happy: "#E9A83B", sad: "#6F9CCB", lonely: "#87948D", in_love: "#E4779A", stressed: "#D98255", calm: "#7EAA85",
  };
  if (human.emotion !== "calm") {
    ctx.save();
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = emotionColors[human.emotion];
    ctx.fillText(emotionIcons[human.emotion], 0, -48 - Math.sin(time * 2.5 + human.id) * 1.5);
    ctx.restore();
  }

  // Tiny floating heart for couples; a warm pink heart for an expecting parent.
  if (human.partnerId !== null || human.pregnancyTimer !== null) {
    const heartY = -43 - Math.sin(time * 3 + human.id) * 2;
    ctx.save();
    ctx.translate(0, heartY);
    ctx.scale(0.72, 0.72);
    ctx.fillStyle = human.pregnancyTimer !== null ? "#F08AA8" : "#E98BA4";
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-13, -4, -8, -13, 0, -7);
    ctx.bezierCurveTo(8, -13, 13, -4, 0, 4);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, humans: Human[], time: number, selectedId: number | null) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#DFF0E4";
  ctx.fillRect(0, 0, W, H);

  // Isometric grass tiles.
  const sizeX = 52;
  const sizeY = 26;
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      const x = W / 2 + (col - row) * sizeX;
      const y = 30 + (col + row) * sizeY / 2;
      if (y > H - 10) continue;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + sizeX, y + sizeY / 2);
      ctx.lineTo(x, y + sizeY);
      ctx.lineTo(x - sizeX, y + sizeY / 2);
      ctx.closePath();
      ctx.fillStyle = (row + col) % 2 ? "#A9D99A" : "#B7E2A5";
      ctx.fill();
      ctx.strokeStyle = "rgba(77,132,82,.12)";
      ctx.stroke();
    }
  }

  // A soft pond with ripples.
  ctx.fillStyle = "rgba(70,145,155,.12)";
  ctx.beginPath();
  ctx.ellipse(690, 333, 100, 40, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8BCBD4";
  ctx.beginPath();
  ctx.ellipse(690, 326, 94, 37, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#70B7C2";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ripple = (time * 8 + i * 24) % 65;
    ctx.beginPath();
    ctx.ellipse(680, 325, 12 + ripple * 0.45, 4 + ripple * 0.15, -0.25, 0.2, 2.4);
    ctx.stroke();
  }

  // Decorative trees.
  const trees = [[180,170],[300,90],[730,140],[120,340],[540,420],[810,390],[420,300]];
  trees.forEach(([x, y], i) => {
    ctx.fillStyle = "rgba(54,92,55,.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8D684D";
    ctx.fillRect(x - 5, y - 3, 10, 30);
    ctx.fillStyle = i % 2 ? "#4F9B69" : "#63AD70";
    ctx.beginPath(); ctx.arc(x, y - 14, 23, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 13, y - 4, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, y - 4, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.beginPath(); ctx.arc(x - 7, y - 22, 5, 0, Math.PI * 2); ctx.fill();
  });

  // Sort by projected depth so people overlap naturally.
  [...humans]
    .filter((human) => human.alive)
    .sort((a, b) => a.x + a.y - (b.x + b.y))
    .forEach((human) => drawHuman(ctx, human, time, human.id === selectedId));
}

export default function World({ humans, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humansRef = useRef(humans);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    humansRef.current = humans;
    selectedIdRef.current = selectedId;
  }, [humans, selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationId = 0;
    const start = performance.now();

    const render = (now: number) => {
      drawWorld(ctx, humansRef.current, (now - start) / 1000, selectedIdRef.current);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (W / rect.width);
    const y = (event.clientY - rect.top) * (H / rect.height);
    const candidates = humansRef.current.filter((human) => human.alive).sort((a, b) => b.x + b.y - (a.x + a.y));
    const found = candidates.find((human) => {
      const point = project(human.x, human.y);
      const childScale = human.age < 13 ? 0.68 : 1;
      return Math.hypot(x - point.x, y - (point.y - 18)) < 19 * childScale;
    });
    if (found) onSelect(found);
  };

  return (
    <div className="world-frame">
      <div className="world-label"><span className="live-dot" /> ЖИВОЙ МИР <span>•</span> ИЗОМЕТРИЯ</div>
      <canvas ref={canvasRef} width={W} height={H} aria-label="Изометрическая карта мира" onClick={handleCanvasClick} />
      <div className="world-caption">Маленький мир. Большая история.</div>
    </div>
  );
}
