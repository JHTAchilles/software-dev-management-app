interface DashboardStatProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Small stat card used on the dashboard header.
 */
export function DashboardStat({ title, children }: DashboardStatProps) {
  return (
    <div className="bg-card/60 dark:bg-card-dark/60 rounded-xl p-4 backdrop-blur">
      <div className="text-text-secondary text-sm font-medium">{title}</div>
      <div className="text-text-primary mt-2 truncate text-xl font-bold">
        {children}
      </div>
    </div>
  );
}
