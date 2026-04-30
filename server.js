const http = require('http');
const net = require('net');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const USER = 'NOS';
const PASS = 'Lolo666lolo';

function checkAuth(req) {
  const auth = req.headers['proxy-authorization'];
  if (!auth) return false;
  const [type, credentials] = auth.split(' ');
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  return user === USER && pass === PASS;
}

http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    res.end('pong');
    return;
  }
  if (!checkAuth(req)) {
    res.writeHead(407, { 'Proxy-Authenticate': 'Basic realm="Proxy"' });
    res.end('Auth required');
    return;
  }
  const url = new URL(req.url);
  const proxy = http.request({ host: url.hostname, port: url.port || 80, path: url.pathname + url.search, method: req.method, headers: req.headers }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  req.pipe(proxy);
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
