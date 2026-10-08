import numpy as np
import numpy as np
import pandas as pd


def add_features(df):
    df = df.copy()   # تا DataFrame اصلی تغییر نکند

    # هدف را لگاریتم می‌گیریم تا رشد چندبرابری آرام‌تر شود
    df["y"] = np.log1p(df["comment_count"])

    # فروش ماه قبل (یک ماه عقب‌تر)
    df["lag_1"] = df["y"].shift(1)

    # میانگین ۳ ماه قبل (shift(1) یعنی ماه جاری را داخل میانگین نمی‌گذاریم)
    df["rolling_3"] = df["y"].shift(1).rolling(3).mean()

    # ماه را به صورت ۱۲ ستون صفر و یک در می‌آوریم (اسفند = ستون ۱۲ برابر ۱)
    month_dummies = pd.get_dummies(df["month"], prefix="m", dtype=int)
    df = pd.concat([df, month_dummies], axis=1) # axis=1 یعنی ستون‌ها را به هم بچسبانیم

    # سطرهای اول که lag ندارند (NaN) را حذف می‌کنیم
    df = df.dropna().reset_index(drop=True)
    return df