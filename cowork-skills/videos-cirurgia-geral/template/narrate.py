import subprocess, sys, json
from pathlib import Path
D = Path(__file__).parent
sys.path.insert(0, str(D))
from script import PARAGRAPHS
SAY = str(D / "edge_say.py")
VOICE = __import__("os").environ.get("VOICE", "pt-BR-AntonioNeural")
RATE = __import__("os").environ.get("RATE", "+6%")
GAP = 1.0
t = 1.0  # entrada antes da primeira fala (gancho visual)
segs = []
for i, p in enumerate(PARAGRAPHS):
    mp3, wav = D / f"audio/p{i+1}.mp3", D / f"audio/p{i+1}.wav"
    key = D / f"audio/k{__import__('hashlib').md5(p.encode()).hexdigest()[:10]}.mp3"
    if not key.exists():
        subprocess.run([sys.executable, SAY, p, VOICE, str(key), RATE], check=True)
    mp3 = key
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
        "-ar", "48000", "-ac", "1", str(wav)], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)]))
    segs.append({"p": i + 1, "start": round(t, 3), "end": round(t + dur, 3), "wav": str(wav)})
    print(f"p{i+1}: {dur:.1f}s", flush=True)
    t += dur + GAP
(D / "paragraphs.json").write_text(json.dumps(segs, indent=1))
print("total", round(t, 1))
