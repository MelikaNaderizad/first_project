from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from forecasting.data import load_monthly_series

MODEL_PATH = Path(__file__).parent / "model.joblib"
PLOTS = Path(__file__).parent / "plots"
PLOTS.mkdir(exist_ok=True)


def forecast(n_months=6):
    saved = joblib.load(MODEL_PATH)
    model, features = saved["model"], saved["features"]

    raw = load_monthly_series()
    history = list(np.log1p(raw["comment_count"]))   # y همه ماه‌های گذشته

    last_year = int(raw["year"].iloc[-1])
    last_month = int(raw["month"].iloc[-1])
    last_t = int(raw["t"].iloc[-1])

    rows = []
    for i in range(1, n_months + 1):
        month = (last_month + i - 1) % 12 + 1
        year = last_year + (last_month + i - 1) // 12
        t = last_t + i

        row = {
            "t": t,
            "lag_1": history[-1],
            "rolling_3": np.mean(history[-3:]),
        }
        for m in range(1, 13):
            row[f"m_{m}"] = 1 if m == month else 0

        X_new = pd.DataFrame([row])[features]
        y_hat = model.predict(X_new)[0]

        history.append(y_hat)     # حدس را به تاریخچه اضافه می‌کنیم
        rows.append({
            "year": year,
            "month": month,
            "t": t,
            "predicted_comments": float(np.expm1(y_hat)),
        })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    raw = load_monthly_series()
    future = forecast(n_months=6)
    print(future)

    plt.figure(figsize=(11, 4))
    plt.plot(raw["t"], raw["comment_count"], marker="o", markersize=3, label="History")
    plt.plot(future["t"], future["predicted_comments"], marker="s", label="Forecast")
    plt.title("History and forecast")
    plt.xlabel("t (month index)")
    plt.ylabel("comments")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.savefig(PLOTS / "03_forecast.png", dpi=120, bbox_inches="tight")
    plt.close()