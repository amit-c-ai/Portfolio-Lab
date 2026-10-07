import { PriceObservation, Stock, StepValidation } from '../types';

/**
 * Validates stock configuration and weight total.
 */
export function validatePortfolioSetup(stocks: Stock[]): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (stocks.length < 2) {
    errors.push('At least 2 stocks are required for portfolio analysis.');
  }
  if (stocks.length > 10) {
    errors.push('Maximum of 10 stocks supported.');
  }

  // Check empty names
  for (let i = 0; i < stocks.length; i++) {
    if (!stocks[i].name || stocks[i].name.trim() === '') {
      errors.push(`Stock #${i + 1} must have a name.`);
    }
  }

  // Weight total validation
  const sumWeights = stocks.reduce((acc, s) => acc + (isNaN(s.weight) ? 0 : s.weight), 0);
  const roundedSum = Math.round(sumWeights * 100) / 100;

  if (Math.abs(roundedSum - 100) > 0.1) {
    errors.push(`Portfolio weights must add up to 100%. Current sum: ${roundedSum.toFixed(1)}%`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates price observations table data.
 */
export function validatePriceObservations(
  observations: PriceObservation[],
  stocks: Stock[]
): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (observations.length === 0) {
    errors.push('Price data table is empty. Please enter price observations or load sample data.');
    return { isValid: false, errors, warnings };
  }

  if (observations.length < 3) {
    warnings.push('At least 3 price observations are recommended for statistically valid returns and sample statistics.');
  }

  if (observations.length < 2) {
    errors.push('At least 2 price observations are required to compute periodic returns.');
  }

  // Duplicate dates check
  const seenDates = new Set<string>();
  for (const obs of observations) {
    const d = obs.date.trim();
    if (!d) {
      warnings.push('Some rows have blank date labels.');
    } else if (seenDates.has(d)) {
      warnings.push(`Duplicate date label found: "${d}". Use unique period labels.`);
    } else {
      seenDates.add(d);
    }
  }

  // Check non-numeric or negative/zero prices
  for (let r = 0; r < observations.length; r++) {
    const obs = observations[r];
    for (const stock of stocks) {
      const price = obs.prices[stock.id];
      if (price === undefined || isNaN(price)) {
        errors.push(`Row ${r + 1} (${obs.date}): Missing price for ${stock.name}.`);
      } else if (price <= 0) {
        errors.push(`Row ${r + 1} (${obs.date}): Price for ${stock.name} must be greater than 0.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
