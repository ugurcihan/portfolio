# Ugur Cihan Cekic — Portfolio

Personal portfolio website. Bilingual (English default / Turkish toggle), built with plain HTML, CSS, and JavaScript — no framework, no build step.

**Live site:** [ugurcihancekic.com](https://ugurcihancekic.com)

## What's inside

- Full-bleed scroll-scrubbed video hero (sprite-sheet + canvas, no `<video>` seeking jank), dark theme with a persistent ambient background once the hero sequence ends (`index.html` + `style.css` + `interactions.js`)
- Sticky-note / hand-drawn accents for section content (`index.html` + `style.css`)
- EN/TR language switch with instant client-side translation (`i18n.js`)
- Scroll-triggered animations, mobile nav, and idle motion (`interactions.js`)
- Project showcase: SaaS products, mobile apps, and web platforms
- A downloadable resume (`Ugur_Cihan_Cekic_Resume.pdf`), linked from the Contact section, formatted for freelance platforms like Upwork/Fiverr
- Four alternate design directions kept for reference: `variant-a.html` (terminal/dark), `variant-b.html` (editorial/minimal), `variant-c.html` (gradient/glass), `variant-d.html` (illustrated — an earlier draft of the hero, since replaced by the video version in `index.html`)

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
