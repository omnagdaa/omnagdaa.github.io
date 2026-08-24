#!/usr/bin/env python3
"""Render a video into ASCII frames for the site background.

Runs at build time, not in the browser: the output is a small JSON file of
pre-rendered text frames, so visitors never download or decode the source
video. Uses edge detection rather than raw luminance — screen recordings are
mostly flat regions, which turn to featureless mush under a plain brightness
ramp, whereas edges keep window outlines and UI structure legible.

Usage: python3 tools/ascii-bg.py <video> [--out assets/ascii/frames.json]
"""
import argparse, json, subprocess, sys, tempfile, shutil
from pathlib import Path

RAMP = " .:+*#"          # low density: stays faint, compresses well
COLS = 100
CHAR_ASPECT = 0.5        # a monospace cell is ~2x taller than wide
FPS = 8
MAX_FRAMES = 40


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", default="assets/ascii/frames.json")
    ap.add_argument("--cols", type=int, default=COLS)
    ap.add_argument("--fps", type=int, default=FPS)
    ap.add_argument("--max-frames", type=int, default=MAX_FRAMES)
    args = ap.parse_args()

    src = Path(args.video)
    if not src.is_file():
        sys.exit(f"error: no such video: {src}")
    if not shutil.which("ffmpeg"):
        sys.exit("error: ffmpeg not found")

    try:
        from PIL import Image, ImageFilter
        import numpy as np
    except ImportError:
        sys.exit("error: needs Pillow and numpy (pip install pillow numpy)")

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", str(src),
             "-vf", f"fps={args.fps},scale={args.cols * 2}:-1",
             f"{tmp}/f%04d.png", "-y"],
            check=True,
        )
        pngs = sorted(Path(tmp).glob("*.png"))[: args.max_frames]
        if not pngs:
            sys.exit("error: ffmpeg produced no frames")

        frames, rows = [], None
        for p in pngs:
            im = Image.open(p).convert("L")
            rows = max(1, int(im.height * (args.cols / im.width) * CHAR_ASPECT))
            edges = im.filter(ImageFilter.FIND_EDGES).resize((args.cols, rows))
            a = np.asarray(edges, dtype=float)
            peak = a.max()
            a = a / peak if peak > 0 else a
            # Gain then clip: lifts faint UI edges without blowing out strong ones.
            idx = (np.clip(a * 2.2, 0, 1) * (len(RAMP) - 1)).astype(int)
            frames.append("\n".join("".join(RAMP[v] for v in row) for row in idx))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    # The still frame left on screen after the single animated pass: pick the
    # densest frame, since an near-empty one makes the backdrop look broken.
    density = [1 - (f.count(" ") / max(len(f), 1)) for f in frames]
    rest = max(range(len(frames)), key=lambda i: density[i])

    out.write_text(json.dumps(
        {"cols": args.cols, "rows": rows, "fps": args.fps,
         "rest": rest, "frames": frames},
        separators=(",", ":"),
    ))

    kb = out.stat().st_size / 1024
    print(f"wrote {out} — {len(frames)} frames, {args.cols}x{rows}, {kb:.0f} KB, rest frame {rest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
