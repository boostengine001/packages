import * as React from 'react';
import { DataTable, KPIWidget, StatsCard, AreaChart, BarChart, DonutChart, Sparkline } from '../src/index';

const chartData = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 180 },
  { label: 'Wed', value: 140 },
  { label: 'Thu', value: 220 },
  { label: 'Fri', value: 260 },
];

export const KPIs = () => (
  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
    <KPIWidget title="Revenue" value="$42,000" change={12.5} />
    <KPIWidget title="Orders" value="1,284" change={-4.2} />
    <StatsCard title="Active Users" value={8240} trend={{ value: 8.1, isPositive: true }} />
  </div>
);

export const Tables = () => (
  <DataTable
    columns={[
      { header: 'Product', key: 'name' },
      { header: 'Qty', key: 'qty' },
      { header: 'Revenue', key: 'revenue' },
    ]}
    data={[
      { name: 'Widget', qty: 3, revenue: '$450' },
      { name: 'Gadget', qty: 7, revenue: '$980' },
      { name: 'Doohickey', qty: 1, revenue: '$75' },
    ]}
    searchable
    selectable
  />
);

export const Charts = () => (
  <div style={{ display: 'grid', gap: '28px', maxWidth: '720px' }}>
    <AreaChart data={chartData} title="Weekly sessions" />
    <BarChart data={chartData} title="Weekly orders" />
    <DonutChart data={chartData} showLegend />
    <Sparkline data={[4, 8, 6, 12, 10, 14, 13]} />
  </div>
);
