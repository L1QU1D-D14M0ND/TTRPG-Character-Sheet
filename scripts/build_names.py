#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build content/pf1e/names/es.json from the curated tables.

Run from the repo root:  python3 scripts/build_names.py

The curated tables (names_part1.py, names_spells.py) are the source of truth
for the translations; this script only joins them to catalog ids and fails
loudly when a catalog row has no curated name, so a pack that grows a row
cannot quietly ship untranslated.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from names_part1 import PART1  # noqa: E402
from names_spells import spanish  # noqa: E402

MECHANIC_FILES = [
    "crb/classes.json",
    "crb/races.json",
    "crb/items.json",
    "crb/feats.json",
    "crb/features.json",
    "crb/spells.json",
    "apg/classes.json",
    "apg/archetypes.json",
    "apg/evolutions.json",
    "apg/spells.json",
]


def main() -> int:
    out = []
    missing = []
    for rel in MECHANIC_FILES:
        path = ROOT / "content" / "pf1e" / rel
        for row in json.loads(path.read_text(encoding="utf-8")):
            name = row["name"]
            es = PART1.get(name)
            if es is None and "spells.json" in rel:
                try:
                    es = spanish(name)
                except KeyError:
                    es = None
            if es is None:
                missing.append(f"{rel}: {row['id']} ({name})")
                continue
            out.append({"id": row["id"], "names": {"es": es}})

    if missing:
        print(f"{len(missing)} catalog rows have no curated Spanish name:")
        for line in missing:
            print("  " + line)
        return 1

    out.sort(key=lambda row: row["id"])
    target = ROOT / "content" / "pf1e" / "names" / "es.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"wrote {target.relative_to(ROOT)} with {len(out)} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
