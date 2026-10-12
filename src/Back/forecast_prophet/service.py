import logging

import jdatetime
import numpy as np
import pandas as pd
from prophet import Prophet
from prophet.utilities import regressor_coefficients

from .data import build_series, split_train_test
from .events import EVENTS, add_event_flags

logging.getLogger("cmdstanpy").setLevel(logging.CRITICAL)

MIN_MONTHS = 24      # کمتر از این، پیش‌بینی معنی ندارد
FUTURE_MONTHS = 6


def _fit(df: pd.DataFrame) -> Prophet:
    m = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=False,
    )
    for name in EVENTS:
        m.add_regressor(name)
    m.fit(add_event_flags(df))
    return m


def _predict(m: Prophet, ds: pd.Series) -> pd.DataFrame:
    future = add_event_flags(pd.DataFrame({"ds": ds}))
    fc = m.predict(future)
    for col in ("yhat", "yhat_lower", "yhat_upper"):
        fc[col] = fc[col].clip(lower=0)
    return fc


def _label(ts: pd.Timestamp) -> dict:
    # ds اول ماه میلادی است؛ روز ۱۵ همان ماه، به همان ماه شمسیِ اصلی برمی‌گردد
    j = jdatetime.date.fromgregorian(date=ts.replace(day=15).date())
    return {"ds": ts.strftime("%Y-%m"), "year": j.year, "month": j.month}


def forecast_product(product_id: int, future_months: int = FUTURE_MONTHS) -> dict | None:
    series = build_series(product_id)
    if len(series) < MIN_MONTHS:
        return None

    train, test = split_train_test(series)
    y_test = test["y"].to_numpy()

    # ---- backtest: مدل فقط روی train ----
    m_train = _fit(train)
    bt = _predict(m_train, test["ds"])
    pred = bt["yhat"].to_numpy()

    err = y_test - pred
    base_mean = np.full(len(test), train["y"].mean())
    metrics = {
        "mae": float(np.mean(np.abs(err))),
        "rmse": float(np.sqrt(np.mean(err ** 2))),
        "baseline_mean_mae": float(np.mean(np.abs(y_test - base_mean))),
    }

    # ---- پیش‌بینی آینده: مدل روی کل داده ----
    m_full = _fit(series)
    last = series["ds"].iloc[-1]
    future_ds = pd.Series(pd.date_range(last, periods=future_months + 1, freq="MS")[1:])
    fu = _predict(m_full, future_ds)

    coefs = regressor_coefficients(m_full)[["regressor", "coef"]]

    return {
        "product_id": product_id,
        "history": [{**_label(r.ds), "y": int(r.y)} for r in train.itertuples()],
        "backtest": [
            {**_label(ds), "actual": int(a), "predicted": round(p, 1),
             "lower": round(lo, 1), "upper": round(up, 1)}
            for ds, a, p, lo, up in zip(
                test["ds"], y_test, pred, bt["yhat_lower"], bt["yhat_upper"])
        ],
        "forecast": [
            {**_label(r.ds), "predicted": round(r.yhat, 1),
             "lower": round(r.yhat_lower, 1), "upper": round(r.yhat_upper, 1)}
            for r in fu.itertuples()
        ],
        "metrics": {k: round(v, 2) for k, v in metrics.items()},
        "events": [{"name": r.regressor, "coef": round(float(r.coef), 2)}
                   for r in coefs.itertuples()],
    }


if __name__ == "__main__":
    import json, sys
    pid = int(sys.argv[1]) if len(sys.argv) > 1 else 4229502
    print(json.dumps(forecast_product(pid), ensure_ascii=False, indent=2))