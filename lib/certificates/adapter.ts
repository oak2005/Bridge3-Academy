import "server-only";
import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeTrackCompletion, TrackCompletionReport } from "@/lib/progress/trackCompletion";

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentId: string;
  trackId: string;
  issuedAt: string;
  verificationHash: string;
  metadata: {
    studentName?: string;
    trackTitle?: string;
    completionDate?: string;
    stats?: {
      lessons: number;
      quizzes: number;
      assignments: number;
      capstone: boolean;
    };
    network?: "off-chain" | "stacks-testnet" | "stacks-mainnet";
    txId?: string;
    contractAddress?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface IssueCertificateParams {
  studentId: string;
  trackId: string;
  studentName?: string;
}

export interface VerificationResult {
  valid: boolean;
  certificate?: CertificateRecord;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  track?: {
    id: string;
    title: string;
    description: string;
  };
  error?: string;
}

/**
 * Adapter interface for certificate issuance and verification.
 * Designed so Phase 14 can swap in real on-chain Stacks (Clarity SIP-009)
 * minting without changing any UI or caller routes.
 */
export interface CertificateAdapter {
  issueCertificate(
    client: SupabaseClient,
    params: IssueCertificateParams
  ): Promise<{
    success: boolean;
    certificate?: CertificateRecord;
    error?: string;
    completionReport?: TrackCompletionReport;
  }>;

  verifyCertificate(
    client: SupabaseClient,
    identifier: string
  ): Promise<VerificationResult>;
}

/**
 * Generates a human-friendly certificate number (e.g. B3A-2026-A8F29C).
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `B3A-${year}-${randomHex}`;
}

/**
 * Computes a SHA-256 verification hash binding student, track, certificate number, and timestamp.
 */
export function generateVerificationHash(
  studentId: string,
  trackId: string,
  certificateNumber: string,
  issuedAt: string
): string {
  const payload = `bridge3:${studentId}:${trackId}:${certificateNumber}:${issuedAt}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Database implementation: stores certificates in Supabase with cryptographic hashes.
 */
export class DatabaseCertificateAdapter implements CertificateAdapter {
  async issueCertificate(
    client: SupabaseClient,
    params: IssueCertificateParams
  ): Promise<{
    success: boolean;
    certificate?: CertificateRecord;
    error?: string;
    completionReport?: TrackCompletionReport;
  }> {
    const { studentId, trackId, studentName } = params;

    // 1. Check if a certificate has already been issued for this student & track
    const { data: existing } = await client
      .from("certificates")
      .select("*")
      .eq("student_id", studentId)
      .eq("track_id", trackId)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        certificate: {
          id: existing.id,
          certificateNumber: existing.certificate_number,
          studentId: existing.student_id,
          trackId: existing.track_id,
          issuedAt: existing.issued_at,
          verificationHash: existing.verification_hash,
          metadata: existing.metadata || {},
          createdAt: existing.created_at,
        },
      };
    }

    // 2. Single source of truth: compute track completion
    const completion = await computeTrackCompletion(client, studentId, trackId);
    if (!completion.isComplete) {
      return {
        success: false,
        error: "Track completion requirements have not been satisfied.",
        completionReport: completion,
      };
    }

    // 3. Fetch track title for metadata
    const { data: track } = await client
      .from("tracks")
      .select("title")
      .eq("id", trackId)
      .maybeSingle();

    const trackTitle = track?.title || "Web3 Track";
    const issuedAt = new Date().toISOString();
    const certificateNumber = generateCertificateNumber();
    const verificationHash = generateVerificationHash(
      studentId,
      trackId,
      certificateNumber,
      issuedAt
    );

    const metadata = {
      studentName: studentName || "Bridge3 Scholar",
      trackTitle,
      completionDate: issuedAt,
      stats: {
        lessons: completion.completedLessons,
        quizzes: completion.passedQuizzes,
        assignments: completion.approvedAssignments,
        capstone: completion.capstoneApproved,
      },
      network: "off-chain" as const,
    };

    // 4. Insert into database
    const { data: inserted, error: insertError } = await client
      .from("certificates")
      .insert({
        student_id: studentId,
        track_id: trackId,
        certificate_number: certificateNumber,
        issued_at: issuedAt,
        verification_hash: verificationHash,
        metadata,
      })
      .select("*")
      .single();

    if (insertError || !inserted) {
      return {
        success: false,
        error: insertError?.message || "Failed to record certificate.",
      };
    }

    return {
      success: true,
      certificate: {
        id: inserted.id,
        certificateNumber: inserted.certificate_number,
        studentId: inserted.student_id,
        trackId: inserted.track_id,
        issuedAt: inserted.issued_at,
        verificationHash: inserted.verification_hash,
        metadata: inserted.metadata || {},
        createdAt: inserted.created_at,
      },
    };
  }

  async verifyCertificate(
    client: SupabaseClient,
    identifier: string
  ): Promise<VerificationResult> {
    // Identifier can be UUID (id), certificate number, or verification hash
    let query = client.from("certificates").select("*");

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    if (isUUID) {
      query = query.eq("id", identifier);
    } else if (identifier.startsWith("B3A-")) {
      query = query.eq("certificate_number", identifier);
    } else {
      query = query.eq("verification_hash", identifier);
    }

    const { data: cert, error } = await query.maybeSingle();

    if (error || !cert) {
      return { valid: false, error: "Certificate not found." };
    }

    // Fetch student profile info (public safe fields only)
    const { data: profile } = await client
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", cert.student_id)
      .maybeSingle();

    // Fetch track info
    const { data: track } = await client
      .from("tracks")
      .select("id, title, description")
      .eq("id", cert.track_id)
      .maybeSingle();

    return {
      valid: true,
      certificate: {
        id: cert.id,
        certificateNumber: cert.certificate_number,
        studentId: cert.student_id,
        trackId: cert.track_id,
        issuedAt: cert.issued_at,
        verificationHash: cert.verification_hash,
        metadata: cert.metadata || {},
        createdAt: cert.created_at,
      },
      student: profile
        ? {
            id: profile.id,
            fullName: profile.full_name || cert.metadata?.studentName || "Bridge3 Student",
            avatarUrl: profile.avatar_url,
          }
        : undefined,
      track: track
        ? {
            id: track.id,
            title: track.title,
            description: track.description,
          }
        : undefined,
    };
  }
}

/**
 * Phase 14 Stacks On-Chain Adapter interface placeholder.
 * When Phase 14 is activated, this class implements CertificateAdapter
 * using Stacks Clarity SIP-009 contracts.
 */
export class StacksOnChainCertificateAdapter extends DatabaseCertificateAdapter {
  // Phase 14 will override issueCertificate to submit on-chain mint transaction.
}

// Default singleton instance
export const certificateAdapter: CertificateAdapter = new DatabaseCertificateAdapter();
