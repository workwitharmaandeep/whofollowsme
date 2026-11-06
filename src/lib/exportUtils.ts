import type { InstagramUser } from "./types";

export function exportAsCSV(users: InstagramUser[], filename: string): void {
  const header = "Username,Profile URL,Follow Date\n";
  const rows = users
    .map((u) => {
      const date = u.timestamp
        ? new Date(u.timestamp * 1000).toISOString()
        : "Unknown";
      return `${u.username},${u.href},${date}`;
    })
    .join("\n");
  downloadBlob(header + rows, `${filename}.csv`, "text/csv");
}

export function exportAsTXT(users: InstagramUser[], filename: string): void {
  const content = users.map((u) => u.username).join("\n");
  downloadBlob(content, `${filename}.txt`, "text/plain");
}

function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
