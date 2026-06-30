import { SimpleLogsStat, type SimpleLogStatProps } from '@/components/simple-logs-stat';
import { TrafficLogsChart } from '@/components/traffic-logs-chart';
import { UsageLogsMeter } from '@/components/usage-logs-meter';
import { LiveLogsFeed } from '@/components/live-logs-feed';
import { SimpleLogsTable } from '@/components/simple-logs-table';

const STATS: SimpleLogStatProps[] = [
  { title: 'Total requests · 24h', value: '1.24M', changeValue: '+12%', direction: 'up' },
  { title: 'Errors · 24h', value: 318, changeValue: '-4%', direction: 'down' },
  { title: 'Avg latency · p95', value: '118ms', changeValue: '-6%', direction: 'down' },
  { title: 'Uptime · 30d', value: '99.98%', changeValue: '0%', direction: 'neutral' },
];

export function Logs() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <SimpleLogsStat key={s.title} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrafficLogsChart />
        </div>
        <UsageLogsMeter />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LiveLogsFeed />
        <div className="lg:col-span-2">
          <SimpleLogsTable />
        </div>
      </div>
    </div>
  );
}
