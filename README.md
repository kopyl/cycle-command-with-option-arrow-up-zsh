# commands-cycling

`.commands-cli` is a zsh plugin for picking and cycling through the commands in a local `.commands` file (↓ opens the picker, ⌥↑/⌥↓ cycle).

## VS Code syntax highlighting

`vscode/` holds a small VS Code extension that highlights `.commands` files:

| Line | Highlighted as |
|---|---|
| Group names (a line with deeper-indented lines under it) | type keyword, blue in Dark+ |
| Titles (`# Title` with a single deeper-indented command under it) | the editor's normal text color (white in dark themes), with a comment-colored `#` |
| Commands | shell, using VS Code's built-in shell grammar |
| Plain `#` comments and ` # notes` after a command | comment |

Whether a line is a group or a title depends on the lines after it, which a TextMate grammar can't see, so `vscode/extension.js` works that out with a semantic token provider that follows the same rules as `_load_commands` in `.commands-cli`. **If you change the `.commands` syntax, update both.**

Groups and plain comments need semantic highlighting, which most themes turn on. Without it, groups show as shell text and plain `#` comments look like titles. Colors come from your theme, so outside Dark+ groups may not be blue.

### Install

```sh
cd vscode
npx @vscode/vsce package --allow-missing-repository --skip-license
code --install-extension commands-file-0.1.1.vsix
```

Then reload the window (⌘⇧P → *Developer: Reload Window*). Any file named `.commands` opens with the `.commands` language.

After editing the extension, bump `version` in `vscode/package.json`, package and install again.

### Files

- `vscode/package.json`: registers the `commands` language for files named `.commands`, and maps the group and title tokens to theme colors
- `vscode/extension.js`: the semantic token provider for groups, titles and comments
- `vscode/syntaxes/commands.tmLanguage.json`: the line-based grammar for `#` lines as titles and everything else as shell
- `vscode/language-configuration.json`: sets `#` as the comment character (so ⌘/ toggles it) and bracket and quote pairs
