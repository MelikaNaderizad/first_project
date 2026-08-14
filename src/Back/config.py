from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
print(CURRENT_FILE)

PROJECT_ROOT = CURRENT_FILE.parent.parent.parent 

DATA_DIR = PROJECT_ROOT / "src" / "data" / "dataset"

COMMENTS_CSV = DATA_DIR / "digikala-comments.csv"
PRODUCTS_CSV = DATA_DIR / "digikala-products.csv"