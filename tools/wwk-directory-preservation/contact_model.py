#!/usr/bin/env python3
"""WWK-DIRECTORY-CONTACTS-017 r2: shared contact-expectation model (proposal, read-only, no network).

Turns verified-contacts.json plus an EXPLICIT representation spec (and, for all-pools, a reviewed pool-address mapping
file with the store-locator evidence it cites) into an expectations file that lists,
for every one of the existing listings, exactly what the site may and must show:

  representation   schools-data.js fields                 state-page card                 verified-contacts JSON-LD items
  ---------------  -------------------------------------  ------------------------------  -----------------------------------
  single           phone(+phones), address, postalAddress  phone + full address line       1 item: name, region, street, locality, ZIP, telephone
  all-pools        phone(+phones), poolAddresses (exact)   phone + every pool venue/addr   1 item per pool: "<listing> — <venue|address>", complete street/locality/region/ZIP (r2), telephone
  listing-city-pool phone(+phones), address, postalAddress phone + that pool's address      1 item (as single)
  phone-only       phone(+phones) only                     phone only, no "Address:"       1 item: name, region, telephone (no street/ZIP)
  address-only     address, postalAddress only             address only, no tel: link      1 item: name, region, street, locality, ZIP (no telephone)
  opening-soon-address address, postalAddress only         address + "Opening soon", no tel  none (never advertised as an open business)
  withhold         no contact fields at all                no tel: link, no "Address:"      none

Records with coverage_class "none" are ALWAYS "withhold": nothing is fabricated for them. "coming-soon" records are
"withhold" or "opening-soon-address" (only when a full ZIP is published). The spec chooses between representations
that are owner decisions (multi-pool display, phone-only/address-only display, coming soon); a spec is test data,
NOT an owner decision, unless Codex records it as the owner-approved choice.

r2 - complete pool postal identity (Codex finding R1-r1). Every pool of an "all-pools" listing is pinned with complete
streetAddress, addressLocality, addressRegion and postalCode, and the guard compares each field EXACTLY under NORM_RULE
below (no prefix, substring or token matching). Official pool lines are single strings ("Venue 123 Main St Town, ST 12345")
whose street/locality boundary cannot be found safely by rule (multi-word towns, misplaced commas such as
"125 Michigan Avenue, NE Washington"), so NO pool line is split automatically. Each line needs an entry in a pool-address
mapping file (build_pool_mappings.py) that is:
  * verbatim     - venue/address equal the line's split_pool() parts and
                   norm(streetAddress + addressLocality + addressRegion + postalCode) == norm(address): every field is a
                   contiguous part of the official text, nothing added, nothing dropped (no fabricated fields);
  * source-grounded - the locality equals, under NORM_RULE, the city of a cited record in the official BSS national
                   store-locator evidence (same franchise slug, ZIP, region and street number), checked against the
                   evidence file whose SHA-256 the mapping file declares;
  * reviewed     - review.status == "reviewed" with a named reviewer.
If any line of an all-pools listing lacks such an entry (no mapping, listed as blocked, not verbatim, not grounded, or not
reviewed) build() raises ValueError: that representation is BLOCKED for the spec. Nothing is guessed.
"""
import json, re, hashlib, unicodedata

DASHES = '‐‑‒–—―−'
NORM_RULE = ('streetAddress and addressLocality: Unicode NFKC; dash variants -> "-"; curly apostrophes -> "\'"; lower-case; '
             'every run of characters other than a-z/0-9 -> one space; trimmed; then compared for EQUALITY. '
             'addressRegion: exact 2-letter USPS code equal to the listing state. postalCode: exact 5-digit string. '
             'No prefix, substring or whole-token matching.')


def norm(s):
    s = unicodedata.normalize('NFKC', s or '')
    for d in DASHES: s = s.replace(d, '-')
    s = s.replace('’', "'").replace('‘', "'").lower()
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def digits10(p):
    d = re.sub(r'\D', '', p or '')
    if len(d) == 11 and d[0] == '1': d = d[1:]
    return d if len(d) == 10 else None


def phone_regex(p):
    d = digits10(p)
    return re.compile(r'(?<!\d)\(?%s\)?[\s.\- ]*%s[\s.\- ]*%s(?!\d)' % (d[:3], d[3:6], d[6:]))


def split_pool(s):
    """'Venue name 123 Street, City, ST 12345' -> (venue|None, address). Same rule as staged/schools-data.corrected.js."""
    s = s.strip()
    m = re.search(r'\s(\d[\w\-]*\s+(?:[NSEW]{1,2}\.?\s+)?[A-Z0-9])', s[1:])
    if not m:
        return None, s
    i = m.start() + 1
    return s[:i].strip(' -,'), s[i:].strip()


POSTAL_FIELDS = ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode')
STORE_ADDR = re.compile(r'^(?P<street>.*?),\s*(?P<city>[^,]+?)\s+(?P<region>[A-Z]{2})\s+(?P<zip>\d{5})(?:-\d{4})?,\s*US$')
LINE_TAIL = re.compile(r'^(?P<head>.+?)[\s,]+(?P<region>[A-Z]{2})[\s,]+(?P<zip>\d{5})$')


def parse_store_address(a):
    """BSS national store-locator address '<street>, <City> <ST> <ZIP>, US' -> dict or None."""
    m = STORE_ADDR.match((a or '').strip())
    return m.groupdict() if m else None


def site_slug(url):
    return (url or '').rstrip('/').split('/')[-1]


def apply_corrections(k, line, corr, used=None):
    for (ck, frm), to in corr.items():
        if ck == k and frm in line:
            line = line.replace(frm, to)
            if used is not None: used.add((ck, frm))
    return line


def check_pool_mapping(k, state, slug, line, m, stores, require_review=True):
    """Return a list of problems (empty = entry is verbatim, source-grounded and, if required, reviewed)."""
    probs = []
    if m is None:
        return ['no pool-address mapping entry for this official line']
    v, a = split_pool(line)
    if m.get('venue') != v or m.get('address') != a:
        probs.append(f'venue/address differ from split_pool() of the official line ({v!r}, {a!r})')
    f = {x: m.get(x) for x in POSTAL_FIELDS}
    if not all(isinstance(f[x], str) and f[x].strip() for x in POSTAL_FIELDS):
        probs.append('incomplete postal fields'); return probs
    if f['addressRegion'] != state:
        probs.append(f"addressRegion {f['addressRegion']!r} is not the listing state {state}")
    if not re.fullmatch(r'\d{5}', f['postalCode']):
        probs.append('postalCode is not 5 digits')
    if norm(' '.join(f[x] for x in POSTAL_FIELDS)) != norm(a):
        probs.append('fields do not recompose to the official address text (verbatim rule: nothing added or dropped)')
    if not norm(f['streetAddress']).split()[:1] or not re.match(r'\d', norm(f['streetAddress'])):
        probs.append('streetAddress does not start with the street number')
    g = m.get('grounding') or {}
    if g.get('type') != 'bss-national-store-locator':
        probs.append('no source grounding (needs an independent structured official record)')
    else:
        st = stores.get(g.get('store_id'))
        if st is None:
            probs.append(f"grounding store_id {g.get('store_id')} not in the store-locator evidence")
        else:
            p = parse_store_address(st.get('address'))
            if st.get('address') != g.get('store_address') or p is None:
                probs.append('grounding store_address differs from the evidence record or is unparseable')
            elif not (f'/{slug}/' in (st.get('url') or '')):
                probs.append(f'grounding store is not on this franchise ({slug})')
            else:
                if norm(p['city']) != norm(f['addressLocality']): probs.append(f"addressLocality {f['addressLocality']!r} != store-list city {p['city']!r}")
                if p['zip'] != f['postalCode']: probs.append(f"postalCode {f['postalCode']} != store-list ZIP {p['zip']}")
                if p['region'] != f['addressRegion']: probs.append(f"addressRegion != store-list region {p['region']}")
                if norm(p['street']).split()[:1] != norm(f['streetAddress']).split()[:1]: probs.append('street number differs from the store-list record')
    if require_review:
        rv = m.get('review') or {}
        if rv.get('status') != 'reviewed' or not (rv.get('reviewer') or '').strip():
            probs.append(f"mapping not reviewed (review.status={rv.get('status')!r})")
    return probs


def load_pool_mappings(mappings, store_evidence_bytes):
    """Index a mapping file by (record_key, line) and verify it declares the supplied store-locator evidence."""
    if mappings is None:
        return None, None, {}
    if mappings.get('kind') != 'wwk017-pool-address-mappings':
        raise ValueError('pool-address mapping file has the wrong kind')
    want = (mappings.get('evidence') or {}).get('store_locator_sha256')
    if store_evidence_bytes is None or hashlib.sha256(store_evidence_bytes).hexdigest() != want:
        raise ValueError('store-locator evidence missing or its SHA-256 differs from the one the mapping file declares')
    stores = {s['id']: s for s in json.loads(store_evidence_bytes)}
    idx, blocked = {}, {}
    for m in mappings.get('entries', []):
        key = (m['record_key'], m['line'])
        if key in idx: raise ValueError(f'duplicate mapping entry {key}')
        idx[key] = m
    for b in mappings.get('blocked', []):
        blocked[(b['record_key'], b['line'])] = b.get('reason', 'blocked')
    return idx, blocked, stores


REPRS = {'single', 'all-pools', 'listing-city-pool', 'phone-only', 'address-only', 'opening-soon-address', 'withhold'}


def build(verified, spec, verified_sha256, mappings=None, store_evidence_bytes=None):
    """Return the expectations dict. Raises ValueError on any spec/data inconsistency (fail closed). An all-pools
    listing needs a verbatim, source-grounded, reviewed mapping entry for every pool line (see module docstring)."""
    keys = verified['meta']['listing_keys']
    if len(keys) != len(set(keys)):
        raise ValueError('duplicate listing keys in verified meta')
    recs = {r['record_key']: r for r in verified['records']}
    corr = {(c['record_key'], c['from']): c['to'] for c in spec.get('pool_text_corrections', [])}
    used_corr = set()
    midx, mblocked, stores = load_pool_mappings(mappings, store_evidence_bytes)
    pool_blocks = []
    out = {}
    for k in keys:
        st, name = k.split('|', 1)
        r = recs.get(k)
        cls = r['coverage_class'] if r else 'none'
        c = (r or {}).get('contact', {})
        if cls == 'full':
            rep = 'single'
        elif cls == 'phone+pools':
            rep = spec.get('multi_pool_overrides', {}).get(k, spec['multi_pool'])
        elif cls == 'phone-only':
            rep = 'phone-only' if spec['phone_only'] == 'show' else 'withhold'
        elif cls == 'address-only':
            rep = 'address-only' if spec['address_only'] == 'show' else 'withhold'
        elif cls == 'coming-soon':
            rep = 'opening-soon-address' if spec['coming_soon'] == 'show-address' and c.get('postalCode') else 'withhold'
        elif cls == 'none':
            rep = 'withhold'
        else:
            raise ValueError(f'unknown coverage class {cls} for {k}')
        if rep not in REPRS:
            raise ValueError(f'bad representation {rep} for {k}')
        e = {'state': st, 'name': name, 'coverage_class': cls, 'representation': rep}
        if rep in ('single', 'all-pools', 'listing-city-pool', 'phone-only'):
            if not digits10(c.get('telephone')):
                raise ValueError(f'{k}: representation {rep} needs a verified phone')
            e['telephone'] = '+1' + digits10(c['telephone'])
        if rep in ('single', 'listing-city-pool', 'address-only', 'opening-soon-address'):
            for f in ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode'):
                if not c.get(f):
                    raise ValueError(f'{k}: representation {rep} needs {f}')
            e['address'] = {f: c[f] for f in ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode')}
            e['address']['line'] = c.get('address_line') or f"{c['streetAddress']}, {c['addressLocality']}, {c['addressRegion']} {c['postalCode']}"
        if rep == 'all-pools':
            src = c.get('pools_verbatim') or c.get('venues_verbatim')
            if not src:
                raise ValueError(f'{k}: all-pools needs an official pool list')
            slug = site_slug(((r or {}).get('listing') or {}).get('website') or ((r or {}).get('evidence') or {}).get('final_url'))
            pools, seen = [], set()
            for p in src:
                p = apply_corrections(k, p, corr, used_corr)
                v, a = split_pool(p)
                ident = (norm(v), norm(a))
                if ident in seen:
                    continue
                seen.add(ident)
                if midx is None:
                    pool_blocks.append((k, p, ['no pool-address mapping file supplied'])); continue
                if (k, p) in mblocked:
                    pool_blocks.append((k, p, [f'blocked in mapping file: {mblocked[(k, p)]}'])); continue
                m = midx.get((k, p))
                probs = check_pool_mapping(k, st, slug, p, m, stores)
                if probs:
                    pool_blocks.append((k, p, probs)); continue
                pools.append({'venue': v, 'address': a, 'postal': {x: m[x] for x in POSTAL_FIELDS}})
            e['pools'] = pools
        if rep == 'listing-city-pool' and cls != 'phone+pools':
            raise ValueError(f'{k}: listing-city-pool only applies to multi-pool records')
        out[k] = e
    if pool_blocks:
        raise ValueError('all-pools representation BLOCKED for %d pool line(s) without a verbatim, source-grounded, reviewed '
                         'mapping: %s' % (len(pool_blocks), json.dumps([{'record_key': k, 'line': p, 'problems': pr} for k, p, pr in pool_blocks], ensure_ascii=False)))
    unused = {c for c in set(corr) - used_corr if out.get(c[0], {}).get('representation') == 'all-pools'}
    if unused:
        raise ValueError(f'pool_text_corrections not applied: {sorted(unused)}')
    schema = {}
    for k, e in out.items():
        items = schema.setdefault(e['state'], [])
        rep = e['representation']
        if rep in ('single', 'listing-city-pool'):
            items.append({'identity': norm(e['name']), 'listing_key': k, 'name': e['name'], 'telephone': e['telephone'], 'address': e['address']})
        elif rep == 'all-pools':
            for p in e['pools']:
                label = p['venue'] or p['address']
                items.append({'identity': norm(f"{e['name']} — {label}"), 'listing_key': k, 'name': f"{e['name']} — {label}", 'telephone': e['telephone'],
                              'pool_address': p['address'], 'address': dict(p['postal'])})
        elif rep == 'phone-only':
            items.append({'identity': norm(e['name']), 'listing_key': k, 'name': e['name'], 'telephone': e['telephone'], 'no_address': True})
        elif rep == 'address-only':
            items.append({'identity': norm(e['name']), 'listing_key': k, 'name': e['name'], 'address': e['address'], 'no_telephone': True})
    for st, items in schema.items():
        ids = [i['identity'] for i in items]
        dup = {x for x in ids if ids.count(x) > 1}
        if dup:
            raise ValueError(f'{st}: expected schema identities are not unique: {sorted(dup)[:3]}')
    gen = {'verified_contacts_sha256': verified_sha256, 'representation_spec': spec, 'normalization': NORM_RULE}
    if mappings is not None:
        gen['pool_address_mappings_sha256'] = hashlib.sha256(json.dumps(mappings, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        gen['store_locator_evidence_sha256'] = hashlib.sha256(store_evidence_bytes).hexdigest()
    return {'kind': 'wwk017-contact-expectations', 'version': 3,
            'generated_from': gen,
            'listing_keys': keys, 'listings': out, 'schema_items_by_state': schema,
            'states': sorted({e['state'] for e in out.values()})}


if __name__ == '__main__':
    import sys
    a = sys.argv
    V = a[a.index('--verified') + 1]; S = a[a.index('--spec') + 1]; O = a[a.index('--out') + 1]
    MP = a[a.index('--mappings') + 1] if '--mappings' in a else None
    EV = a[a.index('--store-evidence') + 1] if '--store-evidence' in a else None
    vb = open(V, 'rb').read()
    exp = build(json.loads(vb), json.load(open(S)), hashlib.sha256(vb).hexdigest(),
                json.load(open(MP)) if MP else None, open(EV, 'rb').read() if EV else None)
    txt = json.dumps(exp, indent=1, ensure_ascii=False, sort_keys=True) + '\n'
    open(O, 'w', encoding='utf-8').write(txt)
    print(O, hashlib.sha256(txt.encode()).hexdigest(), len(exp['listings']), 'listings')
