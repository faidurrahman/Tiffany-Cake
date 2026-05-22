import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";

// Safe CURL spawn utility to fetch from Google Apps Script with flawless redirection and user-agent signing
async function fetchWithNativeOrCurl(url: string, method: "GET" | "POST" = "GET", payloadBody?: string): Promise<{ status: number, body: string }> {
  // Try native fetch first
  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (method === "POST") {
      headers["Content-Type"] = "text/plain;charset=utf-8";
    }

    const options: RequestInit = {
      method,
      headers,
      redirect: "follow",
    };

    if (method === "POST" && payloadBody) {
      options.body = payloadBody;
    }

    console.log(`Attempting native fetch (${method}) to:`, url);
    const response = await fetch(url, options);
    const bodyText = await response.text();
    console.log(`Native fetch response status: ${response.status}, body length: ${bodyText.length}`);
    return { status: response.status, body: bodyText };
  } catch (nativeErr: any) {
    console.warn("Native fetch failed or timed out, falling back to curl spawn...", nativeErr.message || nativeErr);
  }

  return new Promise((resolve, reject) => {
    // Basic domain validation
    if (!url.startsWith("https://script.google.com/") && !url.startsWith("https://script.googleusercontent.com/")) {
      return reject(new Error("Domain target URL tidak valid. Harus diawali dengan script.google.com"));
    }

    const args = ["-s", "-L", "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"];
    
    if (method === "POST") {
      args.push("-X", "POST");
      args.push("-H", "Content-Type: text/plain;charset=utf-8");
      if (payloadBody !== undefined) {
        args.push("-d", payloadBody);
      }
    }
    
    args.push(url);

    const child = spawn("curl", args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`curl exited with code ${code}. Error: ${stderr}`));
      }
      resolve({ status: 200, body: stdout });
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware for API endpoints
  app.use(express.json());

  // API Route to proxy read synced data from Google Sheets (Prevents CORS "Failed to fetch" in browser)
  app.get("/api/sync-sheets", async (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    targetUrl = targetUrl.trim().replace(/^["']|["']$/g, '');
    console.log("Proxy fetching URL:", targetUrl);

    try {
      const curlRes = await fetchWithNativeOrCurl(targetUrl, "GET");
      const text = curlRes.body;

      console.log("Response text length:", text.length);
      console.log("Response text starts with:", text.substring(0, 300).trim());

      try {
        const data = JSON.parse(text);
        return res.json(data);
      } catch (parseErr) {
        // Handle Google Apps Script HTML Error Page extraction
        let parsedErrorMessage = "Respons dari Google Sheets bukan JSON yang valid.";
        if (text.includes("errorMessage") || text.includes("error") || text.includes("錯誤")) {
          const match = text.match(/<div[^>]*class=["']errorMessage["'][^>]*>([\s\S]*?)<\/div>/i) || 
                        text.match(/<div[^>]*id=["']error-message["'][^>]*>([\s\S]*?)<\/div>/i) ||
                        text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (match) {
            parsedErrorMessage = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          }
        }
        console.error("Parsed Google Apps Script Exception:", parsedErrorMessage);

        return res.status(500).json({ 
          error: "Respons gagal dari Google Sheets (Error pada Macro/Apps Script).",
          message: parsedErrorMessage,
          details: text.substring(0, 1000)
        });
      }
    } catch (err: any) {
      console.error("Proxy fetch error:", err);
      return res.status(500).json({ 
        error: "Gagal berkomunikasi dengan Google Sheets. Pastikan URL benar dan skrip dapat diakses umum.", 
        details: err.message || String(err) 
      });
    }
  });

  // API Route to proxy write transactions to Google Sheets (Highly reliable writing & error reporting)
  app.post("/api/proxy-write", async (req, res) => {
    let { url, payload } = req.body;
    if (!url || !payload) {
      return res.status(400).json({ error: "URL and payload are required" });
    }

    url = url.trim().replace(/^["']|["']$/g, '');
    console.log("Proxy posting data to URL:", url);

    try {
      const curlRes = await fetchWithNativeOrCurl(url, "POST", JSON.stringify(payload));
      return res.json({ success: true, response: curlRes.body });
    } catch (err: any) {
      console.error("Proxy post error:", err);
      return res.status(500).json({ 
        error: "Gagal mengirim data ke Google Sheets.", 
        details: err.message || String(err) 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
