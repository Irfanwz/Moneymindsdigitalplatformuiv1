import { z } from "zod";
import {
  commonRegistrationFields,
  registrationSections,
  isRegistrationFieldVisible,
  registrationDocumentSlots,
} from "../shared/registrationFields.js";
import { normalizeStartupProfileInput } from "./startupProfiles.js";
import { normalizeInvestorProfileInput } from "./investorProfiles.js";
import { normalizeAdvisorProfileInput } from "./advisorProfiles.js";

function fieldSchema(field) {
  let schema = z
    .string()
    .trim()
    .max(field.type === "textarea" ? 5000 : 500)
    .default("");
  return schema.superRefine((value, ctx) => {
    const issue = (message) =>
      ctx.addIssue({ code: "custom", message: `${field.label}: ${message}` });
    if (!value) {
      if (field.required && !field.when) issue("is required.");
      return;
    }
    if (field.minLength && value.length < field.minLength)
      issue(`enter at least ${field.minLength} characters.`);
    if (field.type === "email" && !z.email().safeParse(value).success)
      issue("enter a valid email.");
    if (
      field.type === "tel" &&
      (!/^[+\d\s().-]+$/.test(value) ||
        value.replace(/\D/g, "").length < 7 ||
        value.replace(/\D/g, "").length > 15)
    )
      issue("enter a valid phone number (7–15 digits).");
    if (field.type === "url") {
      try {
        const url = new URL(value);
        if (
          !["https:", "http:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          !url.hostname.includes(".")
        )
          throw new Error();
        if (
          field.key === "linkedin" &&
          !/(^|\.)linkedin\.com$/i.test(url.hostname)
        )
          throw new Error();
      } catch {
        issue(
          field.key === "linkedin"
            ? "enter a full LinkedIn URL."
            : "enter a full http or https URL.",
        );
      }
    }
    if (field.type === "select" && !field.options.includes(value))
      issue("choose an available option.");
    if (["number", "integer", "year"].includes(field.type)) {
      const n = Number(value),
        min = field.type === "year" ? 1900 : (field.min ?? 0),
        max =
          field.type === "year"
            ? new Date().getUTCFullYear() + 10
            : (field.max ?? 1e15);
      if (
        !/^\d+(\.\d+)?$/.test(value) ||
        !Number.isFinite(n) ||
        n < min ||
        n > max ||
        (field.type !== "number" && !Number.isInteger(n))
      )
        issue(
          `enter a valid ${field.type === "number" ? "number" : "whole number"} between ${min} and ${max}.`,
        );
    }
    if (
      field.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    )
      issue("enter a valid date.");
  });
}
function roleSchema(section) {
  const shape = Object.fromEntries(
    section.fields.map((f) => [f.key, fieldSchema(f)]),
  );
  for (const group of section.collections)
    shape[group.key] = z
      .array(
        z.object({
          id: z.string().regex(/^[a-zA-Z0-9-]{1,64}$/),
          ...Object.fromEntries(
            group.fields.map((f) => [f.key, fieldSchema(f)]),
          ),
        }),
      )
      .max(10)
      .optional()
      .default([]);
  return z
    .object(shape)
    .superRefine((values, ctx) => {
      for (const f of section.fields)
        if (
          f.required &&
          !values[f.key] &&
          isRegistrationFieldVisible(f, values)
        )
          ctx.addIssue({
            code: "custom",
            path: [f.key],
            message: `${f.label} is required.`,
          });
      for (const group of section.collections) {
        if (
          group.required &&
          isRegistrationFieldVisible(group, values) &&
          !values[group.key].length
        )
          ctx.addIssue({
            code: "custom",
            path: [group.key],
            message: `Add at least one entry for ${group.label.toLowerCase()}.`,
          });
        const ids = values[group.key].map((row) => row.id);
        if (new Set(ids).size !== ids.length)
          ctx.addIssue({
            code: "custom",
            path: [group.key],
            message: "Duplicate entry identifiers.",
          });
      }
      if (
        values.minInvestment &&
        values.maxInvestment &&
        Number(values.minInvestment) > Number(values.maxInvestment)
      )
        ctx.addIssue({
          code: "custom",
          path: ["maxInvestment"],
          message: "Maximum investment must be at least the minimum.",
        });
    })
    .transform((values) => {
      for (const f of section.fields)
        if (!isRegistrationFieldVisible(f, values)) delete values[f.key];
      for (const group of section.collections)
        if (!isRegistrationFieldVisible(group, values)) values[group.key] = [];
      return values;
    });
}
export const registrationSchema = z
  .object({
    ...Object.fromEntries(
      commonRegistrationFields.map((f) => [f.key, fieldSchema(f)]),
    ),
    requestedRoles: z
      .array(z.enum(["startup", "investor", "advisor"]))
      .min(1, "Select at least one role.")
      .max(3),
    profiles: z.object(
      Object.fromEntries(
        Object.entries(registrationSections).map(([role, section]) => [
          role,
          roleSchema(section).optional(),
        ]),
      ),
    ),
    attachments: z
      .array(z.object({ key: z.string().max(150) }))
      .max(10)
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    for (const f of commonRegistrationFields)
      if (!data[f.key])
        ctx.addIssue({
          code: "custom",
          path: [f.key],
          message: `${f.label} is required.`,
        });
    if (new Set(data.requestedRoles).size !== data.requestedRoles.length)
      ctx.addIssue({
        code: "custom",
        path: ["requestedRoles"],
        message: "Duplicate roles are not allowed.",
      });
    for (const role of Object.keys(registrationSections))
      if (data.requestedRoles.includes(role) !== Boolean(data.profiles[role]))
        ctx.addIssue({
          code: "custom",
          path: ["profiles", role],
          message: `Supply details only for each selected role (${role}).`,
        });
    const slots = registrationDocumentSlots(data.profiles),
      keys = data.attachments.map((d) => d.key);
    if (
      new Set(keys).size !== keys.length ||
      keys.some((key) => !slots.some((slot) => slot.key === key))
    )
      ctx.addIssue({
        code: "custom",
        path: ["attachments"],
        message: "Invalid or duplicate document association.",
      });
    for (const slot of slots)
      if (slot.required && !keys.includes(slot.key))
        ctx.addIssue({
          code: "custom",
          path: ["attachments"],
          message: `Upload ${slot.label}.`,
        });
  });

const list = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export function buildRegistrationProfiles(data) {
  const user = { email: data.email },
    result = {};
  if (data.profiles.startup)
    result.startup = normalizeStartupProfileInput(
      {
        ...data.profiles.startup,
        location: `${data.city}, ${data.country}`,
      },
      user,
    );
  if (data.profiles.investor)
    result.investor = normalizeInvestorProfileInput(
      {
        ...data.profiles.investor,
        bio: data.profiles.investor.investmentThesis,
        industries: list(data.profiles.investor.industries),
      },
      user,
    );
  if (data.profiles.advisor) {
    const a = data.profiles.advisor,
      education = a.education[0],
      work = a.workHistory[0],
      license = a.licenses[0],
      registration = a.registrations[0];
    result.advisor = normalizeAdvisorProfileInput(
      {
        ...a,
        previousRoles: a.workHistory
          .map((w) => `${w.position} at ${w.firm} (${w.duration})`)
          .join("; "),
        educationUniversity: education?.institution,
        educationDegree: education?.qualification,
        educationYear: education?.year,
        previousFirm: work?.firm,
        previousRole: work?.position,
        previousFirmDuration: work?.duration,
        regulatoryLicenseNo: license?.number || registration?.number,
        regulatoryBody: license?.issuer || registration?.regulator,
        licenseExpiryDate: license?.expiryDate,
      },
      user,
    );
  }
  return result;
}
