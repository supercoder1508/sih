import numpy as np
import pandas as pd
from hybrid_model import HybridRiskPredictor

X = np.random.rand(200, 10)
y_cls = pd.Series(np.random.randint(0, 2, 200))
y_crs = pd.Series(np.random.rand(200) * 100)
y_days = pd.Series(np.random.rand(200) * 365)

def test_hybrid_quick():
    model_params = {
        'lgb': {'n_estimators': 5, 'early_stopping_rounds': 5},
        'xgb': {'n_estimators': 5, 'early_stopping_rounds': 5},
        'cat': {'n_estimators': 5, 'early_stopping_rounds': 5},
        'tab': {'max_epochs': 1},
        'ftt': {'epochs': 1}
    }
    model = HybridRiskPredictor(random_state=42, model_params=model_params)
    model.fit(X, y_cls, y_crs, y_days)

if __name__ == '__main__':
    test_hybrid_quick()

