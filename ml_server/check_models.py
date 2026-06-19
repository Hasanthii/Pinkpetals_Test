import joblib
from pathlib import Path

BASE = Path(__file__).parent
m1 = joblib.load(BASE / 'xgboost_model.pkl')
m2 = joblib.load(BASE / 'reviews_xgboost_model.pkl')

print("xgboost_model.pkl features:", getattr(m1, 'n_features_in_', 'unknown'))
print("reviews_xgboost_model.pkl features:", getattr(m2, 'n_features_in_', 'unknown'))
