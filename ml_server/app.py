from flask import Flask, request, jsonify
import joblib
import json
import numpy as np
from pathlib import Path
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE = Path(__file__).parent

# ── Load Sales Prediction Model ───────────────────────────────────────
sales_model   = joblib.load(BASE / 'xgboost_model.pkl')
brand_map     = json.loads((BASE / 'brand_map.json').read_text())
subcat_map    = json.loads((BASE / 'subcat_map.json').read_text())
cat_medians   = json.loads((BASE / 'cat_medians.json').read_text())

# ── Load Reviews Recommendation Model ────────────────────────────────
reviews_model    = joblib.load(BASE / 'reviews_xgboost_model.pkl')
reviews_scaler   = joblib.load(BASE / 'reviews_scaler.pkl')
reviews_encoders = joblib.load(BASE / 'reviews_label_encoders.pkl')
cat_avg_price    = json.loads((BASE / 'reviews_cat_avg_price.json').read_text())

print("Sales model loaded")
print("Reviews recommendation model loaded")

# ═══════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status'          : 'ok',
        'sales_model'     : 'loaded',
        'reviews_model'   : 'loaded',
        'brands'          : len(brand_map),
        'categories'      : len(subcat_map)
    })

# ═══════════════════════════════════════════════════════════════════════
# SALES PREDICTION ENDPOINTS (for Admin Dashboard)
# ═══════════════════════════════════════════════════════════════════════
@app.route('/predict', methods=['POST'])
def predict_sales():
    try:
        data         = request.json
        brand        = data.get('brand', '')
        sub_category = data.get('subCategory', '')
        date_str     = data.get('date', '')
        unit_price   = float(data.get('unitPrice', 10.0))
        lag_revenue1 = float(data.get('lagRevenue1', 0.0))
        rolling_rev7 = float(data.get('rollingRev7', 0.0))
        is_discounted= int(data.get('isDiscounted', 0))

        date = datetime.strptime(date_str, '%Y-%m-%d')

        brand_encoded  = brand_map.get(brand, -1)
        subcat_encoded = subcat_map.get(sub_category, -1)

        cat_median = cat_medians.get(sub_category, 10.0)
        relative_price_index = unit_price / (cat_median if cat_median else 1.0)

        features = np.array([[
            brand_encoded,
            subcat_encoded,
            date.weekday(),
            date.day,
            date.month,
            lag_revenue1,
            rolling_rev7,
            relative_price_index,
            is_discounted
        ]])

        prediction = float(sales_model.predict(features)[0])

        return jsonify({
            'predictedRevenue': round(prediction, 2),
            'brand'           : brand,
            'subCategory'     : sub_category,
            'date'            : date_str,
            'currency'        : 'USD'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/brands', methods=['GET'])
def get_brands():
    return jsonify({'brands': list(brand_map.keys())})


@app.route('/categories', methods=['GET'])
def get_categories():
    return jsonify({'categories': list(subcat_map.keys())})


# ═══════════════════════════════════════════════════════════════════════
# PRODUCT RECOMMENDATION ENDPOINTS (for Customers)
# ═══════════════════════════════════════════════════════════════════════
@app.route('/recommend', methods=['POST'])
def recommend_product():
    try:
        data         = request.json
        brand_name   = data.get('brandName', '')
        sub_category = data.get('subCategory', '')
        skin_type    = data.get('skinType', 'combination')
        skin_tone    = data.get('skinTone', 'light')
        eye_color    = data.get('eyeColor', 'brown')
        hair_color   = data.get('hairColor', 'black')
        price_usd    = float(data.get('priceUsd', 30.0))

        # ── Encode categorical inputs same way as training ────────────
        def encode(col, value):
            le = reviews_encoders.get(col)
            if le is None:
                return 0
            try:
                return int(le.transform([value])[0])
            except ValueError:
                # Unknown value — use most common class
                return int(le.transform([le.classes_[0]])[0])

        brand_encoded  = encode('brand_name',    brand_name)
        subcat_encoded = encode('sub_categories', sub_category)
        skin_type_enc  = encode('skin_type',     skin_type)
        skin_tone_enc  = encode('skin_tone',     skin_tone)
        eye_color_enc  = encode('eye_color',     eye_color)
        hair_color_enc = encode('hair_color',    hair_color)

        # ── price_vs_cat_avg feature ──────────────────────────────────
        avg_price         = cat_avg_price.get(sub_category, 45.0)
        price_vs_cat_avg  = price_usd - avg_price

        # ── Sentiment score — use neutral default for new products ────
        sentiment_score = float(data.get('sentimentScore', 0.75))

        # ── Build feature array (must match training order exactly) ───
        features_raw = np.array([[
            brand_encoded,
            subcat_encoded,
            skin_type_enc,
            skin_tone_enc,
            eye_color_enc,
            hair_color_enc,
            price_usd,
            sentiment_score,
            price_vs_cat_avg
        ]])

        # ── Scale features ────────────────────────────────────────────
        features_scaled = reviews_scaler.transform(features_raw)

        # ── Predict ───────────────────────────────────────────────────
        prediction   = int(reviews_model.predict(features_scaled)[0])
        probability  = float(reviews_model.predict_proba(features_scaled)[0][1])

        # ── Build insight message ─────────────────────────────────────
        if prediction == 1 and probability >= 0.80:
            insight = "Highly recommended for your skin profile! ⭐"
        elif prediction == 1 and probability >= 0.60:
            insight = "This product is likely a good match for you."
        elif prediction == 0 and probability < 0.40:
            insight = "This product may not suit your skin profile."
        else:
            insight = "Mixed reviews from customers with similar profiles."

        return jsonify({
            'isRecommended'   : bool(prediction),
            'confidence'      : round(probability * 100, 1),
            'insight'         : insight,
            'brandName'       : brand_name,
            'subCategory'     : sub_category,
            'skinType'        : skin_type,
            'skinTone'        : skin_tone
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/skin-types', methods=['GET'])
def get_skin_types():
    le = reviews_encoders.get('skin_type')
    types = list(le.classes_) if le else ['combination','dry','normal','oily']
    return jsonify({'skinTypes': types})


@app.route('/skin-tones', methods=['GET'])
def get_skin_tones():
    le = reviews_encoders.get('skin_tone')
    tones = list(le.classes_) if le else ['fair','light','medium','tan','deep']
    return jsonify({'skinTones': tones})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)