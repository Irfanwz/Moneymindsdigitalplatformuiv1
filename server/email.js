import sgMail from "@sendgrid/mail";
import { config, isEmailConfigured } from "./config.js";

if (isEmailConfigured) {
  sgMail.setApiKey(config.sendgridApiKey);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@moneyminds.app";
const FROM_NAME = "MoneyMinds";

async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured) {
    console.log(`[Email - not sent, SENDGRID_API_KEY not set]\nTo: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }

  await sgMail.send({
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    text,
    html: html || text,
  });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  await sendEmail({
    to: email,
    subject: "Reset your MoneyMinds password",
    text: `You requested a password reset.\n\nClick the link below to set a new password (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Reset your password</a> (expires in 1 hour)</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}

export async function sendWelcomeEmail(email, fullName) {
  await sendEmail({
    to: email,
    subject: "Welcome to MoneyMinds — your profile is under review",
    text: `Hi ${fullName},\n\nThank you for applying to MoneyMinds! Your profile is currently under review by our admin team.\n\nYou will receive another email once your profile has been approved.\n\nThe MoneyMinds Team`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Thank you for applying to MoneyMinds! Your profile is currently under review by our admin team.</p>
      <p>You will receive another email once your profile has been approved.</p>
      <p>The MoneyMinds Team</p>
    `,
  });
}

export async function sendApprovalEmail(email, fullName, approvedRoles) {
  await sendEmail({
    to: email,
    subject: "Your MoneyMinds profile has been approved!",
    text: `Hi ${fullName},\n\nGreat news — your MoneyMinds profile has been approved!\n\nYour approved roles: ${approvedRoles.join(", ")}\n\nYou can now sign in and start using the platform.\n\nThe MoneyMinds Team`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Great news — your MoneyMinds profile has been approved!</p>
      <p><strong>Your approved roles:</strong> ${approvedRoles.join(", ")}</p>
      <p>You can now sign in and start using the platform.</p>
      <p>The MoneyMinds Team</p>
    `,
  });
}

export async function sendRejectionEmail(email, fullName, reason) {
  await sendEmail({
    to: email,
    subject: "MoneyMinds — profile application update",
    text: `Hi ${fullName},\n\nUnfortunately your MoneyMinds profile application was not approved at this time.\n\n${reason ? `Reason: ${reason}\n\n` : ""}If you have questions, please contact our support team.\n\nThe MoneyMinds Team`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Unfortunately your MoneyMinds profile application was not approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you have questions, please contact our support team.</p>
      <p>The MoneyMinds Team</p>
    `,
  });
}

export async function sendPaymentReceiptEmail(email, fullName, amount, itemDescription) {
  await sendEmail({
    to: email,
    subject: "MoneyMinds — payment receipt",
    text: `Hi ${fullName},\n\nYour payment of $${amount.toFixed(2)} for "${itemDescription}" was successful.\n\nThank you!\n\nThe MoneyMinds Team`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Your payment of <strong>$${amount.toFixed(2)}</strong> for <em>${itemDescription}</em> was successful.</p>
      <p>Thank you!</p>
      <p>The MoneyMinds Team</p>
    `,
  });
}
