import { PriceObservation, ReturnObservation } from '../types';

/**
 * Calculates periodic returns from price observations.
 * Formula: Return_t = (Price_t - Price_t-1) / Price_t-1
 *
 * @param observations List of price observations ordered chronologically
 * @param stockIds List of active stock IDs
 * @returns Array of ReturnObservation (length = priceObservations.length - 1)
 */
export function calculateReturns(
  observations: PriceObservation[],
  stockIds: string[]
): ReturnObservation[] {
  if (observations.length < 2) {
    return [];
  }

  const returnObs: ReturnObservation[] = [];

  for (let i = 1; i < observations.length; i++) {
    const prevObs = observations[i - 1];
    const currObs = observations[i];
    const periodReturns: Record<string, number> = {};

    for (const stockId of stockIds) {
      const prevPrice = prevObs.prices[stockId];
      const currPrice = currObs.prices[stockId];

      if (
        prevPrice !== undefined &&
        currPrice !== undefined &&
        prevPrice > 0 &&
        !isNaN(prevPrice) &&
        !isNaN(currPrice)
      ) {
        periodReturns[stockId] = (currPrice - prevPrice) / prevPrice;
      } else {
        periodReturns[stockId] = 0;
      }
    }

    returnObs.push({
      date: currObs.date,
      returns: periodReturns,
    });
  }

  return returnObs;
}
