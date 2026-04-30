const http = require('http');
const net = require('net');

const PORT = process.env.PORT || 3000;
const USER = 'nikolas';
const PASS = 'mypassword123';

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200);
    res.end('pong');
    return;
  }

  const auth = req.headers['proxy-authorization'];
  if (!auth) {
    res.writeHead(407, { 'Proxy-Authenticate': 'Basic realm="Proxy"' });
    res.end('Auth required');
    return;
  }

  const encoded = auth.split(' ')[1];
  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  if (user !== USER || pass !== PASS) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const [host, port] = req.headers.host.split(':');
  const target = http.request({
    host,
    port: port || 80,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  req.pipe(target);
  target.on('error', () => res.end());
});

server.listen(PORT, () => console.log('Proxy on port ' + PORT));

    
