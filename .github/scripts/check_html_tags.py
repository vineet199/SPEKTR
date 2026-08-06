#!/usr/bin/env python3
"""Check that every root-level .html file has balanced open/close tags."""
import glob
import sys
from html.parser import HTMLParser

VOID_TAGS = {
    "br", "img", "input", "meta", "link", "hr", "area", "base",
    "col", "embed", "source", "track", "wbr",
}


class TagBalanceChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.mismatches = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID_TAGS:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        if not self.stack:
            self.mismatches.append(f"extra closing </{tag}> with nothing open")
            return
        if self.stack[-1] != tag:
            self.mismatches.append(f"expected </{self.stack[-1]}> but found </{tag}>")
            # Recover: pop until we find a matching open tag (best-effort)
            if tag in self.stack:
                while self.stack and self.stack[-1] != tag:
                    self.stack.pop()
                if self.stack:
                    self.stack.pop()
        else:
            self.stack.pop()


def main():
    fail = False
    for path in glob.glob("*.html"):
        checker = TagBalanceChecker()
        checker.feed(open(path, encoding="utf-8", errors="replace").read())

        if checker.mismatches:
            fail = True
            for mismatch in checker.mismatches:
                print(f"::error file={path}::Tag mismatch: {mismatch}")

        if checker.stack:
            fail = True
            print(f"::error file={path}::Unclosed tags remaining: {checker.stack}")

    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
