#!/usr/bin/env python3
"""Check that every local src/href asset link in root .html files resolves
to a real file on disk. Skips external URLs, anchors, and mailto/tel/js links."""
import glob
import os
import re
import sys

LINK_PATTERN = re.compile(r'(?:src|href)="([^"]+)"')
SKIP_PREFIXES = ("http://", "https://", "//", "#", "mailto:", "tel:", "javascript:")
# Strip <script>...</script> and <style>...</style> bodies first — they can
# contain JS/CSS string concatenation that looks like src="..."+var+"..."
# but isn't a real asset reference.
SCRIPT_OR_STYLE = re.compile(r'<(script|style)\b[^>]*>.*?</\1>', re.DOTALL | re.IGNORECASE)


def main():
    fail = False
    for path in glob.glob("*.html"):
        base_dir = os.path.dirname(path) or "."
        content = open(path, encoding="utf-8", errors="replace").read()
        content = SCRIPT_OR_STYLE.sub("", content)

        for match in LINK_PATTERN.findall(content):
            if match.startswith(SKIP_PREFIXES):
                continue
            clean = match.split("?")[0].split("#")[0]
            if not clean:
                continue
            full = os.path.normpath(os.path.join(base_dir, clean))
            if not os.path.exists(full):
                print(f"::error file={path}::Broken local link -> {match}")
                fail = True

    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
