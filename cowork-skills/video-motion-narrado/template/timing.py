import json, re, unicodedata, math
from pathlib import Path
D = Path(__file__).parent
import sys; sys.path.insert(0, str(D))
W = json.loads((D / "words.json").read_text())
def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))
from anchors import ANCH  # (id_da_cena, primeiras palavras da cena) — edite anchors.py
NW = [norm(w["w"]) for w in W]
idx, pos = [], 0
for sid, a in ANCH:
    toks = [norm(x) for x in a.split()]
    for i in range(pos, len(W)):
        if NW[i:i+len(toks)] == toks:
            idx.append((sid, i)); pos = i + 1; break
    else:
        raise SystemExit(f"anchor not found: {sid} {a}")
BEAT = 0.5
END_TITLE = 2.0   # título final (meio compasso + respiro)
total_voice = W[-1]["e"]
TOTAL = math.ceil((total_voice + 1.0 + END_TITLE) / 2.0) * 2.0  # termina no fim de um compasso
scenes = []
for k, (sid, i) in enumerate(idx):
    st = 0.0 if k == 0 else math.floor((W[i]["s"] - 0.2) / BEAT) * BEAT
    scenes.append({"id": sid, "start": st, "w0": i})
for k, s in enumerate(scenes):
    s["end"] = scenes[k+1]["start"] if k + 1 < len(scenes) else TOTAL - END_TITLE
scenes.append({"id": "end", "start": TOTAL - END_TITLE, "end": TOTAL, "w0": len(W)})
short = [s for s in scenes if s["end"] - s["start"] < 2.0]
data = {"total": TOTAL, "beat": BEAT, "words": [[w["w"], w["s"], w["e"]] for w in W], "scenes": scenes}
(D / "data.js").write_text("window.DATA=" + json.dumps(data, ensure_ascii=False) + ";")
print("TOTAL", TOTAL, "s | cenas", len(scenes), "| curtas(<2s):", [(s["id"], s["end"]-s["start"]) for s in short])
for s in scenes[:3] + scenes[-3:]: print(s)
