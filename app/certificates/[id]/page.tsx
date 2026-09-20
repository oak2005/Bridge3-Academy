import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { certificateAdapter } from "@/lib/certificates/adapter";
import { CertificateActions } from "@/components/certificates/CertificateActions";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await certificateAdapter.verifyCertificate(supabaseAdmin, params.id);
  if (!result.valid || !result.certificate) {
    return { title: "Certificate Not Found · Bridge3 Academy" };
  }

  const studentName = result.student?.fullName || "Scholar";
  const trackTitle = result.track?.title || "Web3 Curriculum";

  return {
    title: `Verified Certificate: ${studentName} — ${trackTitle} | Bridge3 Academy`,
    description: `Official verified Certificate of Completion issued to ${studentName} for completing ${trackTitle} at Bridge3 Academy.`,
    openGraph: {
      title: `Verified Certificate — ${studentName}`,
      description: `Official Certificate of Completion in ${trackTitle} at Bridge3 Academy.`,
    },
  };
}

export default async function PublicCertificatePage({ params }: Props) {
  const { id } = params;

  const result = await certificateAdapter.verifyCertificate(supabaseAdmin, id);
  if (!result.valid || !result.certificate) {
    notFound();
  }

  const { certificate, student, track } = result;
  const studentName = student?.fullName || certificate.metadata?.studentName || "Bridge3 Scholar";
  const trackTitle = track?.title || certificate.metadata?.trackTitle || "Web3 Specialization Track";
  const trackDescription = track?.description || "Curriculum covering Bitcoin fundamentals, Stacks Layer 2, wallets, and smart contracts.";
  
  const issueDateFormatted = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const stats = certificate.metadata?.stats;

  return (
    <main className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation & actions (hidden when printing) */}
        <div className="no-print mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Authenticity
            </span>
          </div>
        </div>

        {/* Action bar for printing and sharing */}
        <CertificateActions
          certificateNumber={certificate.certificateNumber}
          studentName={studentName}
          trackTitle={trackTitle}
        />

        {/* The Official Certificate Frame */}
        <div className="certificate-frame relative overflow-hidden rounded-2xl border-4 border-[#C5A059] bg-[#FCFBF7] p-8 sm:p-12 shadow-xl text-center text-[#1A1A1A]">
          {/* Subtle Guilloche / Security watermark background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] select-none"
            style={{
              backgroundImage:
                "radial-gradient(#C5A059 1px, transparent 1px), radial-gradient(#1A1A1A 1px, #FCFBF7 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />

          {/* Ornamental Inner Border */}
          <div className="relative z-10 rounded-xl border border-[#C5A059]/40 p-6 sm:p-10">
            {/* Academy Header */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C5A059] bg-white shadow-sm">
                <span className="font-display text-xl font-bold text-[#C5A059]">B3</span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] font-semibold text-[#8C6D37]">
                Bridge3 Academy
              </p>
              <h1 className="mt-2 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#111827]">
                Certificate of Completion
              </h1>
              <div className="mt-2 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />
            </div>

            {/* Recipient text */}
            <p className="mt-8 text-xs sm:text-sm uppercase tracking-wider text-[#6B7280]">
              This is to certify that
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold text-[#0F172A] underline decoration-[#C5A059]/40 underline-offset-8">
              {studentName}
            </h2>

            <p className="mt-6 mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-[#475569]">
              has successfully completed all required modules, passed server-graded assessments, submitted peer-reviewed workshop assignments, and demonstrated mastery in
            </p>

            {/* Track Name */}
            <div className="mt-4 inline-block rounded-lg border border-[#C5A059]/30 bg-white/80 px-6 py-3 shadow-sm">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1E293B]">
                {trackTitle}
              </h3>
            </div>

            <p className="mt-2 mx-auto max-w-lg text-xs text-[#64748B] italic">
              {trackDescription}
            </p>

            {/* Competency & Verification Grid */}
            {stats && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mx-auto text-left">
                <div className="rounded border border-[#E2E8F0] bg-white p-2.5 text-center">
                  <p className="text-lg font-bold text-[#1E293B]">{stats.lessons}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Lessons Completed</p>
                </div>
                <div className="rounded border border-[#E2E8F0] bg-white p-2.5 text-center">
                  <p className="text-lg font-bold text-[#1E293B]">{stats.quizzes}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Quizzes Passed</p>
                </div>
                <div className="rounded border border-[#E2E8F0] bg-white p-2.5 text-center">
                  <p className="text-lg font-bold text-[#1E293B]">{stats.assignments}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Assignments Approved</p>
                </div>
                <div className="rounded border border-[#E2E8F0] bg-white p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-700">✓</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Capstone Completed</p>
                </div>
              </div>
            )}

            {/* Signatures & Seal Footer */}
            <div className="mt-12 pt-8 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 items-end gap-6 text-center">
              {/* Left: Issue Date & Number */}
              <div className="text-xs text-[#64748B] sm:text-left">
                <p className="font-medium text-[#1E293B]">Date of Issue:</p>
                <p>{issueDateFormatted}</p>
                <p className="mt-1 font-mono text-[11px] text-[#475569]">
                  ID: {certificate.certificateNumber}
                </p>
              </div>

              {/* Center: Gold Foil Official Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#C5A059] bg-gradient-to-br from-[#FCFBF7] to-[#F3E8CE] shadow-md">
                  <div className="h-16 w-16 rounded-full border border-dashed border-[#C5A059] flex flex-col items-center justify-center p-1">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-[#8C6D37]">
                      VERIFIED
                    </span>
                    <span className="text-xs">★</span>
                    <span className="text-[8px] font-bold text-[#8C6D37]">ACADEMY</span>
                  </div>
                </div>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-[#8C6D37] font-semibold">
                  Official Credential
                </span>
              </div>

              {/* Right: Signature */}
              <div className="text-xs text-[#64748B] sm:text-right">
                <div className="mx-auto sm:ml-auto sm:mr-0 h-9 w-32 border-b border-[#94A3B8] flex items-end justify-center pb-1">
                  <span className="font-serif italic text-base text-[#1E293B]">Oyetundun Taiwo</span>
                </div>
                <p className="mt-1 font-medium text-[#1E293B]">Oyetundun Taiwo</p>
                <p className="text-[11px] text-[#64748B]">Founder, Bridge3 Academy</p>
              </div>
            </div>

            {/* Security Verification Hash Footnote */}
            <div className="mt-8 pt-4 border-t border-[#E2E8F0]/50 text-center">
              <p className="text-[10px] font-mono text-[#94A3B8] break-all">
                Verification Hash: {certificate.verificationHash}
              </p>
              <p className="mt-1 text-[10px] text-[#94A3B8]">
                Authenticity guaranteed by Bridge3 Academy verification engine · Built for the Stacks &amp; Bitcoin ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
