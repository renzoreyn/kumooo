# Set up your computer

You need three things: Node.js, a package manager, and a code editor. Once. Then you reuse them forever.

## 1. Node.js

Download the **LTS** build from [nodejs.org](https://nodejs.org). Install with the defaults.

Open a terminal:

- Windows: Terminal or PowerShell
- macOS: Terminal

Check it worked:

```bash
node -v
```

You should see a version like `v22.x`. If the command is missing, close the terminal, open a new one, try again. Still broken? Reinstall Node and reboot once. Annoying. Normal.

## 2. Package manager

npm comes with Node. That is enough.

If you want the tool this monorepo uses:

```bash
npm install -g pnpm
pnpm -v
```

## 3. Code editor

Install [Cursor](https://cursor.com) or [VS Code](https://code.visualstudio.com). Either is fine. You will open your project folder in it and edit files.

## Optional: Git

Git tracks changes and talks to GitHub. Install from [git-scm.com](https://git-scm.com) if you do not have it. You will need it for the deploy tutorial.

```bash
git -v
```

## Next

Tools ready? Make your first site.

→ [Your first kumooo.js site](/learn/first-site)
