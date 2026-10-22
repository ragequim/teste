"""Áudio e entrega.
  python mix.py audio            -> narration.wav + trilha normalizada + final_mix.wav (trilha abaixa sob a voz)
  python mix.py mux <video.mp4> <saida.mp4>  -> junta vídeo + final_mix
  python mix.py srt <saida.srt>  -> legendas .srt (para subir no YouTube)
"""
import json, os, subprocess, sys
from pathlib import Path
D = Path(__file__).parent
FF = os.environ.get("FFMPEG", "ffmpeg")
data = json.loads((D / "data.js").read_text()[len("window.DATA="):-1])
TOTAL = data["total"]
def run(*a): subprocess.run([FF, "-v", "error", "-y", *a], check=True)
cmd = sys.argv[1]
if cmd == "audio":
    P = json.loads((D / "paragraphs.json").read_text()); inp, flt = [], []
    for i, p in enumerate(P):
        inp += ["-i", p["wav"]]; flt.append(f"[{i}:a]adelay={int(p['start']*1000)}:all=1[a{i}]")
    flt.append("".join(f"[a{i}]" for i in range(len(P))) + f"amix=inputs={len(P)}:normalize=0,apad,atrim=0:{TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[o]")
    run(*inp, "-filter_complex", ";".join(flt), "-map", "[o]", "-ar", "48000", "-ac", "2", str(D / "audio/narration.wav"))
    run("-i", str(D / "audio/music.wav"), "-af", "loudnorm=I=-24:TP=-2:LRA=11,aresample=48000", "-ac", "2", str(D / "audio/music_norm.wav"))
    run("-i", str(D / "audio/music_norm.wav"), "-i", str(D / "audio/narration.wav"), "-filter_complex",
        "[1]asplit=2[sc][voz];[0][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450:makeup=1[duck];"
        "[duck][voz]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95[out]", "-map", "[out]", "-ar", "48000", str(D / "audio/final_mix.wav"))
    print("audio/final_mix.wav pronto")
elif cmd == "mux":
    run("-i", sys.argv[2], "-i", str(D / "audio/final_mix.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", sys.argv[3])
    print("ok", sys.argv[3])
elif cmd == "srt":
    W = data["words"]; pages, cur = [], []
    for w in W:
        cur.append(w)
        if len(cur) >= 8 or w[0][-1] in ",.:;?!": pages.append(cur); cur = []
    if cur: pages.append(cur)
    def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)) % 1000:03}"
    Path(sys.argv[2]).write_text("\n".join(f"{i}\n{ts(p[0][1])} --> {ts(p[-1][2])}\n{' '.join(x[0] for x in p)}\n" for i, p in enumerate(pages, 1)), encoding="utf-8")
    print("ok", sys.argv[2])
elif cmd == "chapters":
    ids = sys.argv[2:]  # ids de cena que abrem capítulos
    for s in data["scenes"]:
        if s["id"] in ids: print("%d:%02d" % divmod(int(s["start"]), 60), s["id"])
