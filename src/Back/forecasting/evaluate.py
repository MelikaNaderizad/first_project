import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error


def report(name, y_true_log, y_pred_log): # nameبرای اینکه ببینیم baselineکدوم بوده
    # nxpm1وارون لگاریتمه 
    y_true = np.expm1(y_true_log)
    y_pred = np.expm1(y_pred_log)

    mae = mean_absolute_error(y_true, y_pred) 
    rmse = np.sqrt(mean_squared_error(y_true, y_pred)) # -> تابع mean_squared_errorخطاهارو بتوان 2 میرسونه و میانگین میگیره 
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100 # درصد خطا

    print(f"{name:<18} MAE={mae:>10,.0f}   RMSE={rmse:>10,.0f}   MAPE={mape:>6.1f}%")
    return y_pred