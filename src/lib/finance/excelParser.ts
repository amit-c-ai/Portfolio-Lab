import * as XLSX from 'xlsx';
import { PriceObservation, Stock } from '../types';

export interface ParsedExcelResult {
  stocks: Stock[];
  observations: PriceObservation[];
  warnings: string[];
}

/**
 * Robust date formatter for raw Excel date strings, numbers, or dates.
 */
export function formatExcelDate(val: any, rowIndex: number): string {
  if (val === null || val === undefined || val === '') {
    return `Period ${rowIndex + 1}`;
  }

  // If JavaScript Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return `Period ${rowIndex + 1}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[val.getMonth()]} ${val.getFullYear()}`;
  }

  const str = String(val).trim();

  // If ISO date like "2025-09-01T00:00:00.000Z" or "2025-09-01 00:00:00" or "2025-09-01"
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 0 && month < 12) {
      return `${months[month]} ${year}`;
    }
  }

  // Strip trailing " 00:00:00" or time components
  const cleanDateStr = str.replace(/\s+00:00:00.*$/, '').replace(/T00:00:00.*$/, '');
  return cleanDateStr || `Period ${rowIndex + 1}`;
}

/**
 * Cleans string and parses numeric float values.
 */
export function parsePriceNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  const cleanStr = String(val).replace(/[₹$€£,\s]/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses 2D array matrix into stocks and observations with synchronized company names.
 */
export function parseRawDataMatrix(matrix: any[][]): ParsedExcelResult {
  const warnings: string[] = [];

  const cleanRows = matrix.filter(
    (row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')
  );

  if (cleanRows.length === 0) {
    return { stocks: [], observations: [], warnings: ['The file or text contains no data rows.'] };
  }

  const firstRow = cleanRows[0];
  let hasHeaderRow = false;

  if (firstRow.length > 1) {
    const firstCellStr = String(firstRow[0] ?? '').trim().toLowerCase();
    const isDateOrPeriodHeader = ['date', 'period', 'month', 'time', 'year', 'day', 'sn', 'sr', '#', 'company'].some((h) =>
      firstCellStr.includes(h)
    );

    const candidateStockNames = firstRow.slice(1);
    const nonNumericCount = candidateStockNames.filter((cell) => {
      if (cell === null || cell === undefined) return false;
      const str = String(cell).trim();
      return str !== '' && isNaN(parsePriceNumber(str));
    }).length;

    const priceNumbersCount = candidateStockNames.filter((cell) => {
      if (cell === null || cell === undefined) return false;
      const str = String(cell).trim();
      const num = parsePriceNumber(str);
      return str !== '' && !isNaN(num) && num > 0;
    }).length;

    if (isDateOrPeriodHeader || nonNumericCount > 0 || priceNumbersCount < candidateStockNames.length) {
      hasHeaderRow = true;
    }
  }

  let stockNames: string[] = [];
  let dataRows: any[][] = [];

  if (hasHeaderRow) {
    stockNames = firstRow.slice(1).map((cell, idx) => {
      const name = String(cell ?? '').trim();
      return name || `Stock ${String.fromCharCode(65 + idx)}`;
    });
    dataRows = cleanRows.slice(1);
  } else {
    const maxCols = Math.max(...cleanRows.map((r) => r.length));
    const stockCount = Math.max(2, maxCols - 1);
    stockNames = Array.from({ length: stockCount }, (_, i) => `Stock ${String.fromCharCode(65 + i)}`);
    dataRows = cleanRows;
  }

  if (stockNames.length < 2) {
    warnings.push('Fewer than 2 price columns detected. Created Stock A and Stock B.');
    while (stockNames.length < 2) {
      stockNames.push(`Stock ${String.fromCharCode(65 + stockNames.length)}`);
    }
  }
  if (stockNames.length > 10) {
    warnings.push('More than 10 stock columns detected. Retained the first 10 stocks.');
    stockNames = stockNames.slice(0, 10);
  }

  const equalWeight = Math.floor(100 / stockNames.length);
  const remainder = 100 - equalWeight * stockNames.length;

  const stocks: Stock[] = stockNames.map((name, idx) => ({
    id: `stock-${idx + 1}`,
    name: name,
    ticker: name, // Synchronize ticker with exact company name
    weight: idx === 0 ? equalWeight + remainder : equalWeight,
  }));

  const observations: PriceObservation[] = [];

  dataRows.forEach((row, rIdx) => {
    const dateCell = row[0];
    const dateLabel = formatExcelDate(dateCell, rIdx);

    const prices: Record<string, number> = {};
    stocks.forEach((stock, sIdx) => {
      const priceCell = row[sIdx + 1];
      const parsedPrice = parsePriceNumber(priceCell);
      prices[stock.id] = parsedPrice;
    });

    observations.push({
      date: dateLabel,
      prices,
    });
  });

  return {
    stocks,
    observations,
    warnings,
  };
}

export function parseExcelFileBuffer(buffer: ArrayBuffer): ParsedExcelResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
  return parseRawDataMatrix(matrix);
}

export function parsePastedExcelText(text: string): ParsedExcelResult {
  const lines = text.trim().split(/\r?\n/);
  const matrix: any[][] = lines.map((line) => line.split(/[\t,]+/));
  return parseRawDataMatrix(matrix);
}
