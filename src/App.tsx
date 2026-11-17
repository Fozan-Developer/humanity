import { useEffect, useRef, useState } from "react";
import World from "./components/World/World";
import Statistics from "./components/Statistics/Statistics";
import Controls from "./components/Controls/Controls";
import HumanProfile from "./components/HumanProfile/HumanProfile";
import { createInitialWorld, tickWorld } from "./engine/simulation";
import type { Human, SimulationStats } from "./types/human";
import "./App.css";

export default function App() {
  const initial = useRef(createInitialWorld());
  const [humans, setHumans] = useState<Human[]>(initial.current.humans);
  const [stats, setStats] = useState<SimulationStats>(initial.current.stats);
  const [nextId, setNextId] = useState(initial.current.nextId);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [worldVersion, setWorldVersion] = useState(0);
  const [selectedHumanId, setSelectedHumanId] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    let frame = 0;
    let currentHumans = humans;
    let currentStats = stats;
    let currentNextId = nextId;

    const animate = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, 0.08);
      previous = now;
      frame += elapsed;
      if (frame >= 0.12) {
        const result = tickWorld(currentHumans, currentStats, currentNextId, frame * speed);
        currentHumans = result.humans;
        currentStats = result.stats;
        currentNextId = result.nextId;
        setHumans(currentHumans);
        setStats(currentStats);
        setNextId(currentNextId);
        frame = 0;
      }
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  // The simulation loop is intentionally restarted when controls change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed, worldVersion]);

  const reset = () => {
    const world = createInitialWorld();
    setHumans(world.humans);
    setStats(world.stats);
    setNextId(world.nextId);
    setSelectedHumanId(null);
    setWorldVersion((value) => value + 1);
    setRunning(true);
  };

  const selectedHuman = humans.find((human) => human.id === selectedHumanId) ?? null;

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">h</span> HUMANITY</a>
      <div className="topbar-note"><span className="status-dot"/> СИМУЛЯЦИЯ ЖИЗНИ</div>
    </header>

    <section className="intro">
      <div>
        <div className="eyebrow">A TINY WORLD, A BIG STORY</div>
        <h1>История <span>человечества.</span></h1>
        <p>Наблюдай, как зарождается жизнь, появляются семьи и растёт целый мир.</p>
      </div>
      <div className="day-counter"><span>ДЕНЬ МИРА</span><strong>{Math.floor(stats.day).toLocaleString("ru-RU")}</strong></div>
    </section>

    <Statistics stats={stats}/>
    <section className="world-section">
      <div className="section-heading"><div><h2>Твой мир</h2><p>Жители знакомятся, создают пары и растят семьи</p></div><span className="population-pill">● {stats.population} жителей</span></div>
      <World humans={humans} selectedId={selectedHumanId} onSelect={(human) => setSelectedHumanId(human.id)}/>
    </section>
    {selectedHuman && <HumanProfile human={selectedHuman} humans={humans} onSelect={(human) => setSelectedHumanId(human.id)} onClose={() => setSelectedHumanId(null)}/>}
    <Controls running={running} speed={speed} onToggle={() => setRunning((value) => !value)} onSpeedChange={setSpeed} onReset={reset}/>
    <footer>HUMANITY <span>·</span> Каждый мир начинается с кого-то</footer>
  </main>;
}
