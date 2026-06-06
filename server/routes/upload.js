import path from "path";
import multer from "multer";
import { Router } from "express";
import { config, isSupabaseConfigured } from "../config.js";
import { createAuthenticate } from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function createUploadRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  router.post("/", authenticate, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded." });

      if (!isSupabaseConfigured) {
        return res.status(503).json({ message: "File uploads are not available — storage is not configured on this server." });
      }

      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error } = await supabase.storage.from("uploads").upload(filename, req.file.buffer, { contentType: req.file.mimetype });
      if (error) return res.status(500).json({ message: "Upload failed.", error: error.message });

      const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(filename);
      res.json({ message: "File uploaded successfully.", url: publicUrl, filename });
    } catch (err) { next(err); }
  });

  return router;
}
