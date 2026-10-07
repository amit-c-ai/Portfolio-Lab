import { PriceObservation, Stock } from '../types';

export const DEFAULT_STOCKS: Stock[] = [
  { id: 'stock-1', name: 'Reliance Industries', ticker: 'RELIANCE', weight: 40 },
  { id: 'stock-2', name: 'Tata Consultancy Services', ticker: 'TCS', weight: 30 },
  { id: 'stock-3', name: 'HDFC Bank', ticker: 'HDFCBANK', weight: 30 },
];

/**
 * Realistic monthly stock price sample data (12 periods)
 * Note: Illustrative sample data — not real-time market data.
 */
export const SAMPLE_PRICE_OBSERVATIONS: PriceObservation[] = [
  { date: 'Jan 2026', prices: { 'stock-1': 1420, 'stock-2': 3850, 'stock-3': 1620 } },
  { date: 'Feb 2026', prices: { 'stock-1': 1465, 'stock-2': 3910, 'stock-3': 1680 } },
  { date: 'Mar 2026', prices: { 'stock-1': 1430, 'stock-2': 3820, 'stock-3': 1640 } },
  { date: 'Apr 2026', prices: { 'stock-1': 1490, 'stock-2': 3950, 'stock-3': 1710 } },
  { date: 'May 2026', prices: { 'stock-1': 1520, 'stock-2': 3890, 'stock-3': 1740 } },
  { date: 'Jun 2026', prices: { 'stock-1': 1500, 'stock-2': 4020, 'stock-3': 1720 } },
  { date: 'Jul 2026', prices: { 'stock-1': 1555, 'stock-2': 4100, 'stock-3': 1790 } },
  { date: 'Aug 2026', prices: { 'stock-1': 1540, 'stock-2': 4050, 'stock-3': 1765 } },
  { date: 'Sep 2026', prices: { 'stock-1': 1590, 'stock-2': 4180, 'stock-3': 1830 } },
  { date: 'Oct 2026', prices: { 'stock-1': 1630, 'stock-2': 4120, 'stock-3': 1870 } },
  { date: 'Nov 2026', prices: { 'stock-1': 1610, 'stock-2': 4250, 'stock-3': 1840 } },
  { date: 'Dec 2026', prices: { 'stock-1': 1675, 'stock-2': 4310, 'stock-3': 1910 } },
];
