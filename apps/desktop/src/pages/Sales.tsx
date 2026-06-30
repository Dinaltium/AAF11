import { RichSalesStat, type RichSalesStatProps } from '@/components/rich-sales-stat';
import { InteractiveSalesChart } from '@/components/interactive-sales-chart';
import { ProductSalesTable } from '@/components/product-sales-table';
import { ChannelSalesChart } from '@/components/channel-sales-chart';
import { SourceSalesMeter } from '@/components/source-sales-meter';

/** Dummy, ops-flavoured (backend disconnected until real metrics are designed). */
const STATS: RichSalesStatProps[] = [
  { title: 'Active projects', value: 12, trendValue: 8.3, footerLabel: 'Up this month', footerSubtext: 'vs 11 last month' },
  { title: 'Requests · 30d', value: '1.24M', trendValue: 12.5, footerLabel: 'Strong volume', footerSubtext: 'across all connectors' },
  { title: 'Avg latency · p95', value: '118ms', trendValue: -4.1, footerLabel: 'Improved', footerSubtext: 'down from 123ms' },
  { title: 'Open incidents', value: 2, trendValue: 0, footerLabel: 'Holding steady', footerSubtext: '2 acknowledged' },
];

export function Sales() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <RichSalesStat key={s.title} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InteractiveSalesChart />
        </div>
        <ProductSalesTable />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChannelSalesChart />
        <div className="lg:col-span-2">
          <SourceSalesMeter />
        </div>
      </div>
    </div>
  );
}
