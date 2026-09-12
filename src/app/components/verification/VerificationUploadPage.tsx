import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, CheckCircle2, Clock, XCircle, AlertCircle, BadgeCheck, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { useAuth } from "@/app/hooks/useAuth";
import { uploadVerificationDocument, getMyVerifications, type ProfileVerification } from "@/app/lib/api";
import { cn } from "@/app/lib/utils";

const DOC_TYPES = [
  { value: "certificate", label: "Professional Certificate", description: "CFA, CPA, CFP, or other professional cert" },
  { value: "degree",      label: "Academic Degree",          description: "University diploma or degree certificate" },
  { value: "business_reg", label: "Business Registration",  description: "Company incorporation or registration doc" },
  { value: "linkedin",    label: "LinkedIn Profile",         description: "Screenshot of your LinkedIn profile" },
  { value: "other",       label: "Other Credential",         description: "Any other professional document" },
];

const STATUS_CONFIG = {
  pending:       { icon: Clock,        color: "text-yellow-500", bg: "bg-yellow-50",  label: "Pending",       desc: "Waiting for AI analysis" },
  analyzing:     { icon: Clock,        color: "text-blue-500",   bg: "bg-blue-50",    label: "Analyzing",     desc: "AI is reviewing your document" },
  verified:      { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",   label: "Verified",      desc: "Successfully verified" },
  manual_review: { icon: AlertCircle,  color: "text-orange-500", bg: "bg-orange-50",  label: "Under Review",  desc: "Admin is reviewing your document" },
  rejected:      { icon: XCircle,      color: "text-red-500",    bg: "bg-red-50",     label: "Not Verified",  desc: "Document could not be verified" },
};

function VerificationRecord({ record }: { record: ProfileVerification }) {
  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const docLabel = DOC_TYPES.find((d) => d.value === record.docType)?.label ?? record.docType;

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg border", cfg.bg)}>
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", cfg.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{docLabel}</span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.bg, cfg.color, "border")}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{record.claimToVerify}</p>
        {record.aiReasoning && (
          <p className="text-xs mt-1 text-foreground/70 italic">"{record.aiReasoning}"</p>
        )}
        {record.aiConfidence !== null && (
          <p className="text-xs text-muted-foreground mt-0.5">AI confidence: {record.aiConfidence}%</p>
        )}
        {record.adminNote && (
          <p className="text-xs text-muted-foreground mt-0.5 italic">Admin note: {record.adminNote}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Submitted {new Date(record.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

type Step = "type" | "upload" | "claim" | "done";

export function VerificationUploadPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const [step, setStep] = useState<Step>("type");
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [claim, setClaim] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ProfileVerification[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRecords = useCallback(async () => {
    if (!token) return;
    setLoadingRecords(true);
    try {
      const res = await getMyVerifications(token);
      setRecords(res.verifications);
    } catch { /* ignore */ }
    finally { setLoadingRecords(false); }
  }, [token]);

  // Load history when reaching "done" step
  const handleDone = useCallback(() => {
    setStep("done");
    loadRecords();
  }, [loadRecords]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    if (!file || !docType || !claim.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await uploadVerificationDocument(token, file, docType, claim.trim());
      handleDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 1: Choose document type ──────────────────────────────
  if (step === "type") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
            Get Verified
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a credential document. Our AI will verify it and add a verified badge to your profile.
          </p>
        </div>

        <div className="grid gap-3">
          {DOC_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => { setDocType(type.value); setStep("upload"); }}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border text-left transition-colors hover:border-blue-400 hover:bg-blue-50/50",
                docType === type.value ? "border-blue-500 bg-blue-50" : "border-border"
              )}
            >
              <div>
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 2: Upload file ───────────────────────────────────────
  if (step === "upload") {
    const selectedType = DOC_TYPES.find((d) => d.value === docType);
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <button onClick={() => setStep("type")} className="text-xs text-muted-foreground hover:text-foreground mb-2">← Back</button>
          <h2 className="text-xl font-semibold">Upload {selectedType?.label}</h2>
          <p className="text-sm text-muted-foreground">{selectedType?.description} — PDF, JPG, or PNG, max 10 MB</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
            dragging ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-400 hover:bg-muted/30"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              {file.type === "application/pdf"
                ? <FileText className="h-10 w-10 text-red-500" />
                : <Image className="h-10 w-10 text-blue-500" />
              }
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-blue-500">Click to change file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-10 w-10" />
              <p className="font-medium text-sm">Drag & drop or click to upload</p>
              <p className="text-xs">PDF, JPG, PNG, WebP — max 10 MB</p>
            </div>
          )}
        </div>

        <Button onClick={() => setStep("claim")} disabled={!file} className="w-full">
          Continue
        </Button>
      </div>
    );
  }

  // ── Step 3: Describe the claim ────────────────────────────────
  if (step === "claim") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <button onClick={() => setStep("upload")} className="text-xs text-muted-foreground hover:text-foreground mb-2">← Back</button>
          <h2 className="text-xl font-semibold">What does this document prove?</h2>
          <p className="text-sm text-muted-foreground">Help our AI understand what to verify.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="claim">Describe the credential (be specific)</Label>
          <Textarea
            id="claim"
            placeholder="e.g. I am a CFA charterholder issued by CFA Institute in 2021"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">{claim.length}/300</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!claim.trim() || submitting} className="w-full">
          {submitting ? "Submitting…" : "Submit for Verification"}
        </Button>
      </div>
    );
  }

  // ── Step 4: Done + history ────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-4 pt-6">
          <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Document submitted successfully</p>
            <p className="text-sm text-green-700 mt-0.5">
              Our AI is reviewing your document. You'll receive a notification when it's done — usually within a few minutes.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">Your Verification History</h3>
        {loadingRecords ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => <VerificationRecord key={r.id} record={r} />)}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={() => { setStep("type"); setFile(null); setClaim(""); setDocType(""); }}>
        Submit Another Document
      </Button>
    </div>
  );
}
