type Props = { running: boolean; speed: number; onToggle: () => void; onSpeedChange: (speed: number) => void; onReset: () => void };

export default function Controls({ running, speed, onToggle, onSpeedChange, onReset }: Props) {
  return <div className="controls">
    <div className="control-left">
      <button className="primary-button" onClick={onToggle}>{running ? "Ⅱ Пауза" : "▶ Продолжить"}</button>
      <button className="secondary-button" onClick={onReset}>↻ Новый мир</button>
    </div>
    <div className="speed-control">
      <span>Скорость</span>
      {[1, 2, 4].map((value) => <button key={value} className={speed === value ? "speed-button active" : "speed-button"} onClick={() => onSpeedChange(value)}>{value}×</button>)}
    </div>
  </div>;
}
