/**
 * Vercel Edge Middleware — password protection for Stalela docs.
 *
 * Set the password via the DOCS_PASSWORD environment variable in the Vercel
 * project dashboard (Settings → Environment Variables). If the variable is
 * not set the default password below is used.
 */

const DEFAULT_PASSWORD = "oyTOh2OpJjuIKry3";
const COOKIE_NAME = "st_docs_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const config = {
  matcher: "/(.*)",
};

export default async function middleware(request) {
  const password = process.env.DOCS_PASSWORD || DEFAULT_PASSWORD;
  const url = new URL(request.url);

  // ── Handle login form POST ────────────────────────────────────────────────
  if (request.method === "POST" && url.pathname === "/_login") {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const submitted = params.get("password") ?? "";
    const next = params.get("next") || "/";

    if (submitted === password) {
      // Derive a cookie token: base64(password) is enough for docs protection.
      const token = btoa(password);
      const headers = new Headers({
        Location: next,
        "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`,
      });
      return new Response(null, { status: 302, headers });
    }

    // Wrong password — show the form again with an error
    return loginPage(next, "Incorrect password — please try again.");
  }

  // ── Serve the login form on GET /_login ───────────────────────────────────
  if (request.method === "GET" && url.pathname === "/_login") {
    const next = url.searchParams.get("next") || "/";
    return loginPage(next);
  }

  // ── Check auth cookie ─────────────────────────────────────────────────────
  const cookie = request.headers.get("cookie") ?? "";
  const expectedToken = btoa(password);
  const isAuthed = cookie
    .split(";")
    .some((c) => c.trim() === `${COOKIE_NAME}=${expectedToken}`);

  if (isAuthed) {
    // Authenticated — serve the static file normally
    return;
  }

  // ── Redirect to login ─────────────────────────────────────────────────────
  const loginUrl = `/_login?next=${encodeURIComponent(url.pathname)}`;
  return Response.redirect(new URL(loginUrl, url.origin), 302);
}

// ── Login page HTML ───────────────────────────────────────────────────────────
function loginPage(next = "/", error = "") {
  const errorHtml = error
    ? `<p class="error">${escHtml(error)}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Stalela Docs — Sign in</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d0d0d;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #e0e0e0;
    }
    .card {
      width: 100%;
      max-width: 380px;
      padding: 2.5rem 2rem;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,.5);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: .6rem;
      margin-bottom: 2rem;
    }
    .logo-dot {
      width: 28px;
      height: 28px;
      background: #3FFF00;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -.01em;
      color: #fff;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: .4rem;
      color: #fff;
    }
    p.sub {
      font-size: .85rem;
      color: #888;
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      font-size: .8rem;
      color: #aaa;
      margin-bottom: .4rem;
      letter-spacing: .03em;
      text-transform: uppercase;
    }
    input[type="password"] {
      width: 100%;
      padding: .65rem .85rem;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 7px;
      color: #fff;
      font-size: .95rem;
      outline: none;
      transition: border-color .15s;
    }
    input[type="password"]:focus { border-color: #3FFF00; }
    button {
      margin-top: 1rem;
      width: 100%;
      padding: .7rem;
      background: #3FFF00;
      color: #000;
      font-size: .95rem;
      font-weight: 700;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      transition: opacity .15s;
    }
    button:hover { opacity: .85; }
    .error {
      margin-top: 1rem;
      padding: .6rem .85rem;
      background: rgba(255,80,80,.12);
      border: 1px solid rgba(255,80,80,.3);
      border-radius: 7px;
      font-size: .85rem;
      color: #ff6b6b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-dot"></div>
      <span class="logo-text">Stalela</span>
    </div>
    <h1>Technical docs</h1>
    <p class="sub">Enter the access password to continue.</p>
    <form method="POST" action="/_login">
      <input type="hidden" name="next" value="${escHtml(next)}" />
      <label for="pw">Password</label>
      <input id="pw" type="password" name="password" autofocus autocomplete="current-password" />
      <button type="submit">Continue →</button>
      ${errorHtml}
    </form>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
