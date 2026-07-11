export const config = { matcher: '/:path*' };

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>David & Julie</title>
<style>
  body { font-family: Georgia, serif; background: #faf7f2; color: #3d3733;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .box { text-align: center; padding: 40px 28px; max-width: 340px; }
  .heart { font-size: 3rem; }
  h1 { font-weight: normal; font-size: 1.4rem; margin: 12px 0 4px; }
  p { color: #8a7f74; font-style: italic; font-size: .95rem; margin: 0 0 24px; }
  input { font-family: inherit; font-size: 1.05rem; text-align: center; width: 100%;
          padding: 12px; border-radius: 10px; border: 1px solid #e8e1d8; background: #fff; box-sizing: border-box; }
  button { font-family: inherit; font-size: 1rem; margin-top: 12px; width: 100%; padding: 12px;
           border-radius: 10px; border: none; background: #b5654a; color: #fff; cursor: pointer; }
  .hint { font-size: .8rem; color: #b5654a; margin-top: 14px; display: none; }
</style>
</head>
<body>
<div class="box">
  <div class="heart">&#10084;&#65039;</div>
  <h1>David &amp; Julie</h1>
  <p>this space is just for us</p>
  <input id="pw" type="password" placeholder="Password" autofocus>
  <button onclick="go()">Enter</button>
  <div class="hint" id="hint">That password didn't work — try again.</div>
</div>
<script>
  function go() {
    var v = document.getElementById('pw').value;
    if (!v) return;
    document.cookie = 'us_gate=' + encodeURIComponent(v) + '; path=/; max-age=31536000; secure; samesite=lax';
    sessionStorage.setItem('tried', '1');
    location.reload();
  }
  document.getElementById('pw').addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
  if (sessionStorage.getItem('tried')) document.getElementById('hint').style.display = 'block';
</script>
</body>
</html>`;

export default function middleware(req) {
  const pass = process.env.SITE_PASSWORD;
  if (!pass) return; // no password configured -> site stays open
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)us_gate=([^;]*)/);
  if (m && decodeURIComponent(m[1]) === pass) return; // correct -> continue to site
  return new Response(LOGIN_HTML, {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
  });
}
