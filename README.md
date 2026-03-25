# Daily Public Report

Hugo-based GitHub Pages site for daily public reports.

## Content Layout

Reports live under:

```text
content/<person>/yyyy-mm-dd.md
```

Examples:

```text
content/trump/2026-03-25.md
content/musk/2026-03-26.md
```

Person landing pages use the latest report by default:

- `/trump/` shows the newest file under `content/trump/`
- `/trump/2026-03-25/` shows a specific archived report

If you want a nicer display name in the menu, add a section index:

```text
content/trump/_index.md
```

```md
---
title: 川普
weight: 10
description: 長期追蹤川普的政策訊號、地緣政治影響與市場反應。
---
```

Recommended:

- `title`: person name shown in the menu
- `weight`: ordering on the homepage and sidebar
- `description`: short summary shown on the homepage card and person page

## Local Development

```bash
hugo server
```

## GitHub Pages

Deployment is handled by [`.github/workflows/hugo.yml`](.github/workflows/hugo.yml).

The workflow:

- installs Hugo
- builds the site
- deploys `public/` to GitHub Pages

## Notes

- Report dates are inferred from the filename `yyyy-mm-dd.md`
- Markdown can contain raw HTML if needed
- Dark mode is built into the site shell and stored in `localStorage`
