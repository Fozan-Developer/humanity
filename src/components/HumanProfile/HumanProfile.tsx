import type { Human } from "../../types/human";
import "./human-profile.css";

type Props = {
  human: Human;
  humans: Human[];
  onSelect: (human: Human) => void;
  onClose: () => void;
};

const getAgeLabel = (age: number) => {
  if (age < 1) return "Младенец";
  if (age < 13) return "Ребёнок";
  if (age < 18) return "Подросток";
  if (age < 60) return "Взрослый";
  return "Пожилой";
};

const getAge = (age: number) => `${Math.floor(age)} ${Math.floor(age) === 1 ? "год" : "лет"}`;

const EMOTIONS = {
  happy: { label: "Счастье", icon: "☺", description: "Радуется общению и хорошим событиям" },
  sad: { label: "Грусть", icon: "☹", description: "Переживает потерю близкого человека" },
  lonely: { label: "Одиночество", icon: "…", description: "Не хватает общения и близости" },
  in_love: { label: "Влюблённость", icon: "♥", description: "Чувствует особенную связь с партнёром" },
  stressed: { label: "Стресс", icon: "!", description: "Нуждается в отдыхе и спокойствии" },
  calm: { label: "Спокойствие", icon: "·", description: "Чувствует себя спокойно" },
} as const;

const PERSONALITY_INFO: Record<Human["personality"], { label: string; icon: string; description: string }> = {
  friendly: { label: "Дружелюбный", icon: "☀", description: "Легко знакомится и любит проводить время с другими." },
  shy: { label: "Застенчивый", icon: "🌱", description: "Осторожно сближается с другими и чаще выбирает спокойные прогулки." },
  energetic: { label: "Энергичный", icon: "⚡", description: "Быстро перемещается и чаще зовёт семью на прогулку." },
  romantic: { label: "Романтичный", icon: "♡", description: "Сильнее стремится к отношениям и созданию семьи." },
  curious: { label: "Любознательный", icon: "✦", description: "Любит исследовать новые места и менять маршрут прогулки." },
  calm: { label: "Спокойный", icon: "☁", description: "Предпочитает размеренный ритм и неторопливые прогулки." },
};

export default function HumanProfile({ human, humans, onSelect, onClose }: Props) {
  const byId = new Map(humans.map((person) => [person.id, person]));
  const parents = human.parentIds.map((id) => byId.get(id)).filter((person): person is Human => Boolean(person));
  const children = human.childrenIds.map((id) => byId.get(id)).filter((person): person is Human => Boolean(person));
  const partner = human.partnerId === null ? undefined : byId.get(human.partnerId);
  const relatives = [...parents, ...(partner ? [partner] : []), ...children];

  return (
    <div className="profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="profile-close" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="profile-kicker">ЛИЧНОЕ ДЕЛО ЖИТЕЛЯ · №{human.id}</div>
        <div className="profile-heading">
          <div className="profile-avatar" style={{ background: human.color }}>{human.gender === "female" ? "♀" : "♂"}</div>
          <div><h2 id="profile-title">Житель #{human.id}</h2><span className={human.alive ? "life-status alive" : "life-status dead"}>{human.alive ? "● Жив" : "† Умер"}</span></div>
        </div>
        <div className="personality-card">
          <div className="personality-icon">{PERSONALITY_INFO[human.personality].icon}</div>
          <div><span>Характер</span><strong>{PERSONALITY_INFO[human.personality].label}</strong><p>{PERSONALITY_INFO[human.personality].description}</p></div>
        </div>
        <div className="emotion-card">
          <span className={`emotion-icon emotion-${human.emotion}`}>{EMOTIONS[human.emotion].icon}</span>
          <div><small>Текущее настроение</small><strong>{EMOTIONS[human.emotion].label}</strong><p>{EMOTIONS[human.emotion].description}</p></div>
        </div>
        <div className="profile-facts">
          <div><span>Возраст</span><strong>{getAge(human.age)}</strong></div>
          <div><span>Этап жизни</span><strong>{getAgeLabel(human.age)}</strong></div>
          <div><span>Поколение</span><strong>№{human.generation}</strong></div>
          <div><span>Дети</span><strong>{human.childrenIds.length}</strong></div>
        </div>
        {human.pregnancyTimer !== null && <div className="pregnancy-note">♡ Скоро в семье появится малыш</div>}
        <div className="family-tree">
          <div className="family-title"><h3>Семейное древо</h3><span>{relatives.length} связей</span></div>
          <div className="tree-current"><span className="tree-node-dot"/><strong>Житель #{human.id}</strong><small>Поколение {human.generation}</small></div>
          {parents.length > 0 && <FamilyGroup title="Родители" people={parents} onSelect={onSelect} />}
          {partner && <FamilyGroup title="Партнёр" people={[partner]} onSelect={onSelect} />}
          {children.length > 0 && <FamilyGroup title="Дети" people={children} onSelect={onSelect} />}
          {relatives.length === 0 && <p className="tree-empty">Семейная история этого жителя только начинается.</p>}
        </div>
      </section>
    </div>
  );
}

function FamilyGroup({ title, people, onSelect }: { title: string; people: Human[]; onSelect: (human: Human) => void }) {
  return <div className="family-group"><div className="family-group-label">{title}</div><div className="family-people">{people.map((person) => <button className="family-person" key={person.id} onClick={() => onSelect(person)}><span className="family-person-avatar" style={{ background: person.color }}>{person.gender === "female" ? "♀" : "♂"}</span><span><strong>Житель #{person.id}</strong><small>{Math.floor(person.age)} лет · поколение {person.generation}{!person.alive ? " · умер" : ""}</small></span><span className="family-arrow">›</span></button>)}</div></div>;
}
