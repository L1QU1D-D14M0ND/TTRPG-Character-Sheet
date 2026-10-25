#!/usr/bin/env python3
"""Update ogcPack.test.ts and the batch docs after appending a batch.

One batch per change is a documented rule (sidebar-tools-encyclopedia.md), and
every batch has to touch the same five places. Doing that by hand is how the
F4/F0 double-count got in, so derive it instead.

Usage: tools/land_batch.py <BATCH_LABEL> <COUNT> <NEXT_LABEL> "<NEXT_DESC>"
Run from the repo root, after the new rows are already in entries.json.
"""
import json
import re
import sys

REPO = "."
ENTRIES = f"{REPO}/content/pf1e/ogc/entries.json"
TEST = f"{REPO}/app/src/systems/pf1e/content/ogcPack.test.ts"


def names_by_id() -> dict[str, str]:
    out: dict[str, str] = {}
    for rel in ("crb/spells.json", "apg/spells.json", "crb/feats.json",
                "crb/features.json"):
        try:
            for row in json.load(open(f"{REPO}/content/pf1e/{rel}")):
                out[row["id"]] = row["name"]
        except FileNotFoundError:
            pass
    return out


def main() -> int:
    label, count, nxt, nxt_desc = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
    entries = json.load(open(ENTRIES))
    batch = entries[-count:]
    names = names_by_id()

    missing = [row["id"] for row in batch if row["id"] not in names]
    if missing:
        print(f"ids not in any mechanic pack: {missing}")
        return 1

    const = f"BATCH_{label.upper()}"
    rows = "\n".join(
        f"  {{ id: '{row['id']}', kind: '{row['kind']}', "
        f"name: {json.dumps(names[row['id']])} }},"
        for row in batch
    )

    src = open(TEST).read()
    if const in src:
        print(f"{const} already present; nothing to do")
        return 1
    src = src.replace(
        "const PACKED = [", f"const {const} = [\n{rows}\n] as const\n\nconst PACKED = [", 1
    )
    # Append to the spread list, after the last existing entry.
    spreads = re.findall(r"  \.\.\.BATCH_[A-Z0-9]+,\n", src)
    src = src.replace(spreads[-1], spreads[-1] + f"  ...{const},\n", 1)

    # Recompute the pinned remainders straight from the packs.
    packed = {row["id"] for row in entries}
    def remaining(prefix: str) -> int:
        seen = set()
        for rel in (("crb/feats.json",) if prefix == "feat"
                    else ("crb/spells.json", "apg/spells.json")):
            for row in json.load(open(f"{REPO}/content/pf1e/{rel}")):
                if row["id"] not in packed:
                    seen.add(row["id"])
        return len(seen)

    feat_rem, spell_rem = remaining("feat"), remaining("spell")
    src = re.sub(r"expect\(remaining\('feat'\)\)\.toBe\([^)]*\)",
                 f"expect(remaining('feat')).toBe({feat_rem})", src)
    src = re.sub(r"expect\(remaining\('spell'\)\)\.toBe\([^)]*\)",
                 f"expect(remaining('spell')).toBe({spell_rem})", src)
    src = re.sub(r"expect\(remaining\('feat'\) \+ remaining\('spell'\)\)\.toBe\(\d+\)",
                 f"expect(remaining('feat') + remaining('spell')).toBe({feat_rem + spell_rem})",
                 src)
    open(TEST, "w").write(src)

    total = feat_rem + spell_rem
    first, last = names[batch[0]["id"]], names[batch[-1]["id"]]
    print(f"{label}: +{count} rows ({first} -> {last}); remaining {total} "
          f"(feat {feat_rem}, spell {spell_rem}); next {nxt} ({nxt_desc})")
    print(f"entries.json now {len(entries)} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
