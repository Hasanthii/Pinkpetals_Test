# 🧠 ML Features — Full Implementation Details
**Project: Pink Petals AI Beauty E-Commerce Platform**

---

## Overview

The platform integrates **two distinct Machine Learning features**, both served by a dedicated **Python Flask ML server** that communicates with the **Spring Boot backend** via internal HTTP:

| Feature | Algorithm | User | Purpose |
|---|---|---|---|
| **AI Product Recommendation** | XGBoost (classifier) | Customer | Determine if a product suits a customer's skin profile |
| **Revenue / Sales Forecasting** | XGBoost (regressor) | Admin | Predict future revenue for a product category and brand |

---

## 1. System Architecture

```
┌──────────────────────────────────────┐
│      React Frontend (Vite)           │
│  - SkinProfileContext.jsx            │
│  - recommendationService.js          │
│  - forecastService.js                │
│  - ProductRecommendation.jsx         │
│  - SkinProfileBadge.jsx              │
│  - ShopPage.jsx                      │
└────────────────┬─────────────────────┘
                 │  HTTP (localhost:5173)
                 ▼
┌──────────────────────────────────────┐
│    Spring Boot Backend (Java)        │
│  - RecommendationController.java     │
│  - ForecastController.java           │
│  - ProductRecommendationService.java │
│  - MlPredictionService.java          │
└────────────────┬─────────────────────┘
                 │  HTTP (localhost:5000)
                 ▼
┌──────────────────────────────────────┐
│    Python Flask ML Server            │
│  - app.py                            │
│  - reviews_xgboost_model.pkl  ←── AI Recommendation model
│  - xgboost_model.pkl          ←── Sales Forecast model
│  - reviews_scaler.pkl         ←── StandardScaler
│  - reviews_label_encoders.pkl ←── LabelEncoders
│  - brand_map.json             ←── Brand → integer encoding
│  - subcat_map.json            ←── SubCategory → integer encoding
│  - cat_medians.json           ←── Price medians per category
│  - reviews_cat_avg_price.json ←── Avg price per category (for recommendation)
└──────────────────────────────────────┘
```

---

## 2. Feature 1: AI Product Recommendation

### 2.1 Purpose
When a customer views a product, the system tells them:
- Whether this product is **recommended** for their skin profile
- A **confidence score** (0–100%)
- A human-readable **insight** message

### 2.2 ML Model Details

| Property | Value |
|---|---|
| Algorithm | **XGBoost Classifier** |
| File | `reviews_xgboost_model.pkl` |
| Target Variable | Binary: `1` = recommended, `0` = not recommended |
| Training Data Source | Customer review dataset with skin attributes |
| Preprocessing | StandardScaler + LabelEncoder |

### 2.3 Input Features (9 features)

The model takes 9 numerical features derived from categorical inputs:

```python
features_raw = np.array([[
    brand_encoded,      # LabelEncoder → integer (e.g. "Cosrx" → 1)
    subcat_encoded,     # LabelEncoder → integer (e.g. "Serum" → 3)
    skin_type_enc,      # LabelEncoder → integer (e.g. "Oily" → 2)
    skin_tone_enc,      # LabelEncoder → integer (e.g. "Light" → 1)
    eye_color_enc,      # LabelEncoder → integer (e.g. "Brown" → 0)
    hair_color_enc,     # LabelEncoder → integer (e.g. "Black" → 0)
    price_usd,          # raw float (e.g. 29.99)
    sentiment_score,    # float 0–1, default = 0.75 for new products
    price_vs_cat_avg    # price_usd − category_average_price
]])
```

**Then scaled using a pre-fitted StandardScaler:**
```python
features_scaled = reviews_scaler.transform(features_raw)
```

### 2.4 Categorical Encoding

All string inputs are encoded using **LabelEncoder** objects, stored in `reviews_label_encoders.pkl`:
- `brand_name` → fitted encoder for brand names
- `sub_categories` → fitted encoder for product sub-categories
- `skin_type` → e.g., Combination, Dry, Normal, Oily
- `skin_tone` → e.g., Fair, Light, Medium, Tan, Deep
- `eye_color` → e.g., Brown, Blue, Green, Hazel, Grey/Gray
- `hair_color` → e.g., Black, Brown, Blonde, Auburn, Red

**Unknown value handling:**
```python
try:
    return int(le.transform([value])[0])
except ValueError:
    return int(le.transform([le.classes_[0]])[0])  # fallback to class[0]
```

### 2.5 Engineered Feature: `price_vs_cat_avg`

This is a **manually engineered feature** that captures how a product's price compares to the average price in its category:

```python
avg_price = cat_avg_price.get(sub_category, 45.0)
price_vs_cat_avg = price_usd - avg_price
```

Values stored in `reviews_cat_avg_price.json`:
```json
{
  "0": 43.26,   ← Exfoliator avg price
  "1": 44.71,   ← Face Mask
  "2": 45.62,   ← Toner
  "3": 52.05,   ← Serum
  "4": 38.51,   ← Moisturizer
  "5": 44.31,   ← Eye Cream
  "6": 37.40,   ← Cleanser
  "7": 52.48    ← Sunscreen
}
```

### 2.6 Prediction Output

```python
prediction  = int(reviews_model.predict(features_scaled)[0])         # 0 or 1
probability = float(reviews_model.predict_proba(features_scaled)[0][1])  # confidence
```

**Insight message logic:**
```python
if prediction == 1 and probability >= 0.80:
    insight = "Highly recommended for your skin profile! ⭐"
elif prediction == 1 and probability >= 0.60:
    insight = "This product is likely a good match for you."
elif prediction == 0 and probability < 0.40:
    insight = "This product may not suit your skin profile."
else:
    insight = "Mixed reviews from customers with similar profiles."
```

**JSON Response sent to backend:**
```json
{
  "isRecommended": true,
  "confidence": 87.4,
  "insight": "Highly recommended for your skin profile! ⭐",
  "brandName": "Cosrx",
  "subCategory": "Serum",
  "skinType": "Oily",
  "skinTone": "Light"
}
```

### 2.7 Flask API Endpoint

```
POST /recommend
Content-Type: application/json

{
  "brandName":   "Cosrx",
  "subCategory": "Serum",
  "skinType":    "Oily",
  "skinTone":    "Light",
  "eyeColor":    "Brown",
  "hairColor":   "Black",
  "priceUsd":    25.00,
  "sentimentScore": 0.75
}
```

### 2.8 Spring Boot Layer

**DTO Classes:**

`RecommendationRequest.java` — contains: `brandName`, `subCategory`, `skinType`, `skinTone`, `eyeColor`, `hairColor`, `priceUsd`, `sentimentScore`

`RecommendationResponse.java` — contains: `isRecommended`, `confidence`, `insight`, `brandName`, `subCategory`, `skinType`, `skinTone`

**Service (`ProductRecommendationService.java`):**
```java
// Custom RestTemplate with timeouts
SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
factory.setConnectTimeout(5000);   // 5s connection timeout
factory.setReadTimeout(10000);     // 10s read timeout

public RecommendationResponse getRecommendation(RecommendationRequest request) {
    return restTemplate.postForObject(FLASK_SERVER_URL + "/recommend", request, RecommendationResponse.class);
}
```

**Controller (`RecommendationController.java`):**
```
POST /api/recommend          → getRecommendation()
GET  /api/recommend/skin-types → getSkinTypes()
GET  /api/recommend/skin-tones → getSkinTones()
```

### 2.9 Frontend State Management

**`SkinProfileContext.jsx`** — React Context API for global skin profile state:
- Stores: `{ skinType, skinTone, eyeColor, hairColor }`
- Persisted to **localStorage** with per-user key: `pinkPetalsSkinProfile_{userId}`
- Provides: `skinProfile`, `setSkinProfile()`, `clearSkinProfile()`

**`recommendationService.js`** — Frontend API layer:
- `getProductRecommendation(brandName, subCategory, skinType, skinTone, eyeColor, hairColor, priceUsd)` — single product
- `getBatchProductRecommendations(products, skinProfile)` — batch using `Promise.all()`

**Batch Recommendation (performance optimisation):**
```javascript
const promises = products.map(async (p) => {
    const res = await getProductRecommendation(...);
    return { id: p.id, status: res.isRecommended ? 'recommended' : 'not-recommended' };
});
const results = await Promise.all(promises);  // Parallel HTTP calls
```

### 2.10 UI Components

#### `SkinProfileSetup.jsx` (Page)
- Route: `/profile/skin`
- Allows user to set: Skin Type, Skin Tone, Eye Color, Hair Color
- Saves to `SkinProfileContext` → localStorage
- After saving, redirects back after 3 seconds

#### `ProductRecommendation.jsx` (Component — Product Details Page)
- Appears on every product detail page
- **Auto-runs** if skin profile is already set:
  ```javascript
  useEffect(() => {
      if (skinProfile?.skinType && skinProfile?.skinTone && ...) {
          handleCheckRecommendation(...);
      }
  }, [skinProfile, brandName, subCategory, priceUsd]);
  ```
- Shows loading spinner → result card with:
  - ✅ "Great news! This product suits your profile" + confidence badge
  - ⚠️ "This may not suit your skin profile" warning

#### `SkinProfileBadge.jsx` (Component — Shop Page Cards)
- Tiny badge rendered on every `ProductCard` in the shop
- **Statuses:** `loading` | `recommended` | `not-recommended` | `unconfigured` | `hidden`
- Receives `precomputedStatus` from ShopPage's batch call to avoid N individual API calls
- If no skin profile → shows "Set your skin profile" link
- If ML service offline → silently hides badge (no error shown to user)

---

## 3. Feature 2: Sales Revenue Forecasting

### 3.1 Purpose
Admin users can predict the **expected revenue** for a product on a future date, given its brand, category, price, and historical sales data.

### 3.2 ML Model Details

| Property | Value |
|---|---|
| Algorithm | **XGBoost Regressor** |
| File | `xgboost_model.pkl` |
| Target Variable | Continuous: predicted revenue (USD) |
| Input | Brand, sub-category, date, price, lag/rolling revenue features |

### 3.3 Input Features (9 features)

```python
features = np.array([[
    brand_encoded,         # brand_encoded
    subcat_encoded,        # sub_categories_encoded
    date.weekday(),        # day_of_week
    date.day,              # day
    date.month,            # month
    lag_revenue1,          # lag_revenue_1
    rolling_rev7,          # rolling_rev_7
    relative_price_index,  # relative_price_index
    is_discounted          # is_discounted
]])
```

**Engineered Feature — `relative_price_index`:**
```python
cat_median = cat_medians.get(sub_category, 10.0)
relative_price_index = unit_price / (cat_median if cat_median else 1.0)
```

Values from `cat_medians.json`:
```json
{
  "Cleanser":    1.456,
  "Exfoliator":  1.121,
  "Eye Cream":   0.534,
  "Face Mask":   5.333,
  "Moisturizer": 5.001,
  "Serum":       1.227,
  "Sunscreen":   1.252,
  "Toner":       1.596
}
```

### 3.4 Categorical Encoding (Simple Maps)

Unlike the recommendation model, the sales model uses simple JSON dictionaries (not LabelEncoder):

**`brand_map.json`:**
```json
{
  "Beauty of Joseon": 0,
  "Cosrx":            1,
  "Olay":             2,
  "Cetaphil":         3,
  "Cerave":           4,
  "Laneige":          5,
  "The Ordinary":     6
}
```

**`subcat_map.json`:**
```json
{
  "Exfoliator":  0,
  "Face Mask":   1,
  "Toner":       2,
  "Serum":       3,
  "Moisturizer": 4,
  "Eye Cream":   5,
  "Cleanser":    6,
  "Sunscreen":   7
}
```

### 3.5 Flask API Endpoint

```
POST /predict
Content-Type: application/json

{
  "brand":        "Cosrx",
  "subCategory":  "Serum",
  "date":         "2026-05-15",
  "unitPrice":    25.0,
  "lagRevenue1":  150.0,
  "rollingRev7":  120.0,
  "isDiscounted": 0
}
```

**Response:**
```json
{
  "predictedRevenue": 234.50,
  "brand":            "Cosrx",
  "subCategory":      "Serum",
  "date":             "2026-05-15",
  "currency":         "USD"
}
```

### 3.6 Spring Boot Layer

**DTO Classes:**

`PredictionRequest.java` (Lombok): `brand`, `subCategory`, `date`, `unitPrice`, `lagRevenue1`, `rollingRev7`, `isDiscounted`

`PredictionResponse.java` (Lombok): `predictedRevenue`, `brand`, `subCategory`, `date`

**Service (`MlPredictionService.java`):**
```java
public PredictionResponse predictSales(PredictionRequest request) {
    String url = mlServerUrl + "/predict";  // http://127.0.0.1:5000/predict
    ResponseEntity<PredictionResponse> response = restTemplate.postForEntity(url, request, PredictionResponse.class);
    return response.getBody();
}

public boolean checkHealth() {
    ResponseEntity<String> response = restTemplate.getForEntity(mlServerUrl + "/health", String.class);
    return response.getStatusCode().is2xxSuccessful();
}
```

**Controller (`ForecastController.java`):**
```
POST /api/predict           → predictRevenue()
GET  /api/ml/brands         → getBrands()
GET  /api/ml/categories     → getCategories()
GET  /api/ml/health         → checkHealth()
```

### 3.7 Frontend Service (`forecastService.js`)

```javascript
export const predictRevenue = async (brand, subCategory, date, unitPrice, 
                                      lagRevenue1=0, rollingRev7=0, isDiscounted=0) => {
    const response = await api.post('/predict', {
        brand, subCategory, date, unitPrice, lagRevenue1, rollingRev7, isDiscounted
    });
    return response.data;  // { predictedRevenue, brand, subCategory, date, currency }
};

export const checkMlHealth = async () => {
    const response = await api.get('/ml/health');
    return response.status === 200;   // boolean
};
```

---

## 4. Health Check Endpoint

The Flask server exposes a `/health` endpoint used by the Spring Boot backend to verify ML server availability:

```python
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status'        : 'ok',
        'sales_model'   : 'loaded',
        'reviews_model' : 'loaded',
        'brands'        : len(brand_map),    # 7
        'categories'    : len(subcat_map)    # 8
    })
```

The backend exposes this as `GET /api/ml/health` → returns `{ "status": "UP" }` or HTTP 503 `{ "status": "DOWN" }`.

---

## 5. Error Handling

| Layer | Error Scenario | Handling |
|---|---|---|
| Flask Server | Invalid input / exception | Returns HTTP 400 + `{"error": "..."}` |
| Spring Boot Service | ML server is offline | Throws `MlServiceUnavailableException` |
| Spring Boot Controller | Service exception | Returns HTTP 503 with error message |
| Frontend (Recommendation) | HTTP 503 received | Shows "Recommendation service unavailable" toast |
| Frontend (Badge) | Any error | Silently hides badge (`status = 'hidden'`) |
| Frontend (Batch) | Individual failure | Sets that product's status to `'hidden'` |

---

## 6. Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| ML Model Training | XGBoost | Training done offline; `.pkl` files pre-saved |
| ML Serving | Python 3 + Flask + Flask-CORS | REST API on `localhost:5000` |
| Model Persistence | joblib | `.pkl` serialization of models, encoders, scalers |
| Feature Encoding | scikit-learn LabelEncoder | Categorical → integer |
| Feature Scaling | scikit-learn StandardScaler | Normalise numerical features |
| Backend Integration | Spring Boot + RestTemplate | HTTP client to Flask |
| Frontend State | React Context API | Global skin profile |
| Frontend Storage | localStorage | Persist skin profile per user |
| Batch API | JavaScript `Promise.all()` | Parallel recommendation calls for all shop products |
