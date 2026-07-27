# AdmitMe — Brand assets

Master brand assets for AdmitMe. **These are prepared, not yet wired in** — the
live RSU manifest and icons are untouched. We swap these in during the
"AdmitMe becomes the head" flip (after RSU season) and the Capacitor app wrap.

## Files
| File | What it is |
|---|---|
| `admitme-icon.svg` | The app icon — navy tile + gold "A" monogram (maskable-safe: mark sits in the centre). |
| `admitme-logo.svg` | Horizontal wordmark: mark + "AdmitMe" + section strip. For headers/marketing. |
| `admitme-splash.svg` | Square splash source — centred mark + wordmark + tagline. |

## The mark
A bold gold **"A"** on a deep-navy rounded tile. The crossbar tilts up slightly —
a subtle **"admitted ✓"** tick. Confident, exam-serious, unmistakably not a generic
template icon.

## Brand tokens
- **Navy (ground):** `#101f3a` · gradient `#17335c → #0a172b`
- **Gold (accent):** `#f4b400` · text-on-light `#c68a12`
- **Ink / muted:** `#101f3a` / `#55668a`
- Wordmark: "Admit" in navy, "Me" in gold.

## Generating the PNG/app icons (do this at flip / wrap time)
One command turns `admitme-icon.svg` into every size the PWA + Play Store need
(favicon, 192, 512, maskable, apple-touch, splash), no design work required:

```bash
# from proj/
npx -y @vite-pwa/assets-generator --preset minimal-2023 public/brand/admitme-icon.svg
```

Then point `vite.config.ts` (VitePWA manifest) + `index.html` at the generated
files and update the manifest `name` to **AdmitMe**. Not before the flip.
