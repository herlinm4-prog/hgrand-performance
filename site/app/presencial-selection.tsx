export type PresencialSelection = {
  sessionsPerWeek: number;
  sessionCount: number;
  trainingCents: number;
  supportCents: number;
  totalCents: number;
};

export default function PresencialSelectionSummary({selection}:{selection:PresencialSelection}) {
  return <div className="selection-price">
    <strong>{selection.sessionsPerWeek} {selection.sessionsPerWeek===1?'día':'días'} por semana · {selection.sessionCount} sesiones de una hora</strong>
    <p>Entrenamiento: US${(selection.trainingCents/100).toFixed(2)}</p>
    <p>Nutrición y suplementación: {selection.supportCents?`US$${(selection.supportCents/100).toFixed(2)}`:'incluida'}</p>
    <p><strong>Total estimado · 4 semanas: US${(selection.totalCents/100).toFixed(2)}</strong></p>
    <small>La promoción y el importe final se confirman antes del pago.</small>
  </div>;
}
