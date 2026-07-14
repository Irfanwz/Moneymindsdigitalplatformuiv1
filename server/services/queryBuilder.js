/**
 * Builds role-specific Tavily search queries for a user.
 * Returns null if there is not enough data to search (no name).
 */
export function buildQueriesForUser(user) {
  const name = (user.fullName ?? "").trim();
  if (name.length < 2) return null;

  const roles = user.requestedRoles ?? [];

  // Base queries for every user
  const queries = [
    `"${name}" LinkedIn profile`,
    `"${name}" professional background`,
    `"${name}" fraud OR scam OR lawsuit OR criminal`,
  ];

  if (roles.includes("startup")) {
    queries.push(`"${name}" startup founder entrepreneur`);
    queries.push(`"${name}" site:crunchbase.com`);
    queries.push(`"${name}" funding raised investment`);
  }

  if (roles.includes("investor")) {
    queries.push(`"${name}" angel investor venture capital`);
    queries.push(`"${name}" site:angel.co OR site:crunchbase.com investor`);
    queries.push(`"${name}" portfolio investments`);
  }

  if (roles.includes("advisor")) {
    queries.push(`"${name}" financial advisor consultant`);
    queries.push(`"${name}" certified financial planner CFA CFP`);
    queries.push(`"${name}" advisory board member`);
  }

  return queries;
}
