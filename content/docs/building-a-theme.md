You do not need TypeScript to ship a look.

Theme Studio gives you a fixed file tree. You edit HTML, CSS, and optional client JS. Publish when it looks right.

This guide is for the dashboard path. First-party TypeScript themes are covered on [Themes](/themes).

## Before you start

1. Create a site in the [dashboard](https://dash.kumooo.dev).
2. Add at least one post or page. Preview needs something to render.
3. Open **Design**, then **Theme Studio**.

## The file tree

| File | Job |
| --- | --- |
| `theme.json` | Name and label |
| `styles.css` | All of your CSS |
| `templates/home.html` | Homepage |
| `templates/post.html` | Single post |
| `templates/page.html` | Single page |
| `templates/archive.html` | Tag or category lists |
| `templates/notFound.html` | 404 |
| `client.js` | Optional. Small browser script. No remote imports. |

Start from the starter files. Change one thing at a time.

## Your first edit

1. Open `styles.css`.
2. Change `--accent` to a color you like.
3. Click **Save**, then **Preview draft**.
4. If it looks good, **Publish**.

Your site theme becomes `custom:{siteId}`. Visitors get the new look after the cache bumps (usually right away).

## Template tags (the short version)

Escaped text (safe for titles and user content):

```
{{site.title}}
{{title}}
{{excerpt}}
```

Trusted HTML from Kumooo (markdown output and head tags):

```
{{{head}}}
{{{bodyHtml}}}
```

The compiler also fills `{{{styles}}}` and `{{{clientScript}}}` from your CSS and `client.js`. Leave those in the starter shell.

List of posts:

```
{{#posts}}
  <li><a href="{{url}}">{{title}}</a></li>
{{/posts}}
```

Truthiness blocks work for strings too:

```
{{#excerpt}}<p class="muted">{{excerpt}}</p>{{/excerpt}}
```

Do not put JavaScript expressions inside `{{ }}`. If you need logic, keep it simple or put it in `client.js`.

## A tiny homepage

Keep the shell from the starter. Inside `<main>`, try:

```html
<h1>{{site.title}}</h1>
<p class="muted">{{site.description}}</p>
<ul class="post-list">
{{#posts}}
  <li>
    <a href="{{url}}">{{title}}</a>
  </li>
{{/posts}}
</ul>
```

Publish. Open your `{slug}.kumooo.dev` URL. You should see the list.

## Common mistakes

- **Forgot to publish.** Preview shows the draft. The public site uses the last publish.
- **Broke a tag.** Unclosed `{{#posts}}` fails validation. Read the error and fix the close tag.
- **Tried `{{{title}}}`.** Triple-stash is only for trusted keys. Titles stay in `{{title}}` so HTML cannot sneak in.
- **Imported a CDN in `client.js`.** Not allowed in v1. Keep scripts local.

## Limits

- CSS ≤ 256 KB
- All templates together ≤ 256 KB
- `client.js` ≤ 128 KB

That is enough for a real site. It is not enough for half of npm.

## Switch back to a season theme

Open **Design**, then **Themes**. Apply Haru, Natsu, Aki, or Fuyu. Your Studio drafts stay saved. Publish again later if you want the custom look back.

## Next

- Reference: [Themes](/themes)
- Tone for copy on your site: [Writing](/writing)
- Stuck? [GitHub issues](https://github.com/renzoreyn/kumooo/issues)
