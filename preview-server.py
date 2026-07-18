# Local preview only (not committed): serves docs/ under the /ivan-meer/ prefix
# to mirror GitHub Pages routing with <base href="/ivan-meer/">.
import http.server
import os

DOCS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")
PREFIX = "/ivan-meer"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DOCS, **kwargs)

    def translate_path(self, path):
        if path == "/" or path == PREFIX or path.startswith(PREFIX + "/"):
            path = path[len(PREFIX):] or "/"
        return super().translate_path(path)


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8137), Handler).serve_forever()
