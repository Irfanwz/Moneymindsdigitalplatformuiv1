import multer from "multer";
import { randomUUID } from "node:crypto";
import { registrationDocumentSlots } from "../shared/registrationFields.js";

const parse = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
    fields: 1,
    fieldSize: 150 * 1024,
    parts: 11,
  },
}).array("documents", 10);
export function parseRegistration(req, res, next) {
  if (!req.is("multipart/form-data")) return next();
  parse(req, res, (error) => {
    if (error)
      return res
        .status(400)
        .json({
          message:
            "Upload at most 10 documents, up to 5 MB each, with one application.",
        });
    try {
      req.body = JSON.parse(req.body.payload);
      next();
    } catch {
      res.status(400).json({ message: "Invalid application data." });
    }
  });
}
export function validateApplicationFiles(data, files = []) {
  if (files.length !== data.attachments.length)
    throw Object.assign(
      new Error("Attach the documents listed in your application."),
      { status: 400 },
    );
  if (files.reduce((sum, f) => sum + f.size, 0) > 20 * 1024 * 1024)
    throw Object.assign(new Error("Documents must total 20 MB or less."), {
      status: 400,
    });
  for (const file of files) {
    const b = file.buffer;
    const valid =
      (file.mimetype === "application/pdf" &&
        b.subarray(0, 5).toString() === "%PDF-") ||
      (file.mimetype === "image/png" &&
        b
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (file.mimetype === "image/jpeg" &&
        b[0] === 255 &&
        b[1] === 216 &&
        b[2] === 255);
    if (!valid)
      throw Object.assign(
        new Error("Supporting documents must be PDF, JPG or PNG files."),
        { status: 400 },
      );
  }
}
export async function saveApplicationFiles(store, userId, data, files = []) {
  const documents = [],
    paths = [],
    slots = registrationDocumentSlots(data.profiles);
  try {
    for (const [i, file] of files.entries()) {
      const id = randomUUID(),
        path = `${userId}/${id}`,
        key = data.attachments[i].key;
      await store.uploadApplicationDocument(path, file);
      paths.push(path);
      documents.push({
        id,
        path,
        key,
        label: slots.find((s) => s.key === key).label,
        name: file.originalname.replace(/[\r\n\\/]/g, "_").slice(0, 200),
        type: file.mimetype,
        size: file.size,
      });
    }
    return documents;
  } catch (error) {
    await store
      .deleteApplicationDocuments(paths)
      .catch(() =>
        console.error("Could not clean up registration document uploads."),
      );
    throw error;
  }
}
export function visibleApplication(application) {
  if (!application) return null;
  return {
    ...application,
    documents: application.documents.map(({ path, ...doc }) => doc),
  };
}
export async function sendApplicationDocument(store, userId, documentId, res) {
  const application = await store.getProfileApplication(userId);
  const doc = application?.documents.find((d) => d.id === documentId);
  if (!doc) return res.status(404).json({ message: "Document not found." });
  const buffer = await store.downloadApplicationDocument(doc.path);
  if (!buffer) return res.status(404).json({ message: "Document not found." });
  res.set({
    "Content-Type": doc.type,
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(buffer);
}
