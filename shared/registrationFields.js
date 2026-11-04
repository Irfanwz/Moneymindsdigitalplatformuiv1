// Registration field definitions are shared by the form, review screen and API validation.
const field = (key, label, required = false, type = "text", extra = {}) => ({
  key,
  label,
  required,
  type,
  ...extra,
});
const choice = (key, label, options) =>
  field(key, label, true, "select", { options });
export const registrationRoles = [
  {
    id: "startup",
    label: "Startup",
    description:
      "Introduce your company and connect with investors and advisors.",
  },
  {
    id: "investor",
    label: "Investor",
    description: "Share your background and investment interests.",
  },
  {
    id: "advisor",
    label: "Financial Advisor",
    description: "Submit your professional qualifications for review.",
  },
];
export const commonRegistrationFields = [
  field("fullName", "Full name", true, "text", {
    autoComplete: "name",
    minLength: 2,
  }),
  field("email", "Email", true, "email", { autoComplete: "email" }),
  field("password", "Password", true, "password", {
    minLength: 8,
    autoComplete: "new-password",
  }),
  field("phone", "Phone number", true, "tel", {
    autoComplete: "tel",
    placeholder: "+92 300 1234567",
  }),
  field("city", "City", true, "text", { autoComplete: "address-level2" }),
  field("country", "Country", true, "text", { autoComplete: "country-name" }),
];
export const registrationSections = {
  investor: {
    fields: [
      choice("investorType", "Investor type", [
        "Individual",
        "Angel",
        "Venture capital",
        "Institutional",
        "Family office",
        "Other",
      ]),
      field("title", "Occupation / professional background", true),
      field(
        "investmentThesis",
        "Introduction and investment interests",
        true,
        "textarea",
      ),
      field("firmName", "Company / firm name"),
      field("linkedin", "LinkedIn profile", false, "url"),
      field("website", "Website", false, "url"),
      field("industries", "Preferred industries", false, "list"),
      field("preferredStage", "Preferred startup stages"),
      field("minInvestment", "Minimum investment (USD)", false, "number"),
      field("maxInvestment", "Maximum investment (USD)", false, "number"),
    ],
    collections: [],
  },
  startup: {
    fields: [
      field("companyName", "Company / startup name", true),
      field("applicantPosition", "Your position in the startup", true),
      field("industry", "Industry", true),
      choice("stage", "Startup stage", [
        "Idea",
        "Pre-seed",
        "Seed",
        "Series A",
        "Series B+",
        "Growth",
        "Bootstrapped",
      ]),
      field("description", "Company description", true, "textarea", {
        minLength: 20,
      }),
      field("joiningPurpose", "Purpose of joining", true, "textarea"),
      field("website", "Company website", false, "url"),
      field("linkedin", "Company LinkedIn", false, "url"),
      field("foundedYear", "Founding year", false, "year"),
      field("teamSize", "Team size", false, "integer", { min: 1 }),
      field("totalRaised", "Funding raised (USD)", false, "number"),
      field("fundingGoal", "Funding sought (USD)", false, "number"),
      choice("businessRegistrationStatus", "Business registration", [
        "Registered",
        "Not registered",
        "In progress",
      ]),
      field(
        "registrationNumber",
        "Business registration number",
        true,
        "text",
        { when: ["businessRegistrationStatus", "Registered"] },
      ),
      field(
        "registrationAuthority",
        "Registration authority / jurisdiction",
        true,
        "text",
        { when: ["businessRegistrationStatus", "Registered"] },
      ),
    ],
    collections: [
      {
        key: "teamMembers",
        label: "Team members",
        fields: [
          field("name", "Name", true),
          field("role", "Role", true),
          field("linkedin", "LinkedIn", false, "url"),
        ],
      },
    ],
  },
  advisor: {
    fields: [
      field("title", "Professional title", true),
      field("bio", "Professional biography", true, "textarea"),
      field("specialization", "Advisory specialization / expertise", true),
      field(
        "yearsExperience",
        "Years of financial advisory experience",
        true,
        "integer",
        { max: 80 },
      ),
      field("linkedin", "LinkedIn profile", true, "url"),
      field("website", "Professional website", false, "url"),
      choice("employmentStatus", "Work history", [
        "Previous / current employment",
        "No previous employment",
      ]),
      choice("educationStatus", "Education status", [
        "Qualified",
        "Currently studying",
        "No formal qualification",
      ]),
      choice("certificationStatus", "Professional certifications", [
        "Certifications held",
        "None",
      ]),
      choice("licenseStatus", "Professional licenses", [
        "Licensed",
        "Not applicable",
      ]),
      choice("regulatoryStatus", "Regulatory registrations", [
        "Registered",
        "Not applicable",
      ]),
    ],
    collections: [
      {
        key: "workHistory",
        label: "Work history",
        when: ["employmentStatus", "Previous / current employment"],
        required: true,
        fields: [
          field("firm", "Firm / company", true),
          field("position", "Position", true),
          field("duration", "Duration", true),
        ],
      },
      {
        key: "education",
        label: "Education",
        when: ["educationStatus", ["Qualified", "Currently studying"]],
        required: true,
        evidence: "Qualification evidence",
        fields: [
          field("qualification", "Qualification / degree", true),
          field("institution", "Institution", true),
          field("year", "Completion / expected year", true, "year"),
        ],
      },
      {
        key: "certifications",
        label: "Certifications",
        when: ["certificationStatus", "Certifications held"],
        required: true,
        evidence: "Certificate",
        fields: [
          field("name", "Certification name", true),
          field("issuer", "Issuer", true),
          field("credentialNumber", "Credential number"),
          field("year", "Year obtained", true, "year"),
          field("expiryDate", "Expiry date (if any)", false, "date"),
        ],
      },
      {
        key: "licenses",
        label: "Licenses",
        when: ["licenseStatus", "Licensed"],
        required: true,
        evidence: "License evidence",
        fields: [
          field("type", "License type", true),
          field("issuer", "Issuing authority", true),
          field("number", "License number", true),
          field("expiryDate", "Expiry date (if any)", false, "date"),
        ],
      },
      {
        key: "registrations",
        label: "Regulatory registrations",
        when: ["regulatoryStatus", "Registered"],
        required: true,
        evidence: "Registration evidence",
        fields: [
          field("regulator", "Regulator", true),
          field("jurisdiction", "Jurisdiction", true),
          field("number", "Registration number", true),
        ],
      },
      {
        key: "clientReviews",
        label: "Client reviews",
        fields: [
          field("clientName", "Client name", true),
          field("text", "Review / testimonial", true, "textarea"),
          field("sourceUrl", "Review source link", false, "url"),
        ],
      },
      {
        key: "references",
        label: "Professional references",
        fields: [
          field("name", "Reference name", true),
          field("relationship", "Relationship", true),
          field("contact", "Email or phone number", true),
        ],
      },
    ],
  },
};
export function isRegistrationFieldVisible(definition, values) {
  if (!definition.when) return true;
  const [key, match] = definition.when;
  return (Array.isArray(match) ? match : [match]).includes(values[key]);
}
export function registrationDocumentSlots(profiles) {
  const slots = [];
  if (profiles.startup) {
    slots.push({
      key: "startup.pitchDeck",
      label: "Startup pitch deck",
      required: false,
    });
    if (profiles.startup.businessRegistrationStatus === "Registered")
      slots.push({
        key: "startup.registration",
        label: "Business registration evidence",
        required: true,
      });
  }
  if (profiles.advisor)
    for (const group of registrationSections.advisor.collections) {
      if (
        !group.evidence ||
        !isRegistrationFieldVisible(group, profiles.advisor)
      )
        continue;
      for (const [index, row] of (
        profiles.advisor[group.key] || []
      ).entries()) {
        slots.push({
          key: `advisor.${group.key}.${row.id}`,
          label: `${group.evidence} ${index + 1}: ${row.qualification || row.name || row.type || row.regulator || ""}`,
          required: true,
        });
      }
    }
  return slots;
}
