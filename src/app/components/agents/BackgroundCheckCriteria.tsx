export function BackgroundCheckCriteria() {
  return (
    <details className="rounded-xl border bg-card p-5 text-sm">
      <summary className="cursor-pointer font-semibold">How background checks work and what they assess</summary>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p>New registrations automatically queue a background check. For an existing user, select their name and choose Background check. Progress and saved results appear in Recent runs. Account approval or rejection remains an admin decision.</p>
        <p>Searches use the registration name and requested roles. The AI also receives the registration bio and location. Saved startup, investor and advisor profile details are not currently included in this background check.</p>
        <p>Public web search looks for LinkedIn profiles, professional history, company and news mentions, and possible adverse reports. Startup searches add founder/funding and Crunchbase terms; investor searches add venture capital and portfolio terms; advisor searches add advisory experience and CFA/CFP terms. These are search results, not direct checks with those organizations.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Accept recommendation:</strong> professional presence and claims appear consistent with the retrieved evidence, with no reported red flags.</li>
          <li><strong className="text-foreground">Review recommendation:</strong> limited evidence or unclear/inconsistent claims need a human decision.</li>
          <li><strong className="text-foreground">Reject recommendation:</strong> the AI identified adverse evidence such as fraud/scam allegations, regulatory concerns or suspected impersonation. Confirm the identity and source before acting; an allegation is not proof.</li>
        </ul>
        <p>Scores and confidence are AI estimates, with no fixed weighted scoring formula. Search matches can belong to someone with the same name. No official identity, company-register, sanctions or credential-issuer integration is connected. If no evidence is retrieved, the run fails and needs a retry or manual review.</p>
        <p><strong className="text-foreground">Startup due diligence</strong> separately reviews a saved startup profile for strengths, gaps and risks. <strong className="text-foreground">Profile quality</strong> reviews saved profile completeness. Neither performs this web background search. Document checks start when a user uploads a credential.</p>
      </div>
    </details>
  );
}
