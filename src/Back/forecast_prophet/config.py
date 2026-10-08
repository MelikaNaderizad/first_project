from pathlib import Path

BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "models"
PLOT_DIR = BASE_DIR / "plots"
DATA_DIR = BASE_DIR.parent / "database"   # back/database

PRODUCT_ID = 4229502     # رول ضد تعریق مردانه
YEAR_FROM = 1398
YEAR_TO = 1402
TEST_MONTHS = 8         # چند ماه آخر برای ارزیابی کنار گذاشته می‌شه