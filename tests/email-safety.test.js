import { afterEach, expect, it, vi } from "vitest";
const mail = vi.hoisted(() => ({ send: vi.fn(), configured: true }));
vi.mock("@sendgrid/mail", () => ({ default: { setApiKey: vi.fn(), send: mail.send } }));
vi.mock("../server/config.js", () => ({ config: { sendgridApiKey: "fixture" }, get isEmailConfigured() { return mail.configured; } }));
import { sendWelcomeEmail, sendRejectionEmail, sendPaymentReceiptEmail, sendPasswordResetEmail, sendLoginOtpEmail } from "../server/email.js";
afterEach(() => { mail.configured = true; mail.send.mockClear(); vi.restoreAllMocks(); });
it("escapes user-controlled HTML while preserving the plain-text version", async () => {
  const input = '<img src=x onerror="alert(1)">';
  await sendWelcomeEmail("fixture@example.test", input);
  await sendRejectionEmail("fixture@example.test", "Name", input);
  await sendPaymentReceiptEmail("fixture@example.test", "Name", 10, input);
  for (const [message] of mail.send.mock.calls) {
    expect(message.html).not.toContain(input);
    expect(message.html).toContain("&lt;img");
    expect(message.text).toContain(input);
  }
});
it("does not print login codes, reset tokens or email addresses when delivery is unconfigured", async () => {
  mail.configured = false;
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  await sendPasswordResetEmail("private@example.test", "https://example.test/reset?token=SECRET-TOKEN");
  await sendLoginOtpEmail("private@example.test", "Name", "9999");
  expect(mail.send).not.toHaveBeenCalled();
  expect(JSON.stringify([...warn.mock.calls, ...log.mock.calls])).not.toMatch(/SECRET-TOKEN|9999|private@example/);
});
