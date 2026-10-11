#!/usr/bin/python3
"""Check the live commit's canonical contacts and accepted search assets."""
import hashlib, io, json, pathlib, subprocess, sys, tarfile, tempfile
HERE = pathlib.Path(__file__).resolve().parent
BUNDLE = (HERE / 'bundle-pins.json').read_bytes()
if hashlib.sha256(BUNDLE).hexdigest() != 'ef6f705edc97626fda58a367828427b7fd1181f23f20b683323457577cd43f8d':
    raise ValueError('Directory bundle manifest changed')
PINS = json.loads(BUNDLE)
def verify(root, ref):
    for name, digest in PINS.items():
        if hashlib.sha256((HERE / name).read_bytes()).hexdigest() != digest:
            raise ValueError('Directory verifier bundle changed: ' + name)
    policy = json.loads((HERE / 'policy.json').read_text())
    for name, digest in policy['exact_assets'].items():
        data = subprocess.check_output(['git', '-C', str(root), 'show', ref + ':' + name])
        if hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Protected directory search asset changed: ' + name)
    paths = ['swim-lessons/index.html', 'swim-lessons/directory', 'sitemap.xml']
    data = subprocess.check_output(['git', '-C', str(root), 'archive', ref, *paths])
    with tempfile.TemporaryDirectory(prefix='wwk-contact-guard-') as folder:
        with tarfile.open(fileobj=io.BytesIO(data)) as archive:
            archive.extractall(folder)
        result = subprocess.run([sys.executable, '-B', str(HERE/'check_contacts_preserved.py'), '--root', folder,
            '--expectations', str(HERE/'expectations.json'), '--pin', policy['expectations_sha256']], capture_output=True, text=True)
        if result.returncode:
            raise ValueError(result.stdout + result.stderr)
def main():
    root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
    for line in sys.stdin:
        fields = line.split()
        if len(fields) != 4: raise ValueError('Malformed push record')
        if fields[2] != 'refs/heads/live': continue
        if fields[1] == '0'*40: raise ValueError('Live branch deletion refused')
        verify(root, fields[1])
    return 0
if __name__ == '__main__':
    try: sys.exit(main())
    except (OSError, ValueError, subprocess.CalledProcessError, tarfile.TarError) as e:
        print('WWK directory preservation refused push: '+str(e), file=sys.stderr)
        sys.exit(1)
