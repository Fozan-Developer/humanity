import type { SimulationStats } from "../../types/human";
import "./statistics.css";

type Props = { stats: SimulationStats };

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return <div className="metric-card">
    <div className={`metric-icon ${tone}`}>{icon}</div>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
  </div>;
}

export default function Statistics({ stats }: Props) {
  return <section className="stats-grid">
    <Metric label="Население" value={stats.population.toLocaleString("ru-RU")} icon="☺" tone="mint"/>
    <Metric label="Пары" value={stats.couples.toLocaleString("ru-RU")} icon="♡" tone="lavender"/>
    <Metric label="Рождения" value={stats.births.toLocaleString("ru-RU")} icon="✿" tone="peach"/>
    <Metric label="Поколение" value={String(stats.generation)} icon="⌁" tone="yellow"/>
  </section>;
}
