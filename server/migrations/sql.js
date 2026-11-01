// Split only at top-level semicolons. Function bodies, strings and comments may
// contain BEGIN/COMMIT and semicolons without controlling our transaction.
export function migrationBody(sql) {
  const statements = [];
  let start = 0;
  let visible = "";
  for (let i = 0; i < sql.length;) {
    if (sql.startsWith("--", i)) {
      const end = sql.indexOf("\n", i + 2);
      i = end < 0 ? sql.length : end + 1;
      visible += " ";
    } else if (sql.startsWith("/*", i)) {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth) {
        if (sql.startsWith("/*", i)) { depth++; i += 2; }
        else if (sql.startsWith("*/", i)) { depth--; i += 2; }
        else i++;
      }
      if (depth) throw new Error("Unclosed SQL comment");
      visible += " ";
    } else if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      const escaped = quote === "'" && /(?:^|[^\w$])[eE]$/.test(sql.slice(0, i));
      let closed = false;
      i++;
      while (i < sql.length) {
        if (escaped && sql[i] === "\\") i += 2;
        else if (sql[i] === quote && sql[i + 1] === quote) i += 2;
        else if (sql[i++] === quote) { closed = true; break; }
      }
      if (!closed) throw new Error("Unclosed SQL string or identifier");
      visible += "?";
    } else if (sql[i] === "$" && /^(\$[A-Za-z_][\w]*\$|\$\$)/.test(sql.slice(i))) {
      const tag = sql.slice(i).match(/^(\$[A-Za-z_][\w]*\$|\$\$)/)[0];
      const end = sql.indexOf(tag, i + tag.length);
      if (end < 0) throw new Error("Unclosed SQL function body");
      i = end + tag.length;
      visible += "?";
    } else if (sql[i] === ";") {
      if (visible.trim()) statements.push({ sql: sql.slice(start, i + 1), command: visible.trim() });
      start = ++i;
      visible = "";
    } else visible += sql[i++];
  }
  if (visible.trim()) statements.push({ sql: sql.slice(start), command: visible.trim() });
  if (!/^BEGIN$/i.test(statements[0]?.command ?? "") || !/^COMMIT$/i.test(statements.at(-1)?.command ?? "")) {
    throw new Error("Automatic migrations must have one outer BEGIN; ... COMMIT; transaction");
  }
  const body = statements.slice(1, -1);
  if (!body.length || body.some(({ command }) => /^(BEGIN|COMMIT|ROLLBACK|END|ABORT|START\s+TRANSACTION|PREPARE\s+TRANSACTION)\b/i.test(command))) {
    throw new Error("Automatic migrations cannot contain additional transaction boundaries");
  }
  return body.map(({ sql: statement }) => statement).join("\n");
}
