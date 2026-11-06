"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

interface GuideStep {
  number: string;
  title: string;
  summary: string;
  detail: string;
  tip?: string;
  image: string;
}

const guideSteps: GuideStep[] = [
  {
    number: "01",
    title: "Open Instagram Profile Menu",
    summary: "Go to your profile and tap the hamburger menu icon (≡).",
    detail: "Open the Instagram app on your phone, go to your profile tab in the bottom right, and tap the 3 horizontal lines (menu) in the top-right corner.",
    image: "/screenshots/Screenshot_2026-11-05-21-18-53-56_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "02",
    title: "Tap 'Meta Account' Center",
    summary: "In Settings and activity, open the Meta Account banner.",
    detail: "At the very top of 'Settings and activity', tap the Meta Accounts Center banner ('Password, security, personal details, ad preferences').",
    image: "/screenshots/Screenshot_2026-11-05-21-20-45-53_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "03",
    title: "Your Information and Permissions",
    summary: "Select 'Your information and permissions'.",
    detail: "Inside the Accounts Center hub, scroll down slightly and tap the 'Your information and permissions' row.",
    image: "/screenshots/Screenshot_2026-11-05-21-20-52-55_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "04",
    title: "Export Your Information",
    summary: "Tap 'Export your information'.",
    detail: "On the permissions screen, tap 'Export your information' (with the external link icon).",
    image: "/screenshots/Screenshot_2026-11-05-21-20-56-55_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "05",
    title: "Create Export Request",
    summary: "Tap the blue 'Create export' button.",
    detail: "Under the 'Export your information' screen, tap the prominent blue 'Create export' button to start configuring your download.",
    image: "/screenshots/Screenshot_2026-11-05-21-21-17-36_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "06",
    title: "Choose Your Profile",
    summary: "Select your Instagram account profile.",
    detail: "If you have multiple connected Meta accounts (Facebook, Threads, WhatsApp), make sure to select your specific Instagram profile.",
    image: "/screenshots/Screenshot_2026-11-05-21-21-30-53_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "07",
    title: "Choose 'Export to Device'",
    summary: "Select the 'Export to device' option.",
    detail: "Under 'Choose where to export', select 'Export to device' so Instagram prepares a downloadable ZIP file archive.",
    image: "/screenshots/Screenshot_2026-11-05-21-21-44-93_1c337646f29875672b5a61192b9010f9.jpg",
  },
  {
    number: "08",
    title: "Set Format to JSON (Critical!)",
    summary: "Choose JSON format and All time date range.",
    detail: "Under 'Confirm your export', verify: Format must be set to 'JSON' (NOT HTML) so the data can be parsed. Set Date range to 'All time' to include complete follower history.",
    tip: "Critical: HTML format will NOT work with relationship analytics. Always ensure 'Format: JSON' is selected.",
    image: "/screenshots/Screenshot_2026-11-05-21-22-27-74.jpg",
  },
  {
    number: "09",
    title: "Start Export & Upload ZIP",
    summary: "Tap 'Start export' and drop the downloaded ZIP here.",
    detail: "Tap the blue 'Start export' button. Meta will process your file and send a download notification/email. Once downloaded, drop the .zip file directly into WhoFollowsMe!",
    image: "/screenshots/Screenshot_2026-11-05-21-22-45-73_1c337646f29875672b5a61192b9010f9.jpg",
  },
];

export default function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const activeStep = guideSteps[activeStepIndex];

  return (
    <div className="card transition-all overflow-hidden">
      {/* Header Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-white/[0.015] transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            How to export from Instagram
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
          <span>{isOpen ? "Hide" : "Show guide"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 pb-6 sm:px-6 sm:pb-7 border-t border-zinc-100 dark:border-white/[0.04] pt-5 space-y-5">
          {/* Step Pill Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 tab-scroll">
            {guideSteps.map((step, idx) => (
              <button
                key={step.number}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  idx === activeStepIndex
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span>Step {step.number}</span>
                {idx === activeStepIndex && <CheckCircle2 className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Interactive Step Viewer with Real Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-4 sm:p-6">
            {/* Left: Step Description & Navigation */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30">
                <Smartphone className="w-3 h-3" />
                <span>STEP {activeStep.number} OF 09</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeStep.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {activeStep.summary}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {activeStep.detail}
              </p>

              {activeStep.tip && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                  <strong>💡 Tip: </strong>
                  {activeStep.tip}
                </div>
              )}

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeStepIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.07] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setActiveStepIndex((prev) => Math.min(guideSteps.length - 1, prev + 1))}
                  disabled={activeStepIndex === guideSteps.length - 1}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setLightboxImage(activeStep.image)}
                  className="ml-auto flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom Screenshot</span>
                </button>
              </div>
            </div>

            {/* Right: Realistic Phone Frame with actual screenshot */}
            <div className="md:col-span-5 flex justify-center">
              <div
                onClick={() => setLightboxImage(activeStep.image)}
                className="group relative cursor-zoom-in rounded-[2rem] p-2 bg-zinc-900 border-4 border-zinc-800 shadow-2xl transition-transform hover:scale-[1.02]"
              >
                {/* Mobile camera notch mockup */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-zinc-800 rounded-full z-10" />

                <div className="relative rounded-[1.5rem] overflow-hidden bg-black w-[200px] h-[433px]">
                  <Image
                    src={activeStep.image}
                    alt={activeStep.title}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                    priority={activeStepIndex < 2}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>Tap to Enlarge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick link to Accounts Center */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04] text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
              Jump straight to Instagram&apos;s export page on your computer:
            </span>
            <a
              href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shrink-0"
            >
              <span>Open Accounts Center</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-sm w-full h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 z-20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={lightboxImage}
                alt="Enlarged Instagram Screenshot"
                fill
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
