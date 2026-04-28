# 🌸 ML Features — Behavior & User Flow Guide
**Project: Pink Petals AI Beauty E-Commerce Platform**

---

## Overview of ML Features Behavior

The platform has **two ML-powered features**, each serving a different user group:

| Feature | Who Sees It | Where It Appears | What It Does |
|---|---|---|---|
| **AI Product Recommendation** | Customers | Shop page cards + Product details page | Tells if a product suits the user's skin |
| **Revenue Forecasting** | Admin only | Served via `/api/predict` endpoint | Predicts expected revenue for a product |

---

## Feature 1: AI Product Recommendation — End-to-End Behavior

### Step 1: Customer Sets Up Skin Profile

**Where:** `/profile/skin` (Skin Profile Setup page) or directly from CustomerDashboard → "Skin Profile" quick action

**What happens:**
1. User selects their attributes from dropdown menus:
   - **Skin Type:** Combination / Normal / Dry / Oily
   - **Skin Tone:** Fair / Light / Light Medium / Fair Light / Medium Tan / Medium / Tan / Deep / Rich / Porcelain / Dark / Olive / Not Sure
   - **Eye Color:** Brown / Green / Blue / Hazel / Grey/Gray
   - **Hair Color:** Black / Brown / Blonde / Auburn / Red / Gray / Brunette

2. User clicks **"Save my profile"**

3. Profile is saved to **`SkinProfileContext`** (global React state) AND **localStorage** (key: `pinkPetalsSkinProfile_{userId}`)

4. A success message "🌸 Profile saved! We'll now show personalized recommendations..." appears for 3 seconds, then redirects back.

5. Skin profile persists across sessions (localStorage) and is loaded back on next visit.

---

### Step 2: Browsing the Shop — Batch Recommendation Badges

**Where:** `/shop` (Shop Page — product grid)

**What happens when Shop Page loads:**

```
1. Products are fetched from backend
2. If skinProfile is set → getBatchProductRecommendations() is called
3. All products are checked in PARALLEL (Promise.all)
4. Each ProductCard gets a precomputedStatus
```

**Timeline:**
```
User opens /shop
    ↓
Products load from API
    ↓
If skin profile exists → batch recommendation API calls fire simultaneously
    ↓
Each product card gets one of these statuses:
   • "recommended"      → ✅ "Suits your skin" (green badge)
   • "not-recommended"  → ⚠️ "May not suit you" (amber badge)
   • "hidden"           → badge is invisible (API error)
   • "unconfigured"     → "Set your skin profile" link
```

**What the badges look like on ProductCard:**

| Status | Badge Appearance |
|---|---|
| ✅ Recommended | Green pill badge: `✅ Suits your skin` |
| ⚠️ Not Recommended | Amber pill badge: `⚠️ May not suit you` |
| No profile set | Pink link: `Set your skin profile` |
| ML offline | Nothing shown (silent fail) |

**Performance Note:** All product recommendation API calls fire **simultaneously** using `Promise.all()`. This means checking 12 products takes the same time as checking 1 (parallel, not sequential).

---

### Step 3: Viewing a Product — Detailed Recommendation Panel

**Where:** `/shop/product/:id` (Product Details Page)

**What happens:**

The `<ProductRecommendation>` component is embedded directly in the product detail page. It behaves differently based on whether a skin profile exists:

#### Scenario A: Skin Profile Already Set (Auto-runs)

```
User opens product page
    ↓
ProductRecommendation component mounts
    ↓
useEffect detects skinProfile is complete
    ↓
API call fires automatically (no user action needed)
    ↓
Loading spinner: "Analyzing your skin profile..."
    ↓
Result panel appears
```

**Result — Recommended (prediction=1, confidence ≥ 80%):**
```
✅ Great news! This product suits your profile
   [ 87% match ]
   "Highly recommended for your skin profile! ⭐"
   [Add to Cart]  [See similar products]
```

**Result — Recommended (confidence 60–79%):**
```
✅ Great news! This product suits your profile
   [ 72% match ]
   "This product is likely a good match for you."
   [Add to Cart]  [See similar products]
```

**Result — Not Recommended (prediction=0, confidence < 40%):**
```
⚠️ This may not suit your skin profile
   [ 23% confidence ]
   "This product may not suit your skin profile."
   [See better alternatives]
   "This is an AI suggestion — results may vary per individual"
```

**Result — Mixed Signal:**
```
⚠️ This may not suit your skin profile
   [ 55% confidence ]
   "Mixed reviews from customers with similar profiles."
```

#### Scenario B: No Skin Profile Set

The form is shown so the user can enter their skin details manually (without saving to profile):

```
Is this product right for you?
Tell us about your skin and we'll check if this product suits your profile
                                              [Powered by AI ✨]

[ Skin Type ▾ ]  [ Skin Tone ▾ ]
[ Eye Color ▾ ]  [ Hair Color ▾ ]

        [Check if this suits me 🌸]
```

#### Scenario C: ML Server Offline

```
ℹ️ Recommendation service unavailable. Please try again later.
```
(User can still browse and purchase — the AI panel does not block any actions.)

---

### Step 4: API Data Flow (Detailed)

```
Frontend → POST /api/recommend (Spring Boot, port 8080)
           Body: { brandName, subCategory, skinType, skinTone,
                   eyeColor, hairColor, priceUsd, sentimentScore: 0.75 }

Spring Boot → POST http://127.0.0.1:5000/recommend (Flask, port 5000)
              (5 second connect timeout, 10 second read timeout)

Flask ML Server:
  1. Decode all string inputs using LabelEncoders
  2. Compute price_vs_cat_avg = priceUsd - category_avg_price
  3. Build 9-feature array
  4. Scale with StandardScaler
  5. Predict with XGBoost classifier
  6. Compute probability with predict_proba()
  7. Build insight message
  8. Return JSON

Spring Boot → Relay JSON response back to Frontend
Frontend → Display result in UI
```

---

## Feature 2: Sales Revenue Forecasting — End-to-End Behavior

### Purpose
This feature is for **administrators** only. It answers: *"If I sell product X from brand Y on date Z at price P, what revenue can I expect?"*

### How It Is Triggered

The forecasting feature is exposed as a Spring Boot REST API (`POST /api/predict`). The frontend has the `forecastService.js` ready to call it. Admin dashboards or future admin panels can call this to show revenue predictions.

### What the Admin Provides

| Field | Example | Notes |
|---|---|---|
| brand | `"Cosrx"` | Must match brands in `brand_map.json` |
| subCategory | `"Serum"` | Must match categories in `subcat_map.json` |
| date | `"2026-05-15"` | ISO format YYYY-MM-DD |
| unitPrice | `25.00` | Price in USD |
| lagRevenue1 | `150.00` | Yesterday's revenue (optional, defaults to 0) |
| rollingRev7 | `120.00` | Last 7-day average revenue (optional, defaults to 0) |
| isDiscounted | `0` or `1` | Whether product is on discount |

### What the System Returns

```json
{
  "predictedRevenue": 234.50,
  "brand": "Cosrx",
  "subCategory": "Serum",
  "date": "2026-05-15",
  "currency": "USD"
}
```

### Internal ML Processing

```
Admin sends request to POST /api/predict (Spring Boot)
    ↓
MlPredictionService calls POST http://127.0.0.1:5000/predict (Flask)
    ↓
Flask encodes brand & subcategory → integers using JSON maps
    ↓
Flask extracts temporal features from date:
   • weekday (Mon=0 to Sun=6)
   • day of month (1–31)
   • month (1–12)
    ↓
Flask computes relative_price_index = unitPrice / category_median_price
    ↓
All 9 features assembled into numpy array
    ↓
XGBoost regressor predicts revenue
    ↓
Returns { predictedRevenue: 234.50, ... }
```

### Frontend Access (forecastService.js)

```javascript
// Check if ML server is up
const isUp = await checkMlHealth();  // returns true/false

// Get available brands from ML server
const brands = await getBrands();  // ["Beauty of Joseon", "Cosrx", ...]

// Get available categories
const categories = await getCategories();  // ["Serum", "Moisturizer", ...]

// Make a revenue prediction
const result = await predictRevenue("Cosrx", "Serum", "2026-05-15", 25.0, 150, 120, 0);
// result.predictedRevenue = 234.50
```

---

## Error States and Graceful Degradation

### When ML Server Is Offline

The system is designed to **never break** the shopping experience when the ML server goes down:

| Location | Behavior When ML Offline |
|---|---|
| Shop Page badges | Badges silently disappear — product cards still work normally |
| Product Details recommendation panel | Shows orange info box: "Recommendation service unavailable. Please try again later." |
| Forecast API | Returns HTTP 503; Spring Boot throws `MlServiceUnavailableException` |
| ML Health Check (`/api/ml/health`) | Returns `{ "status": "DOWN" }` with HTTP 503 |

### Spring Boot Exception Handling

```java
// ProductRecommendationService.java
try {
    return restTemplate.postForObject(FLASK_SERVER_URL + "/recommend", request, RecommendationResponse.class);
} catch (ResourceAccessException e) {
    throw new MlServiceUnavailableException("Recommendation service is currently unavailable");
}

// RecommendationController.java
catch (MlServiceUnavailableException e) {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
}
```

---

## Key Design Decisions

### 1. Parallel Batch Calls on Shop Page
Instead of making one sequential API call per product, all recommendation checks are fired simultaneously using `Promise.all()`. This ensures the shop page performance doesn't degrade as product count grows.

### 2. Precomputed Status Passed to Badge
The `SkinProfileBadge` component accepts a `precomputedStatus` prop. When the ShopPage pre-fetches all statuses in batch, it passes them directly to each badge — avoiding redundant API calls from individual badge components.

### 3. Auto-trigger on Product Detail Page
When the user already has a skin profile saved, the recommendation panel fires automatically without requiring the user to click anything. This creates a seamless, "magic" experience.

### 4. Sentiment Score Default
For new or unreviewed products, a neutral default sentiment score of `0.75` is used. This gives the model a fair, slightly positive baseline without skewing predictions.

### 5. Skin Profile in localStorage (not backend)
The skin profile is stored in the browser's localStorage (not the database). This makes it instant to read/write, avoids additional API calls for profile retrieval, and allows the feature to work even without a dedicated user profile endpoint.

### 6. Silent Failure on Badge
If the ML service fails on any individual product badge, the badge is hidden (`status = 'hidden'`) rather than showing an error. This prevents the entire shop page from looking broken when the ML server is down.

---

## Supported Values Reference

### Skin Types
`Combination`, `Normal`, `Dry`, `Oily`

### Skin Tones
`Fair`, `Light`, `Light Medium`, `Fair Light`, `Medium Tan`, `Medium`, `Tan`, `Deep`, `Rich`, `Porcelain`, `Dark`, `Olive`, `Not Sure`

### Eye Colors
`Brown`, `Green`, `Blue`, `Hazel`, `Grey/Gray`

### Hair Colors
`Black`, `Brown`, `Blonde`, `Auburn`, `Red`, `Gray`, `Brunette`

### Brands (Sales Model)
`Beauty of Joseon`, `Cosrx`, `Olay`, `Cetaphil`, `Cerave`, `Laneige`, `The Ordinary`

### Product Sub-Categories (Both Models)
`Exfoliator`, `Face Mask`, `Toner`, `Serum`, `Moisturizer`, `Eye Cream`, `Cleanser`, `Sunscreen`

---

## Summary: What Makes This "AI"?

| Aspect | What it means in this project |
|---|---|
| **Machine Learning** | Two trained XGBoost models (one classifier, one regressor) |
| **Training Data** | Customer review data with skin attributes; historical sales data |
| **Personalization** | Model uses the individual customer's skin type, tone, eye color, hair color |
| **Real-time Inference** | Every time a product is viewed, the model runs a live prediction |
| **Feature Engineering** | `price_vs_cat_avg` and `relative_price_index` are manually crafted features |
| **Confidence Score** | `predict_proba()` gives probability, not just binary yes/no |
| **Graceful AI** | System acknowledges uncertainty with insight messages like "Mixed reviews from similar profiles" |
