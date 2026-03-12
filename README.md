# The Uplink 2026 (Standalone)

This is a standalone build of the **The Uplink 2026** landing page, ready to deploy to GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This project is configured with `base: "./"` in `vite.config.ts`, so the built `dist/` folder works at a subpath like `https://<user>.github.io/<repo>/`.

Typical options:

1. Commit the `dist/` folder to a `gh-pages` branch.
2. Or use a GitHub Actions workflow that builds and deploys `dist/` automatically.

## Invite API (Optional)

The email invite form calls `VITE_API_URL` + `/uplink/invite`.

If you have a backend, set `VITE_API_URL` in a `.env` file before building, for example:

```
VITE_API_URL=https://your-domain.com/api
```
