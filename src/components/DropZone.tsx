"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, FileArchive, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseInstagramZip } from "@/lib/zipParser";
import type { InstagramData } from "@/lib/types";

interface DropZoneProps {
  onDataParsed: (data: InstagramData) => void;
}

export default function DropZone({ onDataParsed }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".zip")) {
        setError("Please upload the .zip file directly downloaded from Instagram.");
        return;
      }

      setIsProcessing(true);
      setError(null);
      setSuccess(false);
      setProgress("Reading ZIP contents...");

      try {
        const data = await parseInstagramZip(file, (step) => {
          setProgress(step);
        });

        if (data.followers.length === 0 && data.following.length === 0) {
          setError(
            'No followers or following records found. When downloading from Instagram, ensure you select "Followers and following" with format JSON.'
          );
          setIsProcessing(false);
          return;
        }

        setSuccess(true);
        const userNotice = data.detectedUsername ? ` for @${data.detectedUsername}` : "";
        setProgress(
          `Found ${data.followers.length} followers and ${data.following.length} following${userNotice}.`
        );
        onDataParsed(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Parsing error";
        if (message === "HTML_FORMAT_DETECTED") {
          setError(
            'This export was downloaded as HTML. Please re-download from Instagram Settings and select "JSON" format.'
          );
        } else if (message === "NO_DATA_FILES") {
          setError(
            "No recognized Instagram connection JSON files found inside this archive."
          );
        } else {
          setError(`Failed to extract data: ${message}`);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [onDataParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 py-10 sm:py-14 px-8 text-center ${
          isDragging
            ? "border-violet-400 bg-violet-500/[0.04] dark:bg-violet-500/[0.07] scale-[1.005]"
            : "border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60"
        } ${isProcessing ? "pointer-events-none opacity-70" : ""}`}
        id="dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />

        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
          {isProcessing ? (
            <>
              <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center animate-pulse">
                <FileArchive className="w-5 h-5" />
              </div>
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Processing archive…
                </p>
                <p className="text-xs text-zinc-400 truncate">{progress}</p>
                <div className="w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-violet-500 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            </>
          ) : success ? (
            <>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {progress}
              </p>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Drop your Instagram <span className="font-semibold">.zip</span>{" "}
                  <span className="font-normal text-zinc-400">or click to browse</span>
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                  Processed entirely in your browser.
                  <br />
                  Never uploaded. Never shared.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
