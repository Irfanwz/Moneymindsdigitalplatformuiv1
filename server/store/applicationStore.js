const TABLE = "profile_applications";
const BUCKET = "registration-documents";

export function createApplicationStore(client, applications = new Map()) {
  const files = new Map();
  let ready;
  async function bucket() {
    ready ||= (async () => {
      const { data, error } = await client.storage.getBucket(BUCKET);
      if (data?.public)
        throw new Error("Registration document storage must be private.");
      if (error) {
        // Only create a missing bucket; permission/network failures must remain failures.
        if (!/not found/i.test(error.message)) throw error;
        const result = await client.storage.createBucket(BUCKET, {
          public: false,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
        });
        if (result.error) throw result.error;
      }
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
    await ready;
    return client.storage.from(BUCKET);
  }
  return {
    async getProfileApplication(userId) {
      if (!client) return structuredClone(applications.get(userId) || null);
      const { data, error } = await client
        .from(TABLE)
        .select("details")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.details ?? null;
    },
    async uploadApplicationDocument(path, file) {
      if (!client) {
        files.set(path, Buffer.from(file.buffer));
        return;
      }
      const storage = await bucket();
      const { error } = await storage.upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
      if (error) throw error;
    },
    async deleteApplicationDocuments(paths) {
      if (!paths.length) return;
      if (!client) {
        paths.forEach((path) => files.delete(path));
        return;
      }
      const { error } = await client.storage.from(BUCKET).remove(paths);
      if (error) throw error;
    },
    async downloadApplicationDocument(path) {
      if (!client) {
        const file = files.get(path);
        return file ? Buffer.from(file) : null;
      }
      const { data, error } = await client.storage.from(BUCKET).download(path);
      if (error) throw error;
      return Buffer.from(await data.arrayBuffer());
    },
  };
}
