# Translations

English is the source of truth for documentation in this repository.

Each translation starts with a note that it is machine-assisted and that English wins if the pages disagree.

## Where the files are

| English source | Translations |
| --- | --- |
| [README.md](../README.md) | `README.<lang>.md` next to it |
| [public/support.html](../public/support.html) | `docs/<lang>/support.md` |
| [public/privacy.html](../public/privacy.html) | Not translated. Readmes and support pages link to it. |

`<lang>` is one of:

`es`, `fr`, `de`, `pt-BR`, `it`, `zh-CN`, `zh-TW`, `ja`, `ko`, `ar`, `hi`, `ru`, `vi`, `tr`, `id`, `pl`, `nl`, `uk`, `fil`, `sw`.

Arabic files wrap the translated prose in `<div dir="rtl" lang="ar">` so it reads right to left. URLs, file paths, and the language list stay left to right.

## When English changes

1. Edit the English source: `README.md` or `public/support.html`. Do not add features that the app does not already have.
2. Update every translation so it says the same thing as the English you just edited.
3. Leave these as written in English:
   - code spans, commands, file paths, and URLs
   - product and screen names: `Survivor`, `Survivor 51`, `Edge of Extinction`, `Leagues`, `New league`, `Delete league`, `Erase this device`
   - the scoring tables (they match the sheet)
   - badges, if any are added later
4. Keep links working from the file you are editing.
   - From `README.<lang>.md`, privacy is `public/privacy.html`, English support is `public/support.html`, and this language’s support page is `docs/<lang>/support.md`.
   - From `docs/<lang>/support.md`, the translated readme is `../../README.<lang>.md`, English support is `../../public/support.html`, and privacy is `../../public/privacy.html`.
5. Keep the language line near the top of `README.md` and every `README.<lang>.md`. It must link every language, including English.
6. Keep the machine-assisted note at the top of every translation.
7. On Arabic pages, keep the `dir="rtl"` wrapper around the translated prose.

## Left in English on purpose

- `public/privacy.html` is the legal page.
- `AGENTS.md` is the workspace contract for the coding agent, not a user guide.
- `scripts/install-page.html` is an install-screen template, not a guide.
- Code comments and in-app UI strings are not part of this translation set.
