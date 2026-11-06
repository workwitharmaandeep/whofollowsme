import JSZip from "jszip";
import type { InstagramData, InstagramUser, RawInstagramEntry } from "./types";

// ─── Resilient entry parser ───
function parseEntry(entry: RawInstagramEntry): InstagramUser {
  let username = "";
  let href = "";
  let timestamp = 0;

  // Modern 2024-2026 format with label_values
  if (entry.label_values && Array.isArray(entry.label_values)) {
    const userField = entry.label_values.find(
      (lv) => lv.label && lv.label.toLowerCase() === "username"
    );
    if (userField?.value) username = userField.value;

    const urlField = entry.label_values.find(
      (lv) => lv.label && lv.label.toLowerCase() === "url"
    );
    if (urlField?.value) href = urlField.value;
  }

  // Classic string_list_data format
  if (!username && entry.string_list_data?.[0]?.value) {
    username = entry.string_list_data[0].value;
  }
  if (!href && entry.string_list_data?.[0]?.href) {
    href = entry.string_list_data[0].href;
  }
  if (entry.string_list_data?.[0]?.timestamp) {
    timestamp = entry.string_list_data[0].timestamp;
  }

  // Fallback to title
  if (!username && entry.title) {
    username = entry.title;
  }

  // Fallback timestamp on root entry
  if (!timestamp && entry.timestamp) {
    timestamp = entry.timestamp;
  }

  // Construct standard Instagram profile href if empty or placeholder
  if (!href || href === "") {
    href = username ? `https://www.instagram.com/${username}` : "https://www.instagram.com";
  }

  return {
    username: username || "unknown",
    href,
    timestamp,
  };
}

// ─── Extract array from root (handles both raw array and object-wrapped) ───
function extractArray(
  data: unknown,
  ...keys: string[]
): RawInstagramEntry[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val;
    }
    // Try first key found
    const values = Object.values(data as Record<string, unknown>);
    for (const v of values) {
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

// ─── Find files in zip by basename pattern ───
function findFiles(
  zip: JSZip,
  pattern: RegExp
): { path: string; entry: JSZip.JSZipObject }[] {
  const results: { path: string; entry: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    const basename = relativePath.split("/").pop()?.toLowerCase() || "";
    if (pattern.test(basename)) {
      results.push({ path: relativePath, entry: zipEntry });
    }
  });
  return results;
}

function findFile(
  zip: JSZip,
  pattern: RegExp
): { path: string; entry: JSZip.JSZipObject } | null {
  const results = findFiles(zip, pattern);
  return results.length > 0 ? results[0] : null;
}

// ─── Parse a JSON file from the zip ───
async function parseJsonFile(entry: JSZip.JSZipObject): Promise<unknown> {
  const text = await entry.async("text");
  return JSON.parse(text);
}

// ─── Parse all follower files (followers_1.json, followers_2.json, ...) ───
async function parseFollowerFiles(
  zip: JSZip,
  onProgress?: (step: string) => void
): Promise<InstagramUser[]> {
  const files = findFiles(zip, /^followers_\d+\.json$/i);
  if (files.length === 0) {
    // Fallback: try just "followers.json"
    const single = findFile(zip, /^followers\.json$/i);
    if (single) {
      files.push(single);
    }
  }

  const allFollowers: InstagramUser[] = [];
  for (const file of files) {
    onProgress?.(`Parsing ${file.path.split("/").pop()}...`);
    const data = await parseJsonFile(file.entry);
    const entries = extractArray(data, "relationships_followers");
    for (const entry of entries) {
      allFollowers.push(parseEntry(entry));
    }
  }
  return allFollowers;
}

// ─── Parse a named file with a known root key ───
async function parseNamedFile(
  zip: JSZip,
  filenamePattern: RegExp,
  rootKey: string,
  onProgress?: (step: string) => void
): Promise<InstagramUser[]> {
  const file = findFile(zip, filenamePattern);
  if (!file) return [];

  onProgress?.(`Parsing ${file.path.split("/").pop()}...`);
  const data = await parseJsonFile(file.entry);
  const entries = extractArray(data, rootKey);
  return entries.map(parseEntry);
}

// ─── Main export: Parse an Instagram ZIP file ───
export async function parseInstagramZip(
  file: File,
  onProgress?: (step: string) => void
): Promise<InstagramData> {
  onProgress?.("Loading ZIP file...");
  const zip = await JSZip.loadAsync(file);

  // Detect HTML-only export
  const allFiles: string[] = [];
  zip.forEach((path, entry) => {
    if (!entry.dir) allFiles.push(path);
  });

  const jsonFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".json"));
  const htmlFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".html"));

  if (jsonFiles.length === 0) {
    if (htmlFiles.length > 0) {
      throw new Error("HTML_FORMAT_DETECTED");
    }
    throw new Error("NO_DATA_FILES");
  }

  // ─── Auto-detect account owner's ID / username from export ───
  let detectedUsername: string | undefined = undefined;

  // 1. Try standard Instagram export ZIP filename:
  // e.g. "instagram-iarmaandeepsingh-2026-10-28-GqULFReW.zip"
  if (file.name) {
    const filenameMatch = file.name.match(
      /^instagram-([a-zA-Z0-9._]+?)(?:-\d{4}(?:-\d{2}-\d{2})?.*|\.zip|$)/i
    );
    if (filenameMatch && filenameMatch[1]) {
      detectedUsername = filenameMatch[1].toLowerCase().replace(/^@/, "");
    }
  }

  // 2. Try extracting from ZIP internal root folder (e.g. "instagram-<username>/...")
  if (!detectedUsername) {
    for (const p of allFiles) {
      const folderMatch = p.match(/^instagram-([a-zA-Z0-9._]+)[\/\\]/i);
      if (folderMatch && folderMatch[1]) {
        detectedUsername = folderMatch[1].toLowerCase().replace(/^@/, "");
        break;
      }
    }
  }

  // 3. Try personal_information.json / profile_information.json / account_information.json if present
  if (!detectedUsername) {
    const profileFile = findFile(zip, /^(?:personal_information|profile_information|account_information)\.json$/i);
    if (profileFile) {
      try {
        const rawProfile = (await parseJsonFile(profileFile.entry)) as Record<string, unknown>;
        if (Array.isArray(rawProfile.profile_user)) {
          const first = rawProfile.profile_user[0] as {
            string_list_data?: Array<{ value?: string }>;
            label_values?: Array<{ label?: string; value?: string }>;
          };
          if (first?.string_list_data?.[0]?.value) {
            detectedUsername = first.string_list_data[0].value.toLowerCase().replace(/^@/, "");
          } else if (first?.label_values && Array.isArray(first.label_values)) {
            const userField = first.label_values.find(
              (lv) => lv.label && lv.label.toLowerCase() === "username"
            );
            if (userField?.value) {
              detectedUsername = userField.value.toLowerCase().replace(/^@/, "");
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  onProgress?.("Parsing followers...");
  const followers = await parseFollowerFiles(zip, onProgress);

  onProgress?.("Parsing following...");
  const following = await parseNamedFile(
    zip,
    /^following\.json$/i,
    "relationships_following",
    onProgress
  );

  onProgress?.("Parsing pending requests...");
  const pendingRequests = await parseNamedFile(
    zip,
    /^pending_follow_requests\.json$/i,
    "relationships_follow_requests_sent",
    onProgress
  );

  onProgress?.("Parsing recently unfollowed...");
  const recentlyUnfollowed = await parseNamedFile(
    zip,
    /^recently_unfollowed_profiles\.json$/i,
    "relationships_unfollowed_users",
    onProgress
  );

  onProgress?.("Parsing close friends...");
  const closeFriends = await parseNamedFile(
    zip,
    /^close_friends\.json$/i,
    "relationships_close_friends",
    onProgress
  );

  onProgress?.("Parsing restricted/blocked profiles...");
  let restrictedProfiles = await parseNamedFile(
    zip,
    /^restricted_profiles\.json$/i,
    "relationships_restricted_users",
    onProgress
  );
  if (restrictedProfiles.length === 0) {
    restrictedProfiles = await parseNamedFile(
      zip,
      /^blocked_profiles\.json$/i,
      "relationships_blocked_users",
      onProgress
    );
  }

  onProgress?.("Done!");
  return {
    detectedUsername,
    followers,
    following,
    pendingRequests,
    recentlyUnfollowed,
    closeFriends,
    restrictedProfiles,
  };
}
