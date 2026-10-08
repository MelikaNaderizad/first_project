import logging

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from prophet import Prophet
from prophet.utilities import regressor_coefficients

from .config import PLOT_DIR, PRODUCT_ID
from .data import build_series, split_train_test
from .events import EVENTS, add_event_flags

# Silence cmdstanpy's INFO logs (start/done processing)
_logger = logging.getLogger("cmdstanpy")
_logger.addHandler(logging.NullHandler())
_logger.propagate = False
_logger.setLevel(logging.CRITICAL)


def scores(name, y_true, y_pred):
    err = y_true - y_pred
    mae = np.mean(np.abs(err))
    rmse = np.sqrt(np.mean(err ** 2))
    print(f"{name:<24} MAE={mae:6.2f}   RMSE={rmse:6.2f}")


def main():
    PLOT_DIR.mkdir(parents=True, exist_ok=True)

    series = build_series()
    train, test = split_train_test(series)
    y_test = test["y"].to_numpy()

    # --- baselines ---
    train_mean = np.full(len(test), train["y"].mean())
    scores("Baseline: train mean", y_test, train_mean)

    last_year = series["y"].shift(12).iloc[-len(test):].to_numpy()
    scores("Baseline: same month LY", y_test, last_year)

    # --- Prophet: trend + one 0/1 regressor per event ---
    train_e = add_event_flags(train)

    # (اگر پارامترهای دیگری مثل changepoint_range گذاشته‌ای، اینجا نگه دار)
    m = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=False,
    )
    for name in EVENTS:
        m.add_regressor(name)
    m.fit(train_e)

    future = add_event_flags(
        m.make_future_dataframe(periods=len(test), freq="MS")
    )
    forecast = m.predict(future)
    fc = forecast.set_index("ds").loc[test["ds"]]
    pred = fc["yhat"].clip(lower=0).to_numpy()
    scores("Prophet + events", y_test, pred)

    # --- effect of each event (comments per month) ---
    print("\nEffect of each event (extra comments in a month with the event):")
    coefs = regressor_coefficients(m)[["regressor", "coef"]]
    coefs["coef"] = coefs["coef"].round(2)
    print(coefs.to_string(index=False))

    # --- comparison table ---
    flags = future.set_index("ds").loc[test["ds"], list(EVENTS)]
    cmp = pd.DataFrame({
        "ds": test["ds"].dt.strftime("%Y-%m"),
        "actual": y_test,
        "mean": train_mean.round(1),
        "same_LY": last_year,
        "prophet": pred.round(1),
    })
    for name in EVENTS:
        cmp[name] = flags[name].to_numpy()
    print()
    print(cmp.to_string(index=False))

    # --- plot 1: actual vs forecast ---
    plt.figure(figsize=(11, 4))
    plt.plot(train["ds"], train["y"], marker="o", markersize=3, label="Train")
    plt.plot(test["ds"], y_test, marker="o", label="Actual (test)")
    plt.plot(test["ds"], pred, marker="s", label="Prophet + events")
    plt.fill_between(test["ds"], fc["yhat_lower"].clip(lower=0), fc["yhat_upper"],
                     alpha=0.2, label="80% interval")
    plt.title(f"Prophet, product {PRODUCT_ID}")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.savefig(PLOT_DIR / "prophet_forecast.png", dpi=120, bbox_inches="tight")
    plt.close()

    # --- plot 2: contribution of each event over time ---
    fig, ax = plt.subplots(figsize=(11, 4))
    for name in EVENTS:
        ax.plot(forecast["ds"], forecast[name], marker="o", markersize=3, label=name)
    ax.axhline(0, color="gray", lw=0.8)
    ax.axvline(test["ds"].iloc[0], color="gray", ls="--", lw=0.8)
    ax.set_title("Contribution of each event (comments)")
    ax.legend()
    ax.grid(alpha=0.3)
    fig.savefig(PLOT_DIR / "prophet_events.png", dpi=120, bbox_inches="tight")
    plt.close(fig)

    # --- plot 3: trend + total extra-regressors (Prophet's own) ---
    comp = m.plot_components(forecast)
    comp.savefig(PLOT_DIR / "prophet_components.png", dpi=120, bbox_inches="tight")
    plt.close(comp)


if __name__ == "__main__":
    main()