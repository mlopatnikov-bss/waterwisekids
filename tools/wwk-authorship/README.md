# WWK named editorial responsibility

Most legacy articles use the organizational byline `WaterWiseKids Editorial
Team`. Replacing it with a named author would falsely imply that one person wrote
or individually reviewed every legacy article. The safer trust improvement keeps
the organizational byline and adds a visible, linked responsible editor:

`Responsible editor: Michael Plotnikov`

This identifies accountability without claiming medical review, professional
credentials, or independent endorsement. Medical reviewer lines remain governed
by the separate exact-revision review packet.

Run from the repository root:

```sh
python3 tools/wwk-authorship/add_responsible_editor.py
python3 tools/wwk-authorship/add_responsible_editor.py --check
```
