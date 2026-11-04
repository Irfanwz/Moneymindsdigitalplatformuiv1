import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import {
  registrationSections,
  isRegistrationFieldVisible,
} from "../../../../shared/registrationFields.js";
import type { AppRole } from "@/app/types/auth";

export function RegistrationField({
  field,
  value,
  onChange,
  prefix = "",
}: {
  field: any;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}) {
  const id = `${prefix}${field.key}`;
  const props = {
    id,
    name: id,
    value: value || "",
    required: field.required,
    onChange: (e: any) => onChange(e.target.value),
    autoComplete: field.autoComplete,
    minLength: field.minLength,
    maxLength: field.type === "textarea" ? 5000 : 500,
    placeholder:
      field.placeholder || (field.type === "url" ? "https://" : undefined),
  };
  return (
    <div
      className={`space-y-2 min-w-0 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
    >
      <Label htmlFor={id}>
        {field.label}{" "}
        {field.required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : (
          <span className="text-muted-foreground font-normal">(optional)</span>
        )}
      </Label>
      {field.type === "textarea" ? (
        <Textarea {...props} rows={3} />
      ) : field.type === "select" ? (
        <select
          {...props}
          className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="">Select an option</option>
          {field.options.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <Input
          {...props}
          type={
            ["integer", "year"].includes(field.type)
              ? "number"
              : field.type === "list"
                ? "text"
                : field.type
          }
          min={field.type === "year" ? 1900 : (field.min ?? 0)}
          max={
            field.type === "year" ? new Date().getFullYear() + 10 : field.max
          }
          step={field.type === "number" ? "any" : 1}
        />
      )}
      {field.type === "list" && (
        <p className="text-xs text-muted-foreground">
          Separate entries with commas.
        </p>
      )}
      {field.type === "password" && (
        <p className="text-xs text-muted-foreground">
          Use at least 8 characters.
        </p>
      )}
    </div>
  );
}
export function RoleRegistrationFields({
  role,
  values,
  onChange,
}: {
  role: AppRole;
  values: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}) {
  const section = registrationSections[role];
  function update(key: string, value: any) {
    const next = { ...values, [key]: value };
    for (const group of section.collections)
      if (
        group.required &&
        isRegistrationFieldVisible(group, next) &&
        !next[group.key]?.length
      )
        next[group.key] = [{ id: crypto.randomUUID() }];
    onChange(next);
  }
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-5">
        {section.fields
          .filter((f: any) => isRegistrationFieldVisible(f, values))
          .map((field: any) => (
            <RegistrationField
              key={field.key}
              field={field}
              value={values[field.key]}
              prefix={`${role}.`}
              onChange={(value) => update(field.key, value)}
            />
          ))}
      </div>
      {section.collections
        .filter((g: any) => isRegistrationFieldVisible(g, values))
        .map((group: any) => {
          const rows = values[group.key] || [];
          return (
            <fieldset
              key={group.key}
              className="space-y-4 rounded-xl border p-4 md:p-5"
            >
              <legend className="px-2 font-medium">
                {group.label} {group.required ? "*" : "(optional)"}
              </legend>
              {group.evidence && (
                <p className="text-sm text-muted-foreground">
                  Attach evidence for each entry in the Documents step.
                </p>
              )}
              {group.key === "references" && (
                <p className="text-sm text-muted-foreground">
                  Provide contacts who have agreed to be listed as your
                  references.
                </p>
              )}
              {rows.map((row: any, index: number) => (
                <div
                  key={row.id}
                  className="rounded-lg bg-muted/40 p-4 space-y-4"
                >
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm font-medium">
                      Entry {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={group.required && rows.length === 1}
                      onClick={() =>
                        update(
                          group.key,
                          rows.filter((r: any) => r.id !== row.id),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {group.fields.map((field: any) => (
                      <RegistrationField
                        key={field.key}
                        field={field}
                        value={row[field.key]}
                        prefix={`${role}.${group.key}.${row.id}.`}
                        onChange={(value) =>
                          update(
                            group.key,
                            rows.map((r: any) =>
                              r.id === row.id
                                ? { ...r, [field.key]: value }
                                : r,
                            ),
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={rows.length >= 10}
                onClick={() =>
                  update(group.key, [...rows, { id: crypto.randomUUID() }])
                }
              >
                Add {group.label.toLowerCase()} entry
              </Button>
            </fieldset>
          );
        })}
    </div>
  );
}
