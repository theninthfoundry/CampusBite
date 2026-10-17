import { describe, it, expect } from 'vitest';
import { calculateOrderEta, evaluateBreakFit } from '../lib/etaEngine';
import { FoodItemDTO } from '../lib/types';

const MOCK_FOODS: Record<string, FoodItemDTO> = {
  samosa: {
    id: 7,
    name: 'Samosa (2 pcs)',
    description: 'Golden flaky crust',
    price: 25,
    category: 'Snacks',
    dietary: 'Veg',
    prepMin: 3,
    available: true,
    preparedPortions: 8,
    allocatedPortions: 0,
    availablePreparedPortions: 8,
    isPausedByAdmin: false,
  },
  biryani: {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Dum cooked basmati',
    price: 120,
    category: 'Meals',
    dietary: 'Non-Veg',
    prepMin: 12,
    available: true,
    preparedPortions: 0,
    allocatedPortions: 0,
    availablePreparedPortions: 0,
    isPausedByAdmin: false,
  },
  dosa: {
    id: 6,
    name: 'Masala Dosa',
    description: 'Crisp crepe',
    price: 60,
    category: 'Meals',
    dietary: 'Veg',
    prepMin: 8,
    available: true,
    preparedPortions: 0,
    allocatedPortions: 0,
    availablePreparedPortions: 0,
    isPausedByAdmin: false,
  },
};

describe('CampusBite ETA Engine', () => {
  it('returns 0 mins for an empty tray', () => {
    const result = calculateOrderEta({ items: [], activeQueueCount: 0 });
    expect(result.estimatedMins).toBe(0);
    expect(result.allPortionsPrepared).toBe(true);
  });

  it('calculates 3 mins (instant pickup) when all items are ready in warmers', () => {
    const result = calculateOrderEta({
      items: [{ food: MOCK_FOODS.samosa, qty: 2 }],
      activeQueueCount: 4,
    });
    expect(result.estimatedMins).toBe(3);
    expect(result.allPortionsPrepared).toBe(true);
    expect(result.confidence).toBe('HIGH');
  });

  it('incorporates cook time when portions are not in warmers', () => {
    const result = calculateOrderEta({
      items: [{ food: MOCK_FOODS.dosa, qty: 1 }],
      activeQueueCount: 0,
    });
    expect(result.estimatedMins).toBe(8);
    expect(result.allPortionsPrepared).toBe(false);
  });

  it('applies kitchen queue congestion buffer (+2m per 2 active queued orders)', () => {
    const result = calculateOrderEta({
      items: [{ food: MOCK_FOODS.biryani, qty: 1 }],
      activeQueueCount: 4, // 4 orders = 4 mins buffer
    });
    // 12m cook + 4m queue buffer = 16 mins
    expect(result.estimatedMins).toBe(16);
    expect(result.queueCongestionBuffer).toBe(4);
  });

  it('uses dominant max cooking time for multiple dishes rather than linear sum', () => {
    const result = calculateOrderEta({
      items: [
        { food: MOCK_FOODS.biryani, qty: 1 }, // 12 mins
        { food: MOCK_FOODS.dosa, qty: 1 },    // 8 mins
      ],
      activeQueueCount: 2, // +2m buffer
    });
    // max(12, 8) + 2m buffer = 14 mins
    expect(result.estimatedMins).toBe(14);
  });
});

describe('BREAK-FIT Evaluation Engine', () => {
  it('evaluates ready warmer items as fitting a 5-min recess', () => {
    const rec = evaluateBreakFit(MOCK_FOODS.samosa, 2, 5, 2);
    expect(rec.fitsBreak).toBe(true);
    expect(rec.estimatedPrepMins).toBe(3);
    expect(rec.explanation).toContain('Guaranteed in Warmer');
  });

  it('evaluates fresh cooked biryani as exceeding a 10-min passing period', () => {
    const rec = evaluateBreakFit(MOCK_FOODS.biryani, 1, 10, 2);
    expect(rec.fitsBreak).toBe(false);
    expect(rec.estimatedPrepMins).toBe(14); // 12 + 2
    expect(rec.explanation).toContain('Exceeds Window');
  });

  it('evaluates fresh cooked biryani as fitting a 30-min lunch window', () => {
    const rec = evaluateBreakFit(MOCK_FOODS.biryani, 1, 30, 2);
    expect(rec.fitsBreak).toBe(true);
  });
});
