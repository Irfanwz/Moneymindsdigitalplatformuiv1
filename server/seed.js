import { hashPassword } from "./auth.js";

export async function seedDemoProfiles(store) {
  const password = await hashPassword("Demo1234!");

  // ═══════════════════════════════════════════════════════════════
  // DEMO USER 1 — Multi-role user (startup + investor + advisor)
  // Login → gets /choose-role → picks a role → sees that dashboard
  // ═══════════════════════════════════════════════════════════════
  const multiEmail = "demo@moneyminds.com";
  const existingMulti = await store.findUserByEmail(multiEmail);

  if (!existingMulti) {
    const user = await store.createUserProfile({
      fullName: "Alex Morgan",
      email: multiEmail,
      passwordHash: password,
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      bio: "Serial entrepreneur, angel investor, and financial advisor helping the next generation of startups grow.",
      requestedRoles: ["startup", "investor", "advisor"],
    });

    await store.updateApproval(user.id, {
      status: "approved",
      approvedRoles: ["startup", "investor", "advisor"],
      adminNotes: "Demo multi-role account",
      approvedBy: null,
    });

    // ── Startup profile ──
    await store.upsertStartupProfile(user.id, {
      companyName: "PayStack AI",
      tagline: "AI-Powered Payment Infrastructure for the Next Billion Transactions",
      industry: "FinTech",
      foundedYear: 2023,
      location: "New York, NY",
      description: "PayStack AI is building intelligent payment infrastructure that reduces fraud by 87% and increases approval rates by 12% using proprietary machine learning models. We process $2.1B in annualized payment volume across 340+ merchants in the US and EU.",
      website: "https://paystackai.com",
      linkedin: "https://linkedin.com/company/paystackai",
      twitter: "@paystackai",
      contactEmail: multiEmail,
      stage: "seed",
      totalRaised: "$3.2M",
      fundingGoal: "$12M Series A",
      valuation: "$40M",
      pitch: "We're raising a $12M Series A to expand into EU markets and launch our enterprise product. Our metrics: $2.1B APV, 340+ merchants, 87% fraud reduction, 142% net revenue retention, and 18-month runway at current burn.",
      categories: ["FinTech", "AI/ML", "Payments", "B2B SaaS"],
      teamMembers: [
        { name: "Alex Morgan", role: "CEO & Co-Founder", linkedin: "https://linkedin.com/in/alexmorgan" },
        { name: "Priya Sharma", role: "CTO & Co-Founder", linkedin: "https://linkedin.com/in/priyasharma" },
        { name: "Marcus Johnson", role: "VP of Sales", linkedin: "https://linkedin.com/in/marcusjohnson" },
      ],
      isPublic: true,
      showContactInfo: true,
      allowAdvisorInvitations: true,
    });

    // ── Investor profile ──
    await store.upsertInvestorProfile(user.id, {
      investorType: "angel",
      preferredStage: "seed",
      minInvestment: "25,000",
      maxInvestment: "250,000",
      portfolioSize: "11-25",
      investmentThesis: "I focus on early-stage B2B SaaS and FinTech companies with strong founding teams and clear paths to $10M ARR. I look for capital-efficient business models, defensible moats, and founders who deeply understand their customers.",
      industries: ["FinTech", "SaaS", "AI/ML", "HealthTech"],
      otherInterests: "Climate tech, Developer tools",
      geographicFocus: "north-america",
      firmName: "Morgan Ventures",
      title: "Managing Partner",
      website: "https://morganventures.com",
      linkedin: "https://linkedin.com/in/alexmorgan",
      twitter: "@alexmorganvc",
      contactEmail: multiEmail,
      bio: "Angel investor with 15+ years of experience in early-stage technology companies. Focus on B2B SaaS and FinTech. Previously VP of Product at Stripe and early employee at Square. Have led or participated in 28 deals with 5 successful exits including DataSync AI (acquired by Microsoft, 8.5x) and CloudFlow (Series C, 4.2x).",
      isPrivate: false,
      anonymousBrowsing: false,
      showInvestmentPreferences: true,
      allowConnectionRequests: true,
      showContactInfo: true,
    });

    // ── Advisor profile ──
    await store.upsertAdvisorProfile(user.id, {
      title: "Senior Financial Advisor & Angel Investor",
      bio: "Financial advisor with 15+ years of experience helping startups navigate fundraising, financial planning, and cap table management. Previously served as CFO at two successful FinTech companies with combined exits of $180M. I specialize in helping Series A-B startups build financial operations that scale.",
      website: "https://alexmorgan.advisory",
      linkedin: "https://linkedin.com/in/alexmorgan",
      twitter: "@alexmorganvc",
      contactEmail: multiEmail,
      yearsExperience: 15,
      clientsHelped: 120,
      specialization: "financial-planning",
      previousRoles: "CFO at PayFlow (acquired 2021, $120M)\nVP Finance at LendTech (IPO 2019)\nSenior Consultant at McKinsey & Company\nFinancial Analyst at Goldman Sachs",
      expertiseAreas: [
        { area: "Financial Planning & Forecasting", level: 95 },
        { area: "Fundraising Strategy", level: 88 },
        { area: "Cap Table Management", level: 92 },
        { area: "M&A Advisory", level: 78 },
        { area: "SaaS Unit Economics", level: 90 },
      ],
      certifications: [
        { name: "Certified Financial Planner (CFP)", issuer: "CFP Board", year: "2012" },
        { name: "Chartered Financial Analyst (CFA)", issuer: "CFA Institute", year: "2014" },
        { name: "Certified Public Accountant (CPA)", issuer: "AICPA", year: "2010" },
      ],
      industries: ["FinTech", "SaaS", "AI/ML", "E-Commerce"],
      preferredStage: "all",
      engagementType: "both",
      availability: "limited",
      typicalRate: "$350/hour or $8,000/month retainer",
      servicesOffered: "• Financial modeling and forecasting\n• Fundraising strategy and pitch deck review\n• Cap table setup and management\n• Board deck preparation\n• CFO-as-a-Service for startups\n• Due diligence preparation\n• Financial operations buildout",
      defaultGroupType: "free",
      defaultJoiningFee: "",
      defaultMonthlyFee: "",
      autoApproveMembers: true,
      allowGroupDiscovery: true,
      enablePaymentProcessing: false,
      paymentEmail: "",
      taxId: "",
      isPublic: true,
      showContactInfo: true,
      allowConnectionRequests: true,
      showTestimonials: true,
    });

    console.log(`  Seeded multi-role user: ${multiEmail} / Demo1234!  (startup + investor + advisor)`);
  }

  // ═══════════════════════════════════════════════════════════════
  // DEMO USER 2 — Single-role startup (no role selection needed)
  // Login → goes straight to /startup/dashboard
  // ═══════════════════════════════════════════════════════════════
  const startupEmail = "jordan.lee@demo.com";
  const existingStartup = await store.findUserByEmail(startupEmail);

  if (!existingStartup) {
    const startupUser = await store.createUserProfile({
      fullName: "Jordan Lee",
      email: startupEmail,
      passwordHash: password,
      phone: "+1 (555) 456-7890",
      location: "Austin, TX",
      bio: "CEO and co-founder of GreenGrid, building the future of sustainable energy management.",
      requestedRoles: ["startup"],
    });

    await store.updateApproval(startupUser.id, {
      status: "approved",
      approvedRoles: ["startup"],
      adminNotes: "Demo account",
      approvedBy: null,
    });

    await store.upsertStartupProfile(startupUser.id, {
      companyName: "GreenGrid Energy",
      tagline: "Smart Energy Management for a Sustainable Future",
      industry: "CleanTech",
      foundedYear: 2024,
      location: "Austin, TX",
      description: "GreenGrid is an AI-powered energy management platform that helps commercial buildings reduce energy consumption by 35% and cut carbon emissions. Our IoT sensor network and ML algorithms optimize HVAC, lighting, and power usage in real time across 50+ buildings.",
      website: "https://greengrid.energy",
      linkedin: "https://linkedin.com/company/greengrid",
      twitter: "@greengrid",
      contactEmail: startupEmail,
      stage: "pre-seed",
      totalRaised: "$750K",
      fundingGoal: "$3M Seed",
      valuation: "$8M",
      pitch: "We're raising a $3M seed round to scale from 50 to 500 buildings and launch in 3 new US cities. Our metrics: $420K ARR, 92% gross margin, 135% net retention, $0 customer acquisition cost (100% inbound).",
      categories: ["CleanTech", "AI/ML", "IoT", "SaaS"],
      teamMembers: [
        { name: "Jordan Lee", role: "CEO & Co-Founder", linkedin: "https://linkedin.com/in/jordanlee" },
        { name: "Sam Rivera", role: "CTO & Co-Founder", linkedin: "https://linkedin.com/in/samrivera" },
      ],
      isPublic: true,
      showContactInfo: true,
      allowAdvisorInvitations: true,
    });

    console.log(`  Seeded startup user:    ${startupEmail} / Demo1234!  (startup only)`);
  }

  // ═══════════════════════════════════════════════════════════════
  // DEMO TRAININGS — created by the multi-role user (advisor role)
  // ═══════════════════════════════════════════════════════════════
  const multiUser = await store.findUserByEmail(multiEmail);
  if (multiUser) {
    const existingTrainings = await store.listTrainingsByAdvisor(multiUser.id);
    if (existingTrainings.length === 0) {
      await store.createTraining(multiUser.id, {
        title: "Financial Modeling for Startups",
        description: "Learn to build comprehensive financial models, forecast revenue, and present to investors with confidence. Covers unit economics, cash flow projections, and investor-ready dashboards.",
        type: "paid", price: 499, format: "online", duration: "4 weeks",
        schedule: "Every Tuesday, 6-8 PM EST", capacity: 50, status: "ongoing",
        topics: ["Financial Modeling", "Revenue Forecasting", "Investor Pitch"],
        location: "", targetAudience: ["Startups"], level: "intermediate",
      });

      await store.createTraining(multiUser.id, {
        title: "Due Diligence Fundamentals for Investors",
        description: "Master the art of startup due diligence, learn key evaluation frameworks, and identify red flags before making investment decisions.",
        type: "paid", price: 799, format: "hybrid", duration: "6 weeks",
        schedule: "Wednesdays & Fridays, 7-9 PM EST", capacity: 30, status: "ongoing",
        topics: ["Due Diligence", "Risk Assessment", "Valuation"],
        location: "New York, NY", targetAudience: ["Investors"], level: "intermediate",
      });

      await store.createTraining(multiUser.id, {
        title: "Introduction to Venture Capital",
        description: "Free introductory workshop covering VC basics, investment thesis development, and portfolio construction strategies.",
        type: "free", price: 0, format: "online", duration: "2 hours",
        schedule: "May 15, 2026 at 5 PM EST", capacity: 200, status: "upcoming",
        topics: ["Venture Capital", "Investment Strategy", "Portfolio Management"],
        location: "", targetAudience: ["Investors", "Startups"], level: "beginner",
      });

      await store.createTraining(multiUser.id, {
        title: "Scaling Your Startup: From Seed to Series A",
        description: "Comprehensive program on growth strategies, team building, and preparing for institutional funding rounds.",
        type: "paid", price: 1299, format: "in-person", duration: "8 weeks",
        schedule: "Saturdays, 10 AM - 2 PM EST", capacity: 25, status: "upcoming",
        topics: ["Growth Strategy", "Fundraising", "Team Building", "Operations"],
        location: "San Francisco, CA", targetAudience: ["Startups"], level: "advanced",
      });

      await store.createTraining(multiUser.id, {
        title: "Understanding Cap Tables and Equity",
        description: "Free workshop on cap table basics, equity splits, founder dilution, and SAFE/convertible note mechanics.",
        type: "free", price: 0, format: "online", duration: "90 minutes",
        schedule: "May 20, 2026 at 6 PM EST", capacity: 150, status: "upcoming",
        topics: ["Cap Tables", "Equity", "Dilution", "Legal Basics"],
        location: "", targetAudience: ["Startups"], level: "beginner",
      });

      console.log(`  Seeded 5 demo trainings`);
    }
  }
}
