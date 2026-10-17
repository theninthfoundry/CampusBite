# CampusBite Centralized ETA Engine & BREAK-FIT™ Specification

## 1. Executive Summary

Campus dining has a hard operational constraint: **academic lecture schedules**. Students cannot afford to wait 20 minutes for lunch when their passing period is only 10 minutes.

The **ETA Engine** and **BREAK-FIT™** feature eliminate guesswork by producing deterministic, explainable pickup estimates calculated directly from authoritative kitchen telemetry.

---

## 2. Centralized ETA Formula

The ETA calculation is codified identically in:
- PostgreSQL Server RPC: `calculate_queue_eta(p_items JSONB)`
- TypeScript Domain Engine: `calculateOrderEta(input: EtaEngineInput)`

$$\text{ETA} = \begin{cases} 
3\text{ minutes} & \text{if all requested items are ready in warmer} \\
\max(\text{prepMin}_{\text{uncovered}}) + \text{QueueBuffer} & \text{if fresh cooking is required}
\end{cases}$$

### Formula Parameters & Heuristics:

1. **Warmer Stock Check**:
   $$\text{uncoveredQty} = \max(0, \text{requestedQty} - (\text{preparedPortions} - \text{allocatedPortions}))$$
   - If $\text{uncoveredQty} = 0$ for all items in the tray, the meal requires zero stove time. The estimate is set to a flat **3 minutes** (packaging and counter pickup).
2. **Batch Cooking Assumption**:
   - In commercial campus cooking, like items are prepared concurrently.
   - The cooking duration is determined by the **maximum prep time** among dishes that require fresh cooking, rather than summing items linearly.
3. **Kitchen Congestion Buffer**:
   $$\text{QueueBuffer} = \left\lfloor \frac{\text{ActiveOrdersInQueue}}{2} \right\rfloor \times 2\text{ minutes}$$
   - Every 2 active orders (`NEW`, `ACCEPTED`, `PREPARING`) currently in the kitchen add **2 minutes** of queue latency.

---

## 3. Confidence & Uncertainty Model

Estimates are tagged with explicit confidence ratings based on operational visibility:

| Confidence | Condition | Student Guidance |
| :--- | :--- | :--- |
| **`HIGH`** | All items ready in warmer OR queue < 5 orders | Highly reliable pickup window. Minimal queue delay. |
| **`MEDIUM`** | Queue between 5 and 10 orders, or large fresh portions | Moderate kitchen activity. Minor fluctuations possible. |
| **`LOW`** | Queue > 10 orders (rush hour peak) | Kitchen at peak load. Actual time may fluctuate by ±4 minutes. |

---

## 4. BREAK-FIT™ Academic Decision Logic

BREAK-FIT compares the student's chosen academic interval against the calculated ETA:

```typescript
const rec = evaluateBreakFit(food, qty, breakMins, activeQueueCount);
const fitsBreak = rec.estimatedPrepMins <= breakMins;
```

### Classification Categories:

1. **Fits Break (`fitsBreak: true`)**:
   - *Example*: 5-minute break with Samosas (8 ready in warmer). 
   - *Explanation*: "Guaranteed in Warmer: 8 portions ready. Pack time ~3 min fits your 5-min break easily."
2. **Exceeds Break (`fitsBreak: false`)**:
   - *Example*: 10-minute break with Chicken Biryani (0 ready, 12 min cook time + 4 min queue buffer = 16 min ETA).
   - *Explanation*: "Exceeds Window: Estimated prep time ~16 min (12m cook + 4m queue buffer) is longer than your 10-min break."
3. **Paused / Unavailable**:
   - Items paused by kitchen staff are excluded from recommendations regardless of cooking speed.

---

## 5. Documented Assumptions & Limitations

1. **Pickup Transit**: Estimates model the time until food is ready at Counter 01. Walking transit from distant campus academic blocks is not modeled and must be accounted for by the student.
2. **Fixed Canteen Scope**: Currently configured for Main Academic Canteen (Counters 01 & 02).
3. **Timezone**: Configured for Indian Standard Time (IST, UTC+5:30).
