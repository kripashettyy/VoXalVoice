import type { SynthesisParams } from "./synthesis";

/**
 * VoiceParamsSnapshot is an alias for SynthesisParams, used to capture
 * the exact parameter state at the time a profile is saved.
 */
export type VoiceParamsSnapshot = SynthesisParams;

/**
 * VoiceProfile represents a named, saved set of voice parameters stored
 * in browser localStorage under the key `voxalvoice_profiles`.
 * Up to 20 profiles may be stored per browser origin.
 */
export interface VoiceProfile {
  id: string;          // UUID v4
  name: string;        // 1–50 non-whitespace characters
  createdAt: number;   // Unix timestamp (ms)
  params: VoiceParamsSnapshot;
}
