#!/usr/bin/env python3
"""Math Heroes sync server.
Stores one JSON save per family under a random 10-character sync code.
Only someone who knows the code can read or update that save. No accounts, no other data."""
import json, os, re, secrets, sqlite3, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get('PORT', '8000'))
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.db')
ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
CODE_RE = re.compile(r'^[A-HJ-NP-Z2-9]{10}$')
MAX_BODY = 200_000
LIMITS = {'all': (240, 600), 'create': (12, 3600)}  # (requests, seconds) per visitor
GLOBAL_CREATES = (300, 3600)   # new sync codes per hour across everyone
MAX_ROWS = 20_000              # hard cap on stored families
STALE_DAYS = 400               # families not synced for this long are removed

db = sqlite3.connect(DB_PATH, check_same_thread=False)
db.execute('CREATE TABLE IF NOT EXISTS saves (code TEXT PRIMARY KEY, data TEXT NOT NULL, updated INTEGER NOT NULL, created INTEGER NOT NULL)')
db.execute('DELETE FROM saves WHERE updated < ?', (int((time.time() - STALE_DAYS * 86400) * 1000),))
db.commit()
lock = threading.Lock()
hits = {}
creates = []

def room_for_new():
    """Global brake on new records, so no single client can fill the database."""
    now = time.time()
    with lock:
        creates[:] = [t for t in creates if now - t < GLOBAL_CREATES[1]]
        if len(creates) >= GLOBAL_CREATES[0]:
            return False
        if db.execute('SELECT COUNT(*) FROM saves').fetchone()[0] >= MAX_ROWS:
            return False
        creates.append(now)
    return True

def limited(who, kind):
    n, win = LIMITS[kind]
    now = time.time()
    with lock:
        q = [t for t in hits.get((who, kind), []) if now - t < win]
        if len(q) >= n:
            hits[(who, kind)] = q
            return True
        q.append(now)
        hits[(who, kind)] = q
        if len(hits) > 50_000:
            hits.clear()
    return False

ID_RE = re.compile(r'^[a-z0-9]{1,12}$')

def valid_save(d):
    """Basic shape check. The game also cleans every field it loads, so this is a second layer."""
    if not (isinstance(d, dict) and d.get('v') == 4 and isinstance(d.get('profiles'), dict) and 1 <= len(d['profiles']) <= 5):
        return False
    for pid, p in d['profiles'].items():
        if not ID_RE.match(pid) or not isinstance(p, dict):
            return False
        if not isinstance(p.get('kid', ''), str) or len(p.get('kid', '')) > 16:
            return False
        for k in ('stars', 'xp'):
            if not isinstance(p.get(k, 0), (int, float)) or isinstance(p.get(k, 0), bool):
                return False
        c = p.get('custom')
        if c is not None:
            if not isinstance(c, dict):
                return False
            for k in ('suit', 'cape', 'mask', 'emblem', 'skin', 'hair', 'blast', 'blastColor'):
                v = c.get(k)
                if v is not None and not (isinstance(v, str) and re.match(r'^(#[0-9a-fA-F]{3,8}|[a-z]{1,12})$', v)):
                    return False
    return True

class H(BaseHTTPRequestHandler):
    server_version = 'MathHeroes/1'
    def log_message(self, *a):
        pass
    def who(self):
        # The hosting proxy sets X-Visitor-Id. It is only used for per-browser rate limits;
        # global caps (room_for_new) protect storage even if the header is changed.
        v = self.headers.get('X-Visitor-Id') or ''
        return v[:64] if re.match(r'^[A-Za-z0-9._:-]{1,64}$', v) else self.client_address[0]
    def cors(self):
        o = self.headers.get('Origin') or ''
        if re.match(r'^http://(localhost|127\.0\.0\.1)(:\d+)?$', o):
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    def send(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(b)))
        self.cors()
        self.end_headers()
        self.wfile.write(b)
    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > MAX_BODY:
            return None
        try:
            return json.loads(self.rfile.read(n))
        except Exception:
            return None
    def route(self):
        p = self.path.split('?')[0].rstrip('/')
        m = re.match(r'^(?:/port/\d+)?/api/(health|sync)(?:/([^/]+))?$', p)
        return (m.group(1), m.group(2)) if m else (None, None)
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()
    def do_GET(self):
        kind, code = self.route()
        if kind == 'health':
            return self.send(200, {'ok': True})
        if kind != 'sync' or not code:
            return self.send(404, {'error': 'not found'})
        if limited(self.who(), 'all'):
            return self.send(429, {'error': 'slow down'})
        if not CODE_RE.match(code):
            return self.send(400, {'error': 'bad code'})
        row = db.execute('SELECT data, updated FROM saves WHERE code=?', (code,)).fetchone()
        if not row:
            return self.send(404, {'error': 'no save for that code'})
        return self.send(200, {'data': json.loads(row[0]), 'updated': row[1]})
    def do_POST(self):
        kind, code = self.route()
        if kind != 'sync' or code:
            return self.send(404, {'error': 'not found'})
        if limited(self.who(), 'all') or limited(self.who(), 'create'):
            return self.send(429, {'error': 'slow down'})
        b = self.body()
        if not b or not valid_save(b.get('data')):
            return self.send(400, {'error': 'bad save'})
        if not room_for_new():
            return self.send(429, {'error': 'sync is busy, try later'})
        now = int(time.time() * 1000)
        with lock:
            for _ in range(5):
                code = ''.join(secrets.choice(ALPHABET) for _ in range(10))
                try:
                    db.execute('INSERT INTO saves VALUES (?,?,?,?)', (code, json.dumps(b['data']), now, now)); db.commit(); break
                except sqlite3.IntegrityError:
                    continue
        return self.send(201, {'code': code})
    def do_PUT(self):
        kind, code = self.route()
        if kind != 'sync' or not code:
            return self.send(404, {'error': 'not found'})
        if limited(self.who(), 'all'):
            return self.send(429, {'error': 'slow down'})
        if not CODE_RE.match(code):
            return self.send(400, {'error': 'bad code'})
        b = self.body()
        if not b or not valid_save(b.get('data')):
            return self.send(400, {'error': 'bad save'})
        now = int(time.time() * 1000)
        exists = db.execute('SELECT 1 FROM saves WHERE code=?', (code,)).fetchone()
        if not exists:
            # re-creating a missing record (e.g. after a server reset) counts as a new record
            if limited(self.who(), 'create') or not room_for_new():
                return self.send(429, {'error': 'slow down'})
        with lock:
            # upsert: lets a device restore the cloud copy if the server ever lost it
            db.execute('INSERT INTO saves VALUES (?,?,?,?) ON CONFLICT(code) DO UPDATE SET data=excluded.data, updated=excluded.updated',
                       (code, json.dumps(b['data']), now, now)); db.commit()
        return self.send(200, {'ok': True, 'updated': now})

if __name__ == '__main__':
    print(f'Math Heroes sync server on :{PORT}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', PORT), H).serve_forever()
