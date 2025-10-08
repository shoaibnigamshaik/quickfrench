# QuickFrench Demo Guide

Use this guide to capture a short, focused demo GIF for the README.

## What to show (20–30 seconds)

- Open the homepage and select a topic (e.g., Adjectives)
- Start a 10‑question session in Multiple Choice mode
- Answer 3–4 questions quickly; show both correct and incorrect
- Toggle to Typing mode, answer 1 question
- Show the streak/score updating and the auto‑advance behavior

## How to record

1. macOS: Use QuickTime or CleanShot X to record a 30s screen segment at 60fps
   Linux: Use OBS Studio with a cropped region of the browser window
2. Keep the browser zoom at 100% and the window at ~1280×800
3. Trim the clip to the moments above (no setup fluff)
4. Convert to GIF:
    - With ffmpeg + gifski (recommended quality):
      ffmpeg -i demo.mp4 -vf scale=960:-1:flags=lanczos,fps=30 -f gif - | gifski -o demo.gif --fps 30 --quality 80
    - Or use an online MP4→GIF converter
5. Save the final GIF to `public/demo.gif`

## Tips

- Use a light theme background for clarity
- Keep the pointer movement deliberate
- Avoid overlapping system notifications
