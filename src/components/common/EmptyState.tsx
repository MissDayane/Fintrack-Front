import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 style={{ fontSize: '1.08rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, fontSize: '0.9rem' }}>
        {description}
      </p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
