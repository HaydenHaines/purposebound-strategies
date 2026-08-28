# Editing Your Website

**Editor:** https://purposeboundstrategies.com/admin/

1. Open the link above and click **Sign in with GitHub**. Use the GitHub account Hayden set up for you.
2. In the left sidebar pick what you want to edit:
   - **Pages → Home Page / About Page** — every headline and paragraph on those pages.
   - **Settings → Site** — site name, navigation links, LinkedIn, Calendly link.
   - **Settings → Founder** — your name, title, photo.
   - **Settings → Free Guide** — the PDF title, description, bullets, and the PDF file itself (click the file field → Upload).
   - **Settings → Contact Page FAQ** — the questions on the contact page.
   - **Blog Posts** — write new posts (turn **Draft** on to hide a post while you work on it).
   - **Services / Testimonials** — add, edit, reorder.

   **Not editable yet:** the page headings on the Contact, Services, and Blog pages, the Start/Thank-you page text, and the hero emblem image. Text Hayden if you need one of those changed.
3. Make your change and click **Save** (top right). That's it — the site rebuilds itself and your change is live in about a minute.

**Photos:** click any photo field → **Upload** → pick a JPG/PNG. Keep photos under ~1 MB.

**Something didn't show up?** Wait two minutes and refresh. If it's still missing, text Hayden — a save can occasionally be rejected by the site's safety checks, and the site simply keeps showing the previous version until it's fixed.

---

## For Hayden: testing locally

Before Tory touches anything, you can try out the CMS yourself on your own computer, without it going anywhere near GitHub or the live site.

The Astro dev server (`npm run dev`) doesn't actually serve the admin page at `/admin/` — that's a known bug in Astro itself, not our setup. So use one of these two ways to open it locally:

- **Recommended:** `npm run build && npx astro preview`, then open `http://localhost:4321/admin/`
- **Or**, while `npm run dev` is running, open `http://localhost:4321/admin/index.html` (note the `index.html` on the end — that part's required in dev mode).

When the CMS loads on localhost, it'll offer you a button called **"Work with Local Repository"** (only shows up in Chrome or Edge). Click it and pick this project's folder. That plugs the editor straight into your local files — no GitHub sign-in needed, and nothing gets pushed anywhere. Any edit you make there writes directly to the files on your computer.

When you're done testing and want to throw away whatever you changed, run:

```bash
git checkout -- src/content public
```

That resets those folders back to what's committed, as if you never touched them.
