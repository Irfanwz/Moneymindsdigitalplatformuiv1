# MoneyMinds Digital Platform — Client Onboarding Guide

**Prepared for:** MoneyMinds Client  
**Date:** June 2026  
**Platform URL:** https://moneymindsdigital.site

---

## What Is This Platform?

MoneyMinds Digital is a private networking platform that connects three types of users:

- **Startups** — Companies looking for advisors and investors
- **Investors** — People looking to discover and invest in startups
- **Advisors** — Professionals who offer mentoring, training, and signals

As the **Admin**, you control who gets access to the platform. No one can use the platform without your approval.

---

## Step 1 — How to Log In (Admin)

> **Important:** Admin has a **separate login link**. Do not use the regular login page.

1. Open your browser (Chrome or Edge recommended)
2. Go directly to the **Admin Login Page:**
   **https://moneymindsdigital.site/login?mode=admin**
3. You will see the heading **"Admin sign in"** — this confirms you are on the correct page
4. Enter your Admin credentials:
   - **Email:** `admin@moneymindsdigital.site`
   - **Password:** *(the password you set during deployment)*
5. Click **"Enter admin panel"**
6. You will be taken directly to the **Admin Dashboard**

> **Regular user login page** (for Startups / Investors / Advisors) is:
> https://moneymindsdigital.site/login

---

## Step 2 — What the Admin Dashboard Shows You

Once logged in as Admin, you will see:

| Section | What It Does |
|---|---|
| **Pending Approvals** | List of new users waiting for your approval |
| **Recently Approved** | Users you have already approved |
| **Recently Rejected** | Users you have rejected |
| **Platform Stats** | Total users, startups, investors, advisors |

---

## Step 3 — How to Approve a New User

When someone registers on the platform, they must wait for your approval. Here is how to approve them:

1. Log in as Admin
2. Go to **Admin Dashboard**
3. You will see a list of **Pending Users**
4. Click on a user to review their details
5. Select which **Role** to approve for them:
   - Startup
   - Investor
   - Advisor
   - (You can approve multiple roles for one person)
6. Click **"Approve"**
7. The user will receive a notification and can now log in

To **Reject** a user:
1. Click on the user
2. Enter a reason (optional but recommended)
3. Click **"Reject"**

---

## Step 4 — How New Users Register

Share these steps with anyone who wants to join the platform:

1. Go to **https://moneymindsdigital.site**
2. Click **"Apply"** or **"Get Started"**
3. Fill in their name, email, password, and select their role (Startup / Investor / Advisor)
4. Submit the form
5. **Wait for Admin approval** — they will receive an email once approved
6. After approval, they can log in at https://moneymindsdigital.site/login

> **Important:** New users CANNOT log in until the Admin approves them. This is by design — you control who gets access.

---

## Step 5 — What Each Role Can Do

### Startup Users Can:
- Build a company profile (name, industry, funding stage, team members)
- Search and connect with Advisors
- Browse and enroll in training programs
- Join Advisor Groups

### Investor Users Can:
- Build an investor profile (investment thesis, industries, portfolio size)
- Search and discover Startups
- Save/bookmark startups of interest
- Connect with Advisors
- Browse training programs
- Join Advisor Groups

### Advisor Users Can:
- Build an advisor profile (expertise, certifications, hourly rate)
- Create and manage **Training Programs** (workshops, courses, webinars)
- Create **Advisor Groups** (public or private, free or paid)
- Post **Signals** inside groups (Buy / Sell / Hold / Alert)
- Respond to comments and reactions from members
- View their dashboard (groups, subscribers, revenue stats)

---

## Step 6 — Testing the Platform (Demo Walkthrough)

To test the full experience, you can create demo accounts:

### Create a Test Startup Account:
1. Open a **new/incognito browser window**
2. Go to https://moneymindsdigital.site/apply
3. Register with a test email (e.g. `teststartup@gmail.com`)
4. Select role: **Startup**
5. Go back to your Admin account and **approve** this user
6. Log in as the startup user — explore the Startup Dashboard

### Create a Test Advisor Account:
1. Register with another email (e.g. `testadvisor@gmail.com`)
2. Select role: **Advisor**
3. Approve from Admin panel
4. Log in as Advisor — try creating a Training or Group

### Create a Test Investor Account:
1. Register with another email (e.g. `testinvestor@gmail.com`)
2. Select role: **Investor**
3. Approve from Admin panel
4. Log in as Investor — explore Startups and Advisors

---

## Important Notes

### Data Storage
- The platform is currently running in **Memory Mode**
- This means: if the server restarts, all user data (except the Admin account) will reset
- To make data permanent, a **Supabase database** needs to be connected
- Please contact your development team to set this up when ready

### Email Notifications
- Password reset emails and approval notifications require **SendGrid** to be configured
- Until configured, password resets must be done manually by the Admin
- Contact your development team to set up email

### Payments
- The payment system (for paid trainings and groups) requires **Stripe** to be configured
- This is a Phase 2 feature — contact your development team when you are ready

---

## Quick Reference Card

| What | Details |
|---|---|
| **Platform URL** | https://moneymindsdigital.site |
| **Admin Login Page** | https://moneymindsdigital.site/login?mode=admin |
| **User Login Page** | https://moneymindsdigital.site/login |
| **Register Page** | https://moneymindsdigital.site/apply |
| **Admin Email** | admin@moneymindsdigital.site |
| **Admin Password** | *(set during deployment — contact your dev team if forgotten)* |

---

## Getting Help

If you encounter any issues:

1. **Cannot log in** — Make sure you are using the exact email and password. Passwords are case-sensitive.
2. **User says they cannot log in** — Check if they are approved in your Admin Dashboard
3. **Page not loading** — Try clearing browser cache or use a different browser
4. **Forgot admin password** — Contact your development team to reset it

---

*Document prepared by the MoneyMinds development team.*
