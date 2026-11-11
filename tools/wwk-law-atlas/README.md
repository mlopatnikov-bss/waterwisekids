# WWK Water-Safety Law Atlas

The public atlas is a verified pilot, not a 50-state legal guide. Its versioned
dataset publishes only modules that link to current government sources, state a
local-code caution, and have received a second review. The public page must never
infer a rule from a model code, a contractor summary, a search snippet, or another
state's law.

`research-queue.json` turns the national roadmap into 204 bounded tasks: four
modules for every state and the District of Columbia. Unpublished tasks contain
no selected source and no legal claim. Finding an official source is only the
start; a different reviewer must compare the proposed plain-English summary with
the controlling text, effective date, scope, exceptions, and local-enforcement
notes before publication.

Run from the repository root:

```sh
python3 tools/wwk-law-atlas/build_research_queue.py --check
python3 tools/wwk-law-atlas/check_research_queue.py
python3 tools/wwk-law-atlas/check_law_atlas.py
```
