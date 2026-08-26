import glob
import shutil
from pathlib import Path

assets = Path(
    r"C:\Users\Administrator\.cursor\projects"
    r"\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
)
matches = list(assets.glob("*USE_4-b7d2781a*"))
if not matches:
    matches = list(assets.glob("*07b14425*"))
if not matches:
    raise SystemExit(f"No source in {assets}")

src = matches[0]
dest = Path(__file__).resolve().parents[1] / "src/data/img/twinzy_cards_source.png"
dest.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(src, dest)
print(src)
print(dest)
print(dest.stat().st_size)
