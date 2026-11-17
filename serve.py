# Serves the app on this computer (Run Tarot.bat starts it).
# Like "python -m http.server", but it tells the browser to check for a
# newer copy of every file each time, so a change shows on a normal reload
# instead of the browser reusing the copy it saved earlier.

import http.server
import sys


class FreshFiles(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8771
print(f"Serving on http://localhost:{port}/")
http.server.ThreadingHTTPServer(("127.0.0.1", port), FreshFiles).serve_forever()
