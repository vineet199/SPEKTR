#!/usr/bin/env python3
"""Check that every .css file (excluding .git) has balanced { } braces."""
import glob
import sys


def main():
    fail = False
    for path in glob.glob("**/*.css", recursive=True):
        if ".git" in path.split("/"):
            continue
        content = open(path, encoding="utf-8", errors="replace").read()
        opens, closes = content.count("{"), content.count("}")
        if opens != closes:
            print(f"::error file={path}::Unbalanced braces (open={opens}, close={closes})")
            fail = True
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
