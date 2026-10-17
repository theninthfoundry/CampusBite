/**
 * CampusBite Centralized ETA & BREAK-FIT Engine
 *
 * Implements deterministic calculation matching PostgreSQL `calculate_queue_eta` RPC:
 * 1. Counts active kitchen orders (NEW, ACCEPTED, PREPARING) for queue congestion.
 * 2. Compares requested quantities against available unallocated prepared portions in warmers.
 * 3. Dominant cooking time applies only for remaining uncovered portions.
 * 4. Outputs explicit confidence scores and explanations.
 */

import { FoodItemDTO, CartItem, BreakFitRecommendation } from './types';

export interface EtaEngineInput {
  items: { food: FoodItemDTO; qty: number }[];
  activeQueueCount: number;
}

export interface EtaCalculationResult {
  estimatedMins: number;
  allPortionsPrepared: boolean;
  maxCookingTime: number;
  queueCongestionBuffer: number;
  uncoveredPortionsCount: number;
  explanation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Calculates authoritative order ETA based on warmer stock and active kitchen congestion.
 */
export function calculateOrderEta(input: EtaEngineInput): EtaCalculationResult {
  const { items, activeQueueCount } = input;

  if (!items || items.length === 0) {
    return {
      estimatedMins: 0,
      allPortionsPrepared: true,
      maxCookingTime: 0,
      queueCongestionBuffer: 0,
      uncoveredPortionsCount: 0,
      explanation: 'Empty tray: no preparation required.',
      confidence: 'HIGH',
    };
  }

  // Congestion heuristic: 2 minutes buffer per 2 active queued orders
  const queueCongestionBuffer = Math.floor(activeQueueCount / 2) * 2;
  let maxCookingTime = 0;
  let uncoveredPortionsCount = 0;
  let allPortionsPrepared = true;

  for (const item of items) {
    const availableWarmerPortions = Math.max(
      0,
      (item.food.preparedPortions || 0) - (item.food.allocatedPortions || 0)
    );
    const uncoveredQty = Math.max(0, item.qty - availableWarmerPortions);

    if (uncoveredQty > 0) {
      allPortionsPrepared = false;
      uncoveredPortionsCount += uncoveredQty;
      if (item.food.prepMin > maxCookingTime) {
        maxCookingTime = item.food.prepMin;
      }
    }
  }

  // If every single portion is already cooked and sitting in warmer
  if (allPortionsPrepared) {
    const estimatedMins = 3; // Immediate pickup / pack duration
    return {
      estimatedMins,
      allPortionsPrepared: true,
      maxCookingTime: 0,
      queueCongestionBuffer: 0,
      uncoveredPortionsCount: 0,
      explanation: 'Instant Pickup: All portions are ready in the warmer. Only 2-3 mins needed for packaging.',
      confidence: 'HIGH',
    };
  }

  // Cooking is required for at least one item
  const estimatedMins = maxCookingTime + queueCongestionBuffer;
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

  if (activeQueueCount > 10) {
    confidence = 'LOW';
  } else if (activeQueueCount > 4 || uncoveredPortionsCount > 5) {
    confidence = 'MEDIUM';
  }

  const explanation = `Fresh Cooking Required: ${maxCookingTime} min cook time + ${queueCongestionBuffer} min queue congestion (${activeQueueCount} orders currently queued).`;

  return {
    estimatedMins,
    allPortionsPrepared: false,
    maxCookingTime,
    queueCongestionBuffer,
    uncoveredPortionsCount,
    explanation,
    confidence,
  };
}

/**
 * Evaluates BREAK-FIT suitability for a specific dish against a student's break window.
 */
export function evaluateBreakFit(
  food: FoodItemDTO,
  requestedQty: number,
  breakMinutes: number,
  activeQueueCount: number
): BreakFitRecommendation {
  const result = calculateOrderEta({
    items: [{ food, qty: requestedQty }],
    activeQueueCount,
  });

  const availablePreparedPortions = Math.max(
    0,
    (food.preparedPortions || 0) - (food.allocatedPortions || 0)
  );

  const fitsBreak = result.estimatedMins <= breakMinutes;

  let explanation: string;
  if (fitsBreak) {
    if (result.allPortionsPrepared) {
      explanation = `Guaranteed in Warmer: ${availablePreparedPortions} portions ready. Pack time ~${result.estimatedMins} min fits your ${breakMinutes}-min break easily.`;
    } else {
      explanation = `Fits Break: Estimated ready in ~${result.estimatedMins} min (${food.prepMin} min cook + ${result.queueCongestionBuffer} min queue buffer) within ${breakMinutes} min.`;
    }
  } else {
    explanation = `Exceeds Window: Estimated prep time ~${result.estimatedMins} min (${result.maxCookingTime}m cook + ${result.queueCongestionBuffer}m queue buffer) is longer than your ${breakMinutes}-min break.`;
  }

  return {
    foodId: food.id,
    name: food.name,
    price: food.price,
    requestedQty,
    estimatedPrepMins: result.estimatedMins,
    availablePreparedPortions,
    fitsBreak,
    confidence: result.confidence,
    explanation,
    uncoveredCookTime: result.maxCookingTime,
    queueCongestionBuffer: result.queueCongestionBuffer,
  };
}
