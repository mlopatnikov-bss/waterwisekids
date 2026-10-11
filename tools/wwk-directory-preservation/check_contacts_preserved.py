#!/usr/bin/env python3
"""WWK-DIRECTORY-CONTACTS-017 r2 (proposal, not active): read-only guard that the directory contact files
match an explicit, pinned expectation set. Reads files only; no network; changes nothing.

  python3 check_contacts_preserved.py --root SITE --expectations EXPECTATIONS.json --pin SHA256 [--json OUT]

Modes and exit codes (fail closed):
  GUARD mode       --pin (or env WWK017_EXPECTATIONS_SHA256) equals sha256(EXPECTATIONS.json bytes).
                   exit 0 = all checks pass; exit 1 = at least one check failed.
  wrong pin        exit 2 before any check runs. Unreadable/invalid inputs: exit 2.
  REPORT-ONLY      no pin supplied. Checks run for diagnosis but the run is labelled
                   "REPORT-ONLY - NOT AN ACCEPTANCE RESULT" and ALWAYS exits 3, even when every check passes.

Expectations are produced by contact_model.py from verified-contacts.json plus an explicit representation spec;
see contact_model.py for the per-coverage-class table.

Checks:
  C1 schools-data.js: listing keys unique, grouped under their own state, and exactly the expected set.
  C2 schools-data.js: per listing, exactly the expected contact fields for its representation (phone digits,
     postalAddress fields, address line, exact pool membership/addresses); withheld listings carry none.
  C3 each state page's <script type="application/ld+json" id="wwk-verified-school-contacts"> ItemList equals the
     expected item set for that state: no missing, extra, duplicate, wrong-state or incomplete items; required
     fields per representation; forbidden fields absent (phone-only has no address, address-only no telephone).
     r2: every item's streetAddress, addressLocality, addressRegion and postalCode - including each pool item of an
     all-pools listing - must EQUAL the pinned expectation under contact_model.NORM_RULE (normalized equality for
     street/locality, exact region and ZIP). There is no prefix, substring or token matching. Expectations built before
     r2 (pool items without pinned postal fields) fail C3.
     States with no expected items may omit the block or carry an empty list. One page per expected state.
  C4 #citySearch is a <select> on every state page and the directory index.
  C5 state-page static HTML: exactly one card per listing; the card shows that listing's own phone (tel: link and
     visible digits) and full address line / every pool, or nothing for withheld listings; no other listing's phone
     or address inside a card; no expected phone or address outside cards (detached/transplanted text).
  C6 swim-lessons/index.html: one near-me block with #wwk-zip-form, #wwk-near-me and #wwk-near-results.
  C7 sitemap.xml lists the hub, the directory index and every state page present.
"""
import json, re, os, sys, hashlib, html as H
from html.parser import HTMLParser
sys.dont_write_bytecode = True  # read-only tool: never leave __pycache__ next to the task files
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contact_model import norm, digits10, phone_regex  # noqa: E402

def has(hay, needle):
    """Whole-token containment of normalized text (avoids '75 us 22' matching inside '275 us 22')."""
    return bool(needle) and f' {needle} ' in f' {hay} '


GENERIC_PHONE = re.compile(r'(?<!\d)\(?[2-9]\d{2}\)?[\s.\- ]*[2-9]\d{2}[\s.\- ]*\d{4}(?!\d)')


def arg(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a else default


class Page(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.cards = []; s.cur = None; s.depth = 0; s.skip = 0; s.outside = []; s.inname = 0
        s.ld = []; s.inld = False; s.buf = []; s.out_tels = []
    def handle_starttag(s, tag, a):
        a = dict(a)
        if tag == 'script' and (a.get('type') or '').lower() == 'application/ld+json':
            s.inld = a.get('id'); s.buf = []; return
        if tag in ('script', 'style', 'noscript', 'template'): s.skip += 1; return
        cls = (a.get('class') or '').split()
        if s.cur is None and tag == 'div' and 'school-card' in cls:
            s.cur = {'name': '', 'text': [], 'tels': []}; s.depth = 1; return
        if s.cur is not None:
            if tag == 'div': s.depth += 1
            if tag == 'h3' and 'school-name' in cls: s.inname += 1
            if tag == 'a' and (a.get('href') or '').lower().startswith('tel:'): s.cur['tels'].append(a['href'])
            s.cur['text'].append(' ')
        else:
            if tag == 'a' and (a.get('href') or '').lower().startswith('tel:'): s.out_tels.append(a['href'])
            s.outside.append(' ')
    def handle_endtag(s, tag):
        if tag == 'script' and s.inld is not False:
            s.ld.append((s.inld, ''.join(s.buf))); s.inld = False; return
        if tag in ('script', 'style', 'noscript', 'template'):
            if s.skip: s.skip -= 1
            return
        if s.cur is not None:
            if tag == 'h3' and s.inname: s.inname -= 1
            if tag == 'div':
                s.depth -= 1
                if s.depth == 0:
                    s.cur['text'] = re.sub(r'\s+', ' ', ''.join(s.cur['text'])).strip(); s.cards.append(s.cur); s.cur = None
    def handle_data(s, d):
        if s.inld is not False: s.buf.append(d); return
        if s.skip: return
        if s.cur is not None:
            s.cur['text'].append(d)
            if s.inname: s.cur['name'] += d
        else:
            s.outside.append(d)


def main():
    ROOT = arg('--root'); EXP = arg('--expectations'); OUT = arg('--json')
    pin = arg('--pin') or os.environ.get('WWK017_EXPECTATIONS_SHA256') or ''
    if not ROOT or not EXP:
        print('INPUT ERROR: --root and --expectations are required'); return 2
    try:
        eb = open(EXP, 'rb').read(); exp = json.loads(eb)
        assert exp.get('kind') == 'wwk017-contact-expectations'
    except Exception as e:
        print('INPUT ERROR: expectations unreadable:', e); return 2
    digest = hashlib.sha256(eb).hexdigest()
    if pin:
        if pin.lower() != digest:
            print(f'INPUT ERROR: pin mismatch (expected {pin}, file is {digest}); no checks run'); return 2
        mode = 'guard'
    else:
        mode = 'report-only'
        print('REPORT-ONLY - NOT AN ACCEPTANCE RESULT (no pin supplied); exit code will be 3')
    L = exp['listings']; keys = exp['listing_keys']; SCH = exp['schema_items_by_state']
    D = os.path.join(ROOT, 'swim-lessons', 'directory')
    res = []

    def chk(cid, name, issues):
        res.append({'id': cid, 'check': name, 'pass': not issues, 'issue_count': len(issues), 'issues': [str(x)[:300] for x in issues]})

    # ---------- C1 / C2: schools-data.js ----------
    try:
        src = open(os.path.join(D, 'schools-data.js'), encoding='utf-8').read()
        body = src[src.find('const SWIM_SCHOOLS_DATA = ') + len('const SWIM_SCHOOLS_DATA = '):]
        dupkeys = []
        def hook(p):
            ks = [k for k, _ in p]
            dupkeys.extend(sorted({k for k in ks if ks.count(k) > 1}))
            return p if p and isinstance(p[0][1], list) else dict(p)
        pairs = json.loads(body[:body.rfind('};') + 1], object_pairs_hook=hook)
        if isinstance(pairs, dict): pairs = list(pairs.items())
    except Exception as e:
        print('INPUT ERROR: schools-data.js unreadable:', e); return 2
    rows, i1 = {}, []
    if dupkeys: i1.append(('duplicate JSON object keys (state groups or fields)', dupkeys[:5]))
    for st, arr in pairs:
        for r in arr:
            r = dict(r); k = f"{st}|{r.get('name')}"
            if r.get('state') != st: i1.append((k, 'row state', r.get('state')))
            if k in rows: i1.append((k, 'duplicate listing key'))
            rows[k] = r
    missing = [k for k in keys if k not in rows]; extra = [k for k in rows if k not in L]
    if missing: i1.append(('missing listings', len(missing), missing[:5]))
    if extra: i1.append(('unexpected listings', len(extra), extra[:5]))
    chk('C1', f'schools-data.js has exactly the {len(keys)} expected listing keys, unique and in their own state', i1)

    i2 = []
    CONTACT = ('address', 'postalAddress', 'phone', 'phones', 'poolAddresses')
    for k, e in L.items():
        r = rows.get(k)
        if r is None: continue
        rep = e['representation']
        want_phone = 'telephone' in e
        want_addr = rep in ('single', 'listing-city-pool', 'address-only', 'opening-soon-address')
        want_pools = rep == 'all-pools'
        if want_phone:
            if digits10(r.get('phone')) != digits10(e['telephone']): i2.append((k, 'phone', r.get('phone'), e['telephone']))
            ph = r.get('phones')
            if ph is not None and [digits10(x) for x in ph] != [digits10(e['telephone'])]: i2.append((k, 'phones', ph))
        else:
            for f in ('phone', 'phones'):
                if r.get(f): i2.append((k, f'{f} present but expected none ({rep})'))
        if want_addr:
            pa = r.get('postalAddress') or {}
            for f in ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode'):
                got, wnt = pa.get(f), e['address'][f]
                if not got: i2.append((k, f'postalAddress.{f} missing'))
                elif (got != wnt if f == 'postalCode' else norm(got) != norm(wnt)): i2.append((k, f'postalAddress.{f}', got, wnt))
            if norm(r.get('address')) != norm(e['address']['line']): i2.append((k, 'address line', r.get('address'), e['address']['line']))
        else:
            for f in ('address', 'postalAddress'):
                if r.get(f): i2.append((k, f'{f} present but expected none ({rep})'))
        if want_pools:
            got = r.get('poolAddresses') or []
            g = sorted((norm(p.get('venue')), norm(p.get('address'))) for p in got if isinstance(p, dict))
            w = sorted((norm(p['venue']), norm(p['address'])) for p in e['pools'])
            if len(got) != len(g) or any(not (p.get('address')) for p in got if isinstance(p, dict)): i2.append((k, 'pool entry incomplete'))
            if g != w:
                miss = [x for x in w if x not in g]; extr = [x for x in g if x not in w]
                i2.append((k, 'pool membership/address', f'missing {len(miss)}', miss[:2], f'unexpected {len(extr)}', extr[:2]))
        elif r.get('poolAddresses'):
            i2.append((k, f'poolAddresses present but representation is {rep}'))
    chk('C2', 'schools-data.js contact fields exactly match each listing\'s expected representation', i2)

    # ---------- state pages ----------
    pages = sorted(f for f in os.listdir(D) if f.endswith('.html') and f != 'index.html')
    by_state, i3, i4, i5 = {}, [], [], []
    parsed = {}
    for f in pages:
        s = open(os.path.join(D, f), encoding='utf-8').read()
        m = re.findall(r'const STATE_CODE = "([A-Z]{2})"', s)
        if len(set(m)) != 1: i3.append((f, 'STATE_CODE missing/ambiguous', m)); continue
        st = m[0]
        if st in by_state: i3.append((f, 'second page for state', st, by_state[st]))
        by_state[st] = f
        p = Page(); p.feed(s); p.close(); parsed[f] = (st, p, s)
        if not re.search(r'<select[^>]*\bid="citySearch"', s) or re.search(r'<input[^>]*\bid="citySearch"', s): i4.append(f)
    for st in exp['states']:
        if st not in by_state: i3.append(('no state page for', st)); i5.append(('no state page for', st))
    for st in by_state:
        if st not in exp['states']: i3.append(('page for unexpected state', st, by_state[st]))

    # C3 schema
    for f, (st, p, s) in parsed.items():
        E = {it['identity']: it for it in SCH.get(st, [])}
        blocks = [b for (bid, b) in p.ld if bid == 'wwk-verified-school-contacts']
        if not blocks:
            if E: i3.append((f, 'verified-contacts block missing', len(E), 'items expected'))
            continue
        if len(blocks) > 1: i3.append((f, 'more than one verified-contacts block', len(blocks))); continue
        try:
            j = json.loads(blocks[0]); els = j.get('itemListElement')
            assert j.get('@type') == 'ItemList' and isinstance(els, list)
        except Exception as ex:
            i3.append((f, 'block is not an ItemList with itemListElement list', str(ex)[:60])); continue
        seen = {}
        for el in els:
            it = (el or {}).get('item') if isinstance(el, dict) else None
            if not isinstance(it, dict) or not it.get('name'): i3.append((f, 'item without name')); continue
            ident = norm(it['name']); ad = it.get('address') or {}
            if ident in seen: i3.append((f, 'duplicate item', it['name'])); continue
            seen[ident] = it
            if ad.get('addressRegion', '').strip() != st: i3.append((f, 'wrong/missing addressRegion', it['name'], ad.get('addressRegion')))
            w = E.get(ident)
            if not w: i3.append((f, 'unexpected item (extra, wrong-state or withheld listing)', it['name'])); continue
            tel = it.get('telephone')
            if 'telephone' in w:
                if digits10(tel) != digits10(w['telephone']): i3.append((f, it['name'], 'telephone', tel, w['telephone']))
            elif tel: i3.append((f, it['name'], 'telephone present but listing is address-only'))
            if 'address' in w:
                # single, listing-city-pool, address-only AND (r2) every pool item: each field compared EXACTLY under
                # contact_model.NORM_RULE (street/locality: normalized equality; region and ZIP: exact strings)
                for fld in ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode'):
                    g, x = ad.get(fld), w['address'][fld]
                    if not isinstance(g, str) or not g.strip(): i3.append((f, it['name'], f'{fld} missing'))
                    elif (g != x if fld in ('postalCode', 'addressRegion') else norm(g) != norm(x)): i3.append((f, it['name'], fld, g, x))
            elif 'pool_address' in w:
                # r2: an expectations file without pinned pool postal fields cannot prove a complete pool identity
                i3.append((f, it['name'], 'expectations lack pinned pool postal fields (pre-r2 expectations); rebuild with contact_model r2'))
            if w.get('no_address') and (ad.get('streetAddress') or ad.get('postalCode')): i3.append((f, it['name'], 'address present but listing is phone-only'))
        for ident, w in E.items():
            if ident not in seen: i3.append((f, 'missing item', w['name']))
    chk('C3', 'verified-contacts JSON-LD equals the expected item set on every state page', i3)
    idx = open(os.path.join(D, 'index.html'), encoding='utf-8').read()
    if not re.search(r'<select[^>]*\bid="citySearch"', idx): i4.append('index.html')
    chk('C4', 'city filter is a <select> on the directory index and every state page', i4)

    # C5 cards
    all_phones = {k: e['telephone'] for k, e in L.items() if 'telephone' in e}
    for f, (st, p, s) in parsed.items():
        exp_here = {k: e for k, e in L.items() if e['state'] == st}
        name_to_key = {norm(e['name']): k for k, e in exp_here.items()}
        cards = {}
        for c in p.cards:
            k = name_to_key.get(norm(c['name']))
            if not k: i5.append((f, 'card for unexpected listing', c['name'][:80])); continue
            if k in cards: i5.append((f, 'duplicate card', k)); continue
            cards[k] = c
        for k in exp_here:
            if k not in cards: i5.append((f, 'missing card', k))
        own_lines = {}
        for k, e in exp_here.items():
            ls = []
            if 'address' in e: ls.append(norm(e['address']['line']))
            ls += [norm(pp['address']) for pp in e.get('pools', [])]
            own_lines[k] = ls
        for k, c in cards.items():
            e = exp_here[k]; rep = e['representation']; t = c['text']; nt = norm(t)
            tels = {digits10(x) for x in c['tels']}
            mine = digits10(e.get('telephone'))
            if mine:
                if tels != {mine}: i5.append((f, k, 'tel: links', sorted(x for x in tels if x), mine))
                if not phone_regex(e['telephone']).search(t): i5.append((f, k, 'phone not visible in card'))
            elif tels: i5.append((f, k, 'tel: link present but listing shows no phone', sorted(x for x in tels if x)))
            for m in GENERIC_PHONE.finditer(t):
                d = digits10(m.group(0))
                if d and d != mine: i5.append((f, k, 'other phone in card', m.group(0)))
            if rep in ('single', 'listing-city-pool', 'address-only', 'opening-soon-address'):
                if not has(nt, norm(e['address']['line'])): i5.append((f, k, 'full address line not in card', e['address']['line']))
            if rep == 'opening-soon-address' and not has(nt, 'opening soon'): i5.append((f, k, 'missing "Opening soon" label'))
            if rep == 'all-pools':
                for pp in e['pools']:
                    if not has(nt, norm(pp['address'])) or (pp['venue'] and not has(nt, norm(pp['venue']))): i5.append((f, k, 'pool not shown in card', pp['venue'], pp['address']))
            if rep in ('phone-only', 'withhold') and 'Address:' in t: i5.append((f, k, '"Address:" shown but listing has no publishable address'))
            mylines = set(own_lines[k])
            for k2, ls in own_lines.items():
                if k2 == k: continue
                for ln in ls:
                    if ln and ln not in mylines and has(nt, ln): i5.append((f, k, 'another listing\'s address in card', k2)); break
        out_text = re.sub(r'\s+', ' ', ''.join(p.outside)); out_n = norm(out_text)
        for k2, ph in all_phones.items():
            if phone_regex(ph).search(out_text): i5.append((f, 'expected phone outside any card (detached)', k2))
        for x in p.out_tels:
            if digits10(x) in {digits10(v) for v in all_phones.values()}: i5.append((f, 'expected phone tel: link outside cards', x))
        for k2, ls in own_lines.items():
            for ln in ls:
                if ln and has(out_n, ln): i5.append((f, 'expected address outside any card (detached)', k2)); break
    chk('C5', 'each state-page card shows exactly its own verified contact (or nothing), with no detached or transplanted contact text', i5)

    hub = open(os.path.join(ROOT, 'swim-lessons', 'index.html'), encoding='utf-8').read()
    i6 = []
    for needle in ('<!-- WWK near-me and ZIP search', 'id="wwk-zip-form"', 'id="wwk-near-me"', 'id="wwk-near-results"'):
        if hub.count(needle) != 1: i6.append((needle, hub.count(needle)))
    chk('C6', 'Find Lessons hub has exactly one near-me block with ZIP form, near-me button and results area', i6)
    sm = open(os.path.join(ROOT, 'sitemap.xml'), encoding='utf-8').read()
    need = ['https://www.waterwisekids.com/swim-lessons/', 'https://www.waterwisekids.com/swim-lessons/directory/'] + [f'https://www.waterwisekids.com/swim-lessons/directory/{x}' for x in pages]
    chk('C7', 'sitemap lists the hub, the directory index and every state page', [u for u in need if f'<loc>{u}</loc>' not in sm])

    n = sum(r['pass'] for r in res); allpass = n == len(res)
    for r in res:
        print(('PASS ' if r['pass'] else 'FAIL ') + r['id'] + ' ' + r['check'] + ('' if r['pass'] else f"  [{r['issue_count']} issues, e.g. {r['issues'][:2]}]"))
    code = 3 if mode == 'report-only' else (0 if allpass else 1)
    label = 'REPORT-ONLY - NOT AN ACCEPTANCE RESULT' if mode == 'report-only' else ('GUARD PASS' if allpass else 'GUARD FAIL')
    print(f'{n} of {len(res)} pass | mode={mode} | {label} | exit {code}')
    if OUT:
        json.dump({'mode': mode, 'acceptance_equivalent': mode == 'guard' and allpass, 'label': label, 'exit_code': code,
                   'expectations_sha256': digest, 'pin_supplied': bool(pin), 'site_root': os.path.basename(os.path.abspath(ROOT)),
                   'checks': res, 'passed': n, 'total': len(res)}, open(OUT, 'w'), indent=1, ensure_ascii=False)
    return code


if __name__ == '__main__':
    sys.exit(main())
