# Advisor Credibility Score System
## Design Specification — Meeting Notes (August 22, 2026)

---

**Feature:** Accumulative Advisor Credibility Score  
**Based On:** AI Prediction Accuracy Checker  
**Status:** Planning Phase  
**Discussed:** August 22, 2026 — Team Meeting  

---

## 1. Overview

Every advisor on MoneyMinds will have an **accumulative credibility score** based on the total accuracy of all their signals. This score will be publicly visible and will directly affect how much an advisor can charge for their groups and signals.

---

## 2. Internal Algorithm

The credibility score is calculated from two dimensions:

### A) Degree / Types of Accurate Predictions

Each checked prediction falls into one of these categories:

| Type | Description | Example |
|------|-------------|---------|
| **Perfect Match** | Both price target AND date were hit correctly | Predicted BTC $70k by Aug 15 → BTC hit $70k on Aug 15 |
| **Number Matched, Late** | Price target was reached but AFTER the predicted date | Predicted BTC $70k by Aug 15 → BTC hit $70k on Aug 20 |
| **Date Matched, Number Missed** | Timeframe was correct but price target was off | Predicted BTC $70k by Aug 15 → BTC was $65k on Aug 15 |
| **Incorrect** | Neither price nor date matched | Predicted BTC $70k (up) → BTC went down to $60k |

### B) Volume of Predictions

- Total number of predictions factors into credibility
- More predictions = more data points = more reliable score
- Advisors with very few predictions should not get inflated scores
- Minimum prediction threshold before credibility score is shown (e.g., 5+ predictions)

---

## 3. Negative Marking

The system **must support negative marking**:

- Incorrect predictions actively **reduce** the credibility score
- Not just neutral — wrong calls should have a penalty
- Prevents advisors from gaming the system by only posting safe/obvious predictions
- Consecutive incorrect predictions should have increasing weight (streak penalty)

---

## 4. Rating Scale & Criteria

> **TODO:** Design the formal scale. Below is a starting framework to be refined.

### Proposed Scale (to be finalized)

```
Score Range    Rating              Badge Color
─────────────────────────────────────────────
90 – 100       Elite Advisor        🟣 Purple / Gold
75 – 89        Expert               🟢 Green
60 – 74        Reliable             🔵 Blue
40 – 59        Developing           🟡 Yellow
20 – 39        Inconsistent         🟠 Orange
 0 – 19        Poor Track Record    🔴 Red
```

### Scoring Weight per Prediction Type (to be finalized)

```
Prediction Type                    Points
──────────────────────────────────────────
Perfect Match (price + date)        +10
Number Matched, Late                 +6
Date Matched, Number Missed          +3
Incorrect (negative marking)         -5
```

### Volume Multiplier (to be finalized)

```
Total Predictions     Multiplier
────────────────────────────────
< 5 predictions       Score hidden (not enough data)
5 – 15                 ×0.8 (early stage)
16 – 50                ×1.0 (standard)
51 – 100               ×1.1 (experienced)
100+                   ×1.2 (veteran)
```

---

## 5. Fee Tiers Based on Credibility

Advisors with higher credibility scores can charge higher fees:

| Credibility Rating | Max Joining Fee | Max Monthly Fee |
|--------------------|----------------|-----------------|
| Elite (90+)        | Unlimited      | Unlimited       |
| Expert (75–89)     | $500           | $200            |
| Reliable (60–74)   | $200           | $100            |
| Developing (40–59) | $50            | $25             |
| Below 40           | Free only      | Free only       |

> **Note:** Exact fee caps to be finalized based on market research.

---

## 6. Implementation Plan

### Phase 1: Algorithm Design
- [ ] Finalize scoring weights for each prediction type
- [ ] Finalize negative marking penalty system
- [ ] Finalize volume multiplier
- [ ] Define minimum prediction threshold
- [ ] Design streak bonus / streak penalty logic

### Phase 2: Backend
- [ ] Extend `calculateAccuracy` to classify predictions into 4 types (perfect / late / date-only / incorrect)
- [ ] Create `calculateCredibilityScore(advisorId)` function
- [ ] Store credibility score on advisor profile (or compute on-the-fly with caching)
- [ ] Add credibility score to advisor accuracy API endpoint
- [ ] Add fee cap enforcement based on credibility tier

### Phase 3: Frontend
- [ ] Credibility badge component (color-coded by tier)
- [ ] Credibility breakdown card (show prediction type distribution)
- [ ] Credibility history chart (score over time)
- [ ] Fee tier indicator on advisor profile
- [ ] Public-facing credibility on Browse Advisors / Find Advisors pages

### Phase 4: Testing & QA
- [ ] Unit tests for all 4 prediction type classifications
- [ ] Unit tests for negative marking scenarios
- [ ] Unit tests for volume multiplier
- [ ] Edge case: advisor with 0 predictions
- [ ] Edge case: advisor with all incorrect predictions
- [ ] Edge case: advisor at exact tier boundaries

---

## 7. Reports

- All project reports (progress, technical, client-facing) must be uploaded to **Google Drive**
- PDF generation pipeline already exists (`md-to-pdf` with `report-style.css`)

---

## 8. Dependencies

This feature builds on top of the existing **Prediction Accuracy Tracker** (completed Aug 22, 2026):

- `server/services/predictionCheckerService.js` — `calculateAccuracy()` function
- `server/routes/predictions.js` — `buildAccuracyStats()` helper
- `src/app/components/signals/AdvisorAccuracyCard.tsx` — accuracy UI
- `supabase/006_prediction_accuracy.sql` — DB schema

---

*Document created: August 22, 2026*  
*Source: Team meeting notes*  
*Status: Planning — awaiting algorithm finalization*
