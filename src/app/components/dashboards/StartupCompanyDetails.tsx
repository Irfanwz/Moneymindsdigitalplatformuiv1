import { ArrowUpRight, Building2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import type { StartupProfile } from "@/app/types/startup-profile";

function webUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function ProfileLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 break-all text-sm font-medium text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-300">
      {label}
      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

export function StartupCompanyDetails({ profile }: { profile: StartupProfile }) {
  const overview = [
    { label: "Industry", value: profile.industry },
    { label: "Founded", value: profile.foundedYear },
    { label: "Location", value: profile.location },
  ];
  const funding = [
    { label: "Funding stage", value: profile.stage },
    { label: "Total raised", value: profile.totalRaised },
    { label: "Funding goal", value: profile.fundingGoal },
    { label: "Valuation", value: profile.valuation },
  ];
  const socialHandle = profile.twitter?.trim().replace(/^@/, "");
  const socials = [
    { label: "Website", value: profile.website, href: webUrl(profile.website) },
    { label: "LinkedIn", value: profile.linkedin, href: webUrl(profile.linkedin) },
    {
      label: "X / Twitter",
      value: profile.twitter,
      href: webUrl(profile.twitter) || (socialHandle && /^\w+$/.test(socialHandle) ? `https://x.com/${socialHandle}` : undefined),
    },
  ];
  const sharing = [
    { label: "Profile visibility", value: profile.isPublic ? "Public" : "Private" },
    { label: "Contact information", value: profile.showContactInfo ? "Visible on your profile" : "Hidden on your profile" },
    { label: "Advisor invitations", value: profile.allowAdvisorInvitations ? "Allowed" : "Disabled" },
  ];
  const team = profile.teamMembers?.filter((member) => member.name || member.role || member.linkedin) ?? [];

  return (
    <Card id="company-details" className="scroll-mt-24 gap-6 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Company details</h2>
        <Button asChild size="sm" variant="outline" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
          <Link to="/startup/edit-profile"><Pencil aria-hidden="true" className="h-3.5 w-3.5" /> Edit company details</Link>
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-xl">
          {profile.companyLogo && <AvatarImage src={profile.companyLogo} alt="" />}
          <AvatarFallback className="rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            <Building2 aria-hidden="true" className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-xl font-bold">{profile.companyName || "Company name not added"}</h3>
            <Badge variant="outline">{profile.isVerified ? "Verified" : "Unverified"}</Badge>
          </div>
          {profile.tagline && <p className="break-words text-sm text-muted-foreground">{profile.tagline}</p>}
        </div>
      </div>

      <section className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Company overview</h3>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
          {profile.description || "No company description has been added."}
        </p>
        <DetailGrid fields={overview} />
        {!!profile.categories?.length && (
          <div className="flex flex-wrap gap-2" aria-label="Company categories">
            {profile.categories.map((category, index) => (
              <Badge key={`${category}-${index}`} variant="secondary" className="max-w-full whitespace-normal break-all">{category}</Badge>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Funding and investment pitch</h3>
        <DetailGrid fields={funding} />
        <p className="whitespace-pre-line break-words rounded-xl bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
          {profile.pitch || "No investment pitch has been added."}
        </p>
      </section>

      <section className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Team</h3>
        {team.length ? (
          <ul className="divide-y divide-border">
            {team.map((member, index) => {
              const linkedin = webUrl(member.linkedin);
              return (
                <li key={index} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <div className="min-w-0 break-words">
                    <p className="font-medium">{member.name || "Unnamed team member"}</p>
                    <p className="text-muted-foreground">{member.role || "Role not added"}</p>
                  </div>
                  {linkedin && <ProfileLink href={linkedin} label={`LinkedIn${member.name ? ` for ${member.name}` : ""}`} />}
                </li>
              );
            })}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No team members have been added.</p>}
      </section>

      <section className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Contact and links</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Contact email</dt>
            <dd className="break-all font-medium">{profile.contactEmail || "Not provided"}</dd>
          </div>
          {socials.map(({ label, value, href }) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="break-all font-medium">{href ? <ProfileLink href={href} label={value} /> : value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Sharing settings</h3>
        <DetailGrid fields={sharing} />
      </section>
    </Card>
  );
}

function DetailGrid({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {fields.map(({ label, value }) => (
        <div key={label} className="min-w-0 rounded-xl bg-cyan-950/5 p-3 dark:bg-cyan-400/5">
          <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold">{value || "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}
