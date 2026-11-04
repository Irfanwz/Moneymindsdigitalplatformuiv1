import {
  registrationRoles,
  registrationSections,
  isRegistrationFieldVisible,
} from "../../../../shared/registrationFields.js";
import { Button } from "@/app/components/ui/button";
import { downloadApplicationDocument, request } from "@/app/lib/api";
import { useEffect, useState } from "react";
import type { AppRole } from "@/app/types/auth";

function Details({ fields, values }: { fields: any[]; values: any }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields
        .filter(
          (field) =>
            values[field.key] && isRegistrationFieldVisible(field, values),
        )
        .map((field) => (
          <div key={field.key} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{field.label}</dt>
            <dd className="text-sm whitespace-pre-wrap break-words mt-1">
              {String(values[field.key])}
            </dd>
          </div>
        ))}
    </dl>
  );
}
export function RegistrationSummary({
  application,
  userId,
  role,
}: {
  application: any;
  userId?: string;
  role?: AppRole;
}) {
  const [error, setError] = useState("");
  if (!application) return null;
  return (
    <div className="space-y-6">
      {registrationRoles
        .filter(
          (item) =>
            (!role || item.id === role) && application.profiles[item.id],
        )
        .map((item) => {
          const values = application.profiles[item.id],
            section = registrationSections[item.id as AppRole];
          return (
            <section key={item.id} className="space-y-4">
              <h3 className="font-semibold">{item.label}</h3>
              <Details fields={section.fields} values={values} />
              {section.collections
                .filter(
                  (g: any) =>
                    isRegistrationFieldVisible(g, values) &&
                    values[g.key]?.length,
                )
                .map((group: any) => (
                  <div key={group.key} className="space-y-3">
                    <h4 className="text-sm font-medium">{group.label}</h4>
                    {values[group.key].map((row: any) => (
                      <div key={row.id} className="rounded-lg border p-3">
                        <Details fields={group.fields} values={row} />
                      </div>
                    ))}
                  </div>
                ))}
            </section>
          );
        })}
      {!!application.documents?.length && (
        <section className="space-y-3">
          <h3 className="font-medium">Supporting documents</h3>
          <p className="text-xs text-muted-foreground">
            Submitted evidence is subject to review.
          </p>
          {application.documents
            .filter((doc: any) => !role || doc.key.startsWith(`${role}.`))
            .map((doc: any) => (
              <div
                key={doc.id || doc.key}
                className="flex flex-wrap justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm break-words">{doc.label}</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {doc.name}
                  </p>
                </div>
                {doc.id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setError("");
                        await downloadApplicationDocument(
                          doc.id,
                          doc.name,
                          userId,
                        );
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Download
                  </Button>
                )}
              </div>
            ))}
        </section>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
export function SubmittedApplication({ role }: { role: AppRole }) {
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request<{ application: any }>("/api/profile-application")
      .then((result) => {
        if (active) setApplication(result.application);
      })
      .catch(() => {
        if (active)
          setError(
            "Registration details could not be loaded. Refresh to try again.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <p role="alert" className="p-4 text-sm text-destructive">
        {error}
      </p>
    );
  if (!application?.profiles[role]) return null;
  return (
    <details className="mx-auto max-w-7xl my-6 rounded-xl border bg-card p-5">
      <summary className="font-medium cursor-pointer">
        Your registration submission
      </summary>
      <p className="my-4 text-sm text-muted-foreground">
        The original information and evidence submitted for admin review.
      </p>
      <RegistrationSummary application={application} role={role} />
    </details>
  );
}
