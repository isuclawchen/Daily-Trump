# Daily Public Report

Hugo-based GitHub Pages site for daily public reports.

## Content Layout

Reports live under a person section:

```text
content/<section>/<slug-or-date>.md
```

Examples:

```text
content/trump/2026-03-25.md
content/xMusk/2026-03-26.md
content/Alansays/劉育綸 艾綸說【連假前震盪，迎接五月！】影音分析2026⧸04⧸30.md
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

For ASCII folder names such as `content/Alansays/`, set the human-readable label in `_index.md`:

```md
---
title: 艾綸說
weight: 40
description: 長期整理艾綸說的影音分析、重點字幕與台股盤勢觀察。
---
```

## Report Front Matter

Two content patterns are supported:

1. Date-based filename only:

   ```text
   content/trump/2026-03-25.md
   ```

2. Custom filename with explicit front matter date:

   ```md
   ---
   title: 文章標題
   date: 2026-04-30
   description: 摘要
   ---
   ```

Hugo resolves report dates from front matter first when present, and otherwise can infer them from a `yyyy-mm-dd.md` filename.

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

- Reports can use either a `yyyy-mm-dd.md` filename or an explicit `date:` in front matter
- Markdown can contain raw HTML such as `<iframe>` and `<details>`
- Fenced `vtt` blocks use the site's custom subtitle palette
- Dark mode is built into the site shell and stored in `localStorage`

## Market Ticker

Homepage market widgets are configured in `hugo.yaml`:

```yaml
params:
  marketTicker:
    symbols:
      - label: BRENT
        tradingview: TVC:UKOIL
```
