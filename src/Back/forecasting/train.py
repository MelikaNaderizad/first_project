from pathlib import Path
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import joblib

from forecasting.data import load_monthly_series
from forecasting.features import add_features
from forecasting.evaluate import report

PLOTS = Path(__file__).parent / "plots"
PLOTS.mkdir(exist_ok=True)

# ۱. داده و ویژگی
raw = load_monthly_series()
df = add_features(raw)

# ۲. نمودار اول: کل سری (قبل از هر مدلی)
plt.figure(figsize=(11, 4))
plt.plot(raw["t"], raw["comment_count"], marker="o", markersize=3)
plt.title("Monthly buyer comments")
plt.xlabel("t (month index)")
plt.ylabel("comments")
plt.grid(alpha=0.3)
plt.savefig(PLOTS / "01_series.png", dpi=120, bbox_inches="tight")
plt.close()

# ۳. تقسیم زمانی: ۱۲ ماه آخر تست، بقیه آموزش
TEST_SIZE = 12
train, test = df.iloc[:-TEST_SIZE], df.iloc[-TEST_SIZE:]

month_cols = [c for c in df.columns if c.startswith("m_")]
FEATURES = ["t", "lag_1", "rolling_3"] + month_cols

X_train, y_train = train[FEATURES], train["y"]
X_test, y_test = test[FEATURES], test["y"]

# ۴. baseline: «همان مقدار ماه قبل»
report("Baseline (lag_1)", y_test, test["lag_1"])

# ۵. Linear Regression
model = LinearRegression()
model.fit(X_train, y_train)
pred = model.predict(X_test)
y_pred_real = report("LinearRegression", y_test, pred)

# ۶. نمودار دوم: واقعی در برابر پیش‌بینی روی ماه‌های تست
import numpy as np
plt.figure(figsize=(11, 4))
plt.plot(test["t"], np.expm1(y_test), marker="o", label="Actual")
plt.plot(test["t"], y_pred_real, marker="s", label="Predicted")
plt.title("Actual vs Predicted (test period)")
plt.xlabel("t (month index)")
plt.ylabel("comments")
plt.legend()
plt.grid(alpha=0.3)
plt.savefig(PLOTS / "02_actual_vs_pred.png", dpi=120, bbox_inches="tight")
plt.close()

# مدل نهایی را روی کل داده (آموزش + تست) دوباره آموزش می‌دهیم
final_model = LinearRegression()
final_model.fit(df[FEATURES], df["y"])

MODEL_PATH = Path(__file__).parent / "model.joblib"
joblib.dump({"model": final_model, "features": FEATURES}, MODEL_PATH)
print("model saved in:", MODEL_PATH)

print("plots saved in:", PLOTS)