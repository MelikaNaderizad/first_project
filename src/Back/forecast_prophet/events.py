import pandas as pd

from .config import DATA_DIR

HOLIDAYS_CSV = DATA_DIR / "iran_holidays_1398_1402.csv"

EVENTS = {
    "nowruz": "نوروز",
}


def load_holidays():
    if not HOLIDAYS_CSV.exists():
        raise FileNotFoundError(f"Put the holidays CSV here: {HOLIDAYS_CSV}")
    df = pd.read_csv(HOLIDAYS_CSV, encoding="utf-8-sig")
    df["ds"] = pd.to_datetime(df["ds"])
    return df


def add_event_flags(df):
    """برای هر رویداد یک ستون ۰/۱: ماهی که آن رویداد در آن می‌افتد = ۱."""
    hol = load_holidays()
    df = df.copy()
    months = df["ds"].dt.to_period("M")
    for col, pattern in EVENTS.items():
        ev = hol[hol["holiday"].str.contains(pattern)]
        ev_months = ev["ds"].dt.to_period("M").unique()
        df[col] = months.isin(ev_months).astype(int)
    return df