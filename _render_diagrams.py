"""Extract every mermaid block from the whitepaper and render each to PNG.

Rendering runs locally through the installed Chrome — the diagram content never
leaves this machine.
"""

import os
import re
import json
import subprocess
import sys

BASE = r"C:\Users\Kuziwa\Desktop\Treasury"
SRC = os.path.join(BASE, "Treasury-ALM-Risk-Platform-Implementation-Whitepaper.md")
IMG_DIR = os.path.join(BASE, "diagrams")
WORK = os.path.join(os.environ["TEMP"], "mermaid-render")
MMDC = os.path.join(WORK, "node_modules", ".bin", "mmdc.cmd")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Slug per diagram, in document order, so filenames are meaningful.
SLUGS = [
    "01-domain-map",
    "02-eod-dag",
    "03-tier-a-critical-path",
    "04-phase0-dependency-graph",
]

CONFIG = {
    "theme": "base",
    "themeVariables": {
        "fontFamily": "Calibri, Segoe UI, sans-serif",
        "fontSize": "15px",
        "primaryColor": "#EAF0F6",
        "primaryTextColor": "#1F3A5F",
        "primaryBorderColor": "#2E6B8A",
        "lineColor": "#2E6B8A",
        "secondaryColor": "#F2F5F8",
        "tertiaryColor": "#FFFFFF",
        "clusterBkg": "#F7F9FB",
        "clusterBorder": "#C3D2DE",
    },
    "flowchart": {"curve": "basis", "nodeSpacing": 45, "rankSpacing": 55},
}

PUPPETEER = {
    "executablePath": CHROME,
    "args": ["--no-sandbox", "--disable-dev-shm-usage"],
}


def extract(md):
    """Return list of (index, mermaid_source) in document order."""
    out, lines, i, n = [], md.split("\n"), 0, len(md.split("\n"))
    while i < n:
        if lines[i].strip().lower().startswith("```mermaid"):
            buf, i = [], i + 1
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            out.append("\n".join(buf))
        i += 1
    return out


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    with open(SRC, encoding="utf-8") as f:
        md = f.read()

    blocks = extract(md)
    print(f"found {len(blocks)} mermaid block(s)")

    cfg_path = os.path.join(WORK, "mermaid-config.json")
    pup_path = os.path.join(WORK, "puppeteer-config.json")
    with open(cfg_path, "w", encoding="utf-8") as f:
        json.dump(CONFIG, f)
    with open(pup_path, "w", encoding="utf-8") as f:
        json.dump(PUPPETEER, f)

    results = []
    for idx, src in enumerate(blocks):
        slug = SLUGS[idx] if idx < len(SLUGS) else f"{idx + 1:02d}-diagram"
        mmd = os.path.join(WORK, f"{slug}.mmd")
        png = os.path.join(IMG_DIR, f"{slug}.png")
        with open(mmd, "w", encoding="utf-8") as f:
            f.write(src)

        cmd = [
            MMDC, "-i", mmd, "-o", png,
            "-c", cfg_path, "-p", pup_path,
            "-b", "white", "-s", "3",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        ok = os.path.exists(png)
        size = os.path.getsize(png) if ok else 0
        print(f"  [{'ok ' if ok else 'FAIL'}] {slug}.png  {size:,} bytes")
        if not ok:
            print("       stderr:", (r.stderr or "").strip()[:400])
        results.append((slug, ok))

    failed = [s for s, ok in results if not ok]
    if failed:
        print("\nFAILED:", ", ".join(failed))
        sys.exit(1)
    print("\nall diagrams rendered ->", IMG_DIR)


if __name__ == "__main__":
    main()
