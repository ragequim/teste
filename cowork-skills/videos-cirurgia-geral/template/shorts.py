"""Cortes verticais 1080x1920 (Shorts/Reels/TikTok) a partir da animação, sem legenda embutida."""
import json, os, subprocess
from pathlib import Path
D = Path(__file__).resolve().parent
OUT = D / "shorts"; OUT.mkdir(exist_ok=True)
data = json.loads((D / "data.js").read_text()[len("window.DATA="):-1])
W, S = data["words"], {s["id"]: s for s in data["scenes"]}
order = [s["id"] for s in data["scenes"]]
FPS = 60
def _ff_with_ass():
    for c in [os.environ.get("FFMPEG"), "ffmpeg", "/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/opt/homebrew/bin/ffmpeg"]:
        if not c: continue
        try:
            if " ass " in subprocess.run([c, "-hide_banner", "-filters"], capture_output=True, text=True).stdout: return c
        except FileNotFoundError: pass
    raise SystemExit("Nenhum ffmpeg com libass encontrado (necessário para legendas dos cortes).")
FFASS = _ff_with_ass()

import sys; sys.path.insert(0, str(D))
import cuts  # edite cuts.py
CUTS = cuts.CUTS
TAG = getattr(cuts, 'TAG', '')

def ts(t):
    t = max(t, 0); return f"{int(t // 3600)}:{int(t % 3600 // 60):02}:{t % 60:05.2f}"

def build_ass(words, dur, l1, l2, path):
    hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,Inter,84,&H00ECF2F4,&H00ECF2F4,&H000A0A0A,&H00000000,0,0,0,0,100,100,0,0,1,0,0,8,60,60,250,1
Style: Cap,Inter,74,&H00ECF2F4,&H00ECF2F4,&H000A0A0A,&H00000000,0,0,0,0,100,100,0,0,1,6,0,5,70,70,0,1
Style: Tag,Inter,34,&H0027B6FF,&H0027B6FF,&H000A0A0A,&H00000000,0,0,0,0,100,100,4,0,1,0,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 0,{ts(0)},{ts(dur)},Hook,,0,0,0,,{{\\fad(200,0)}}{l1}\\N{{\\c&H9DC319&}}{l2}",
          f"Dialogue: 0,{ts(0)},{ts(dur)},Tag,,0,0,0,,{{\\pos(540,1500)}}{TAG}"]
    pages, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or w[0][-1] in ",.:;?!": pages.append(cur); cur = []
    if cur: pages.append(cur)
    flat = [w for p in pages for w in p]
    for pg in pages:
        for i, w in enumerate(pg):
            k = flat.index(w)
            e = pg[i + 1][1] if i + 1 < len(pg) else w[2] + 0.15
            if k + 1 < len(flat): e = min(e, flat[k + 1][1])
            txt = " ".join((f"{{\\c&H9DC319&}}{x[0]}{{\\c&HECF2F4&}}" if j == i else x[0]) for j, x in enumerate(pg))
            ev.append(f"Dialogue: 1,{ts(w[1])},{ts(e)},Cap,,0,0,0,,{{\\pos(540,1330)}}{txt}")
    Path(path).write_text(hdr + "\n".join(ev) + "\n", encoding="utf-8")

for name, a, b, l1, l2 in CUTS:
    w0, w1 = S[a]["w0"], S[order[order.index(b) + 1]]["w0"] - 1
    t0 = round((W[w0][1] - 0.3) * FPS) / FPS
    t1 = round((W[w1][2] + 0.5) * FPS) / FPS
    dur = t1 - t0
    land = OUT / f"_{name}_16x9.mp4"
    if not land.exists():
        subprocess.run(["node", "render.mjs", str(land), "60", "1920", "3", "4", str(t0), str(t1)], cwd=D, check=True,
                       env={**os.environ, "NOCAP": "1"}, stdout=subprocess.DEVNULL)
    words = [[w[0], w[1] - t0, w[2] - t0] for w in W[w0:w1 + 1]]
    ass = OUT / f"_{name}.ass"; build_ass(words, dur, l1, l2, ass)
    vf = ("[0:v]split=2[a][b];[a]scale=-1:1920,crop=1080:1920,scale=270:480,boxblur=30:3,scale=1080:1920,eq=brightness=-0.05[bg];"
          "[b]crop=1800:1080:60:0,scale=1080:-2[fg];[bg][fg]overlay=0:530,"
          f"ass={ass}:fontsdir={D / 'fonts'},fade=t=in:d=0.15,fade=t=out:st={dur - 0.3:.2f}:d=0.3[v]")
    subprocess.run([FFASS, "-v", "error", "-y", "-i", str(land), "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(D / "audio/final_mix.wav"),
                    "-filter_complex", vf, "-map", "[v]", "-map", "1:a", "-af", f"afade=t=in:d=0.12,afade=t=out:st={dur - 0.4:.2f}:d=0.4",
                    "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "60", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", "-shortest", str(OUT / f"short_{name}.mp4")], check=True)
    print("ok", name, round(dur, 1), "s", flush=True)
