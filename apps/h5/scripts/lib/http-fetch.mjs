import https from 'node:https';
import http from 'node:http';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function fetchBuffer(url, redirects = 0, rateRetries = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      { headers: { 'User-Agent': UA, Accept: '*/*' } },
      (res) => {
        if (
          [301, 302, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          redirects < 8
        ) {
          res.resume();
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          resolve(fetchBuffer(next, redirects + 1, rateRetries));
          return;
        }
        if (res.statusCode === 429 && rateRetries < 8) {
          res.resume();
          const wait = 1500 * (rateRetries + 1);
          sleep(wait).then(() => resolve(fetchBuffer(url, redirects, rateRetries + 1)));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${res.statusCode} ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      },
    );
    req.on('error', reject);
    req.setTimeout(120_000, () => req.destroy(new Error('timeout')));
  });
}

export function fetchText(url) {
  return fetchBuffer(url).then((b) => b.toString('utf8'));
}
