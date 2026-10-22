import json, re, subprocess, unicodedata, difflib, sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel
D = Path(__file__).parent; sys.path.insert(0, str(D))
from script import PARAGRAPHS
segs = json.loads((D / "paragraphs.json").read_text())
model = WhisperModel("small", device="cpu", compute_type="int8")
def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))
def load(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
out = []
for sg, text in zip(segs, PARAGRAPHS):
    cap = [w for w in text.split() if w != "—"]
    a = [norm(w) for w in cap]
    audio = load(sg["wav"]); dur = len(audio) / 16000
    best = None
    for prompt in (text[-800:], None):
        s, _ = model.transcribe(audio, language="pt", word_timestamps=True, initial_prompt=prompt)
        heard = [w for x in s for w in x.words]
        b = [norm(w.word) for w in heard]
        times = [None] * len(cap)
        for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
            for k in range(blk.size):
                times[blk.a + k] = [heard[blk.b + k].start, heard[blk.b + k].end]
        m = sum(t is not None for t in times)
        if best is None or m > best[0]: best = (m, times)
        if m >= 0.95 * len(cap): break
    m, times = best
    i = 0
    while i < len(cap):
        if times[i] is not None: i += 1; continue
        j = i
        while j < len(cap) and times[j] is None: j += 1
        t0 = times[i-1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < len(cap) else dur
        if t1 <= t0: t1 = t0 + 0.2 * (j - i)
        L = [max(len(c), 2) for c in cap[i:j]]; acc = t0
        for k, l in enumerate(L):
            d = (t1 - t0) * l / sum(L); times[i+k] = [acc, acc + d]; acc += d
        i = j
    for k, w in enumerate(cap):
        out.append({"w": w, "s": round(sg["start"] + times[k][0], 3), "e": round(sg["start"] + times[k][1], 3), "p": sg["p"]})
    print(f'p{sg["p"]}: {m}/{len(cap)} casadas', flush=True)
for k in range(1, len(out)):
    out[k]["s"] = max(out[k]["s"], out[k-1]["e"]) if out[k]["s"] < out[k-1]["e"] else out[k]["s"]
    out[k]["e"] = max(out[k]["e"], out[k]["s"] + 0.06)
(D / "words.json").write_text(json.dumps(out, ensure_ascii=False))
print(len(out), "palavras")
