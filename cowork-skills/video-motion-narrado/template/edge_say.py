"""edge-tts com o CA do proxy (verificação TLS mantida)."""
import asyncio, ssl, sys
import edge_tts.communicate as c
import os
_CA = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
if _CA:
    c._SSL_CTX = ssl.create_default_context(cafile=_CA)
import edge_tts

async def say(text, voice, out, rate="+0%", pitch="+0Hz"):
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(out)

if __name__ == "__main__":
    text, voice, out = sys.argv[1:4]
    rate = sys.argv[4] if len(sys.argv) > 4 else "+0%"
    asyncio.run(say(text, voice, out, rate))
