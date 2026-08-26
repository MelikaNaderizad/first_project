import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// This server ONLY serves the frontend (React/Vite).
// All /api/* calls go directly to the real Python/FastAPI backend
// via VITE_API_BASE_URL (see src/api/client.ts -> getBaseUrl()).
// No mock/fake API routes are defined here on purpose.
// ==========================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple health check for this frontend server itself (optional, harmless)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==========================================
  // VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend dev server running on http://localhost:${PORT}`);
    console.log(`API requests are proxied to VITE_API_BASE_URL (see .env)`);
  });
}

startServer();
