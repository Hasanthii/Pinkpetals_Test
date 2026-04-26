from flask import Flask, request, jsonify
import joblib
import json
import numpy as np
from pathlib import Path
from datetime import datetime

app = Flask(__name__)

BASE = Path(__file__).parent

# Load everything once when server starts
model      = joblib.load(BASE / 'xgboost_model.pkl')
brand_map  = json.loads((BASE / 'brand_map.json').read_text())
subcat_map = json.loads((BASE / 'subcat_map.json').read_text())
cat_medians = json.loads((BASE / 'cat_medians.json').read_text())

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status'    : 'ok',
        'brands'    : len(brand_map),
        'categories': len(subcat_map)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        brand        = data.get('brand', '')
        sub_category = data.get('subCategory', '')
        date_str     = data.get('date', '')
        unit_price   = float(data.get('unitPrice', 10.0))
        lag_revenue1 = float(data.get('lagRevenue1', 0.0))
        rolling_rev7 = float(data.get('rollingRev7', 0.0))
        is_discounted = int(data.get('isDiscounted', 0))

        # Parse date
        date = datetime.strptime(date_str, '%Y-%m-%d')

        # Encode brand and sub-category same way as training
        brand_encoded  = brand_map.get(brand, -1)
        subcat_encoded = subcat_map.get(sub_category, -1)

        # Relative price index (same as notebook)
        cat_median = cat_medians.get(sub_category, 10.0)
        relative_price_index = unit_price / (cat_median if cat_median else 1.0)

        # Build feature array — must match training order exactly
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

        prediction = float(model.predict(features)[0])

        return jsonify({
            'predictedRevenue': round(prediction, 2),
            'brand'           : brand,
            'subCategory'     : sub_category,
            'date'            : date_str
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/brands', methods=['GET'])
def get_brands():
    return jsonify({'brands': list(brand_map.keys())})

@app.route('/categories', methods=['GET'])
def get_categories():
    return jsonify({'categories': list(subcat_map.keys())})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)