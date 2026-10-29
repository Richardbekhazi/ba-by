"""Local preview server for ba-by.ca that never lets the browser cache files.

Usage: python .claude/serve.py [port]   (default 8123, serves the repo root)
"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = lambda *args, **kwargs: NoCacheHandler(*args, directory=root, **kwargs)
    with http.server.ThreadingHTTPServer(('', port), handler) as server:
        print(f'Serving {root} at http://localhost:{port} (no cache)')
        server.serve_forever()
