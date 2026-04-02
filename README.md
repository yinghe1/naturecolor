# NatureColor

A color design app that extracts colors from nature images. Pick colors directly from uploaded photos, name them, and build a reusable design system. Use the Playground to generate visual artifacts with your palette via LLM.

![Design Page](DesignPage.png)

## Features

**Design Page** — Upload nature images, hover with a crosshair color picker, click to select a color, name it, and save. Saved colors automatically generate a design system in `dist/`.

**Playground Page** — Browse your saved color palette and use natural language instructions to generate SVG logos, typography, and other visual artifacts powered by OpenAI.

**Save Artifacts** — Save generated artifacts from the Playground and get an embeddable URL or `<iframe>` snippet to use in any webpage:
```html
<iframe src="http://localhost:3002/api/artifacts/:id/embed" width="600" height="400" frameborder="0"></iframe>
```

**Design System Output** — Every save/delete regenerates three files in `dist/`:
- `naturecolor-tokens.json` — Structured JSON with hex, RGB, and HSL values
- `naturecolor.css` — CSS custom properties (e.g. `--nc-forest-green: #2d5a27;`)
- `naturecolor.scss` — SCSS variables (e.g. `$nc-forest-green: #2d5a27;`)

## Tech Stack

- **Backend**: Node.js + Express (port 3002)
- **Frontend**: React + Vite (port 5173)
- **Storage**: JSON file persistence
- **LLM**: OpenAI API (GPT-4o)
- **Logging**: Pino

## Getting Started

```bash
# Install dependencies
npm run install:all

# Add your OpenAI API key
# Edit .env and set OPENAI_API_KEY=sk-...

# Start both server and client
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173). The backend API is proxied from the Vite dev server.

## Project Structure

```
naturecolor/
├── server/
│   ├── index.js                  # Express server
│   ├── logger.js                 # Pino logger
│   ├── generateDesignSystem.js   # Design system file generator
│   ├── routes/
│   │   ├── colors.js             # Color CRUD endpoints
│   │   ├── playground.js         # OpenAI proxy
│   │   └── artifacts.js          # Saved artifact CRUD + embed
│   └── data/
│       └── colors.json           # Persisted colors
├── client/
│   └── src/
│       ├── App.jsx               # Router + theme provider
│       ├── pages/
│       │   ├── Design.jsx        # Color picking page
│       │   └── Playground.jsx    # LLM generation page
│       └── components/
│           ├── Navbar.jsx        # Navigation + theme toggle
│           ├── ImageCanvas.jsx   # Canvas with crosshair picker
│           ├── ColorInfo.jsx     # Color details + save
│           └── ColorSwatch.jsx   # Round color display
├── dist/                         # Generated design system files
└── .env                          # OPENAI_API_KEY, PORT
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/colors` | List all saved colors |
| `POST` | `/api/colors` | Save a color `{ name, hex, rgb }` |
| `DELETE` | `/api/colors/:id` | Remove a color |
| `POST` | `/api/playground/generate` | Generate HTML/SVG from `{ instruction }` |
| `GET` | `/api/artifacts` | List all saved artifacts |
| `POST` | `/api/artifacts` | Save an artifact `{ name, html, instruction }` |
| `GET` | `/api/artifacts/:id` | Get artifact JSON |
| `GET` | `/api/artifacts/:id/embed` | Serve raw HTML for iframe embedding |
| `DELETE` | `/api/artifacts/:id` | Remove an artifact |

## Theming

Toggle between light and dark mode using the button in the navbar. Dark mode is the default. Light mode uses an Apple.com-inspired theme. Preference is saved to localStorage.

## License

[MIT](LICENSE)
