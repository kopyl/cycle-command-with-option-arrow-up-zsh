// Semantic highlighting for .commands files. Whether a line is a group or a
// # line is a title depends on the lines after it, which a TextMate grammar
// cannot see, so the structure is worked out here with the same rules as
// _load_commands in .commands-cli.
const vscode = require('vscode');

const legend = new vscode.SemanticTokensLegend(['commandGroup', 'commandTitle', 'comment']);
const GROUP = 0, TITLE = 1, COMMENT = 2;

// Non-empty lines as { line, width, titled, start, length }: width is the
// indent with a tab counting as 4 spaces; start/length cover the text to
// colour (a title without its leading #s, a command without its " #" note).
function parseLines(doc) {
    const entries = [];
    for (let line = 0; line < doc.lineCount; line++) {
        const raw = doc.lineAt(line).text;
        const lead = raw.match(/^[ \t]*/)[0];
        const text = raw.slice(lead.length).trimEnd();
        if (!text) continue;
        const width = lead.length + 3 * (lead.split('\t').length - 1);
        if (text.startsWith('#')) {
            const title = text.replace(/^#+\s*/, '');
            entries.push({ line, width, titled: true, commentStart: lead.length,
                           commentLength: text.length,
                           start: lead.length + text.length - title.length,
                           length: title.length });
        } else {
            const cmd = text.split(' #')[0].trimEnd();
            if (cmd) entries.push({ line, width, titled: false, start: lead.length, length: cmd.length });
        }
    }
    return entries;
}

function provideTokens(doc) {
    const builder = new vscode.SemanticTokensBuilder(legend);
    const tokens = [];                             // [line, start, length, type]
    let entries = parseLines(doc);

    // a # line is a title only when the next line is indented deeper
    const deeper = (list, i) => i + 1 < list.length && list[i + 1].width > list[i].width;
    entries = entries.filter((e, i) => {
        if (e.titled && !deeper(entries, i)) {
            tokens.push([e.line, e.commentStart, e.commentLength, COMMENT]);
            return false;
        }
        return true;
    });

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const next = entries[i + 1];
        // a title holding exactly one command names it; holding more, it is a group
        if (e.titled && next && !next.titled &&
            (i + 2 >= entries.length || entries[i + 2].width <= e.width)) {
            tokens.push([e.line, e.start, e.length, TITLE]);
            i++;                                   // the command line itself
        } else if (deeper(entries, i)) {
            tokens.push([e.line, e.start, e.length, GROUP]);
        }
    }
    // the builder expects document order
    tokens.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (const t of tokens) if (t[2] > 0) builder.push(...t);
    return builder.build();
}

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'commands' }, { provideDocumentSemanticTokens: provideTokens }, legend));
}

module.exports = { activate, deactivate() {} };
