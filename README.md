# Ugur Cihan Cekic — Portfolio

Personal portfolio website. Bilingual (English default / Turkish toggle), built with plain HTML, CSS, and JavaScript — no framework, no build step.

**Live site:** [ugurcihancekic.com](https://ugurcihancekic.com)

## What's inside

- Full-bleed scroll-scrubbed video hero (sprite-sheet + canvas, no `<video>` seeking jank), dark theme with a persistent ambient background once the hero sequence ends (`index.html` + `style.css` + `interactions.js`)
- Sticky-note / hand-drawn accents for section content (`index.html` + `style.css`)
- EN/TR language switch with instant client-side translation (`i18n.js`)
- Scroll-triggered animations, mobile nav, and idle motion (`interactions.js`)
- Project showcase: SaaS products, mobile apps, and web platforms
- Press, Book (coming soon), and Contact sections; a downloadable presentation deck (`assets/Ugur-Cihan-Cekic-Sunum.pdf`, Turkish) is linked from Contact
- English copy is rendered into `index.html` so crawlers and link previews see real text without running JS; `i18n.js` swaps in Turkish on toggle
- Social share image: `assets/og-image.jpg` (1200×630)
- Cookieless page-view analytics via Vercel Web Analytics (enable it in the Vercel dashboard under Project → Analytics)

## Running locally

No build step required. From the project folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

Deployed on [Vercel](https://vercel.com) as a static site. Pushing to `main` auto-deploys via the GitHub integration; to deploy manually:

```bash
vercel --prod
```

## Contact

- Email: ugurcihancekic@gmail.com
- GitHub: [@ugurcihan](https://github.com/ugurcihan)
