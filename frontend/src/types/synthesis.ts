/**
 * TonePreset represents the available frequency/tone shaping presets.
 * Maps to the tone_preset field in POST /api/v1/synthesize.
 */
export type TonePreset = "neutral" | "warm" | "crisp";

/**
 * SynthesisParams holds all voice parameter values used for a synthesis request.
 * Used by the voiceParams store and passed to API client functions.
 *
 * - warmth: 0.0–1.0 (controls low-frequency resonance; maps from UI range 0–100)
 * - clarity: 0.0–1.0 (controls high-frequency articulation; maps from UI range 0–100)
 * - volume: 0.0–1.0
 */
export interface SynthesisParams {
  voiceId: string;
  pitch: number;
  speed: number;
  volume: number;
  tonePreset: TonePreset;
  naturalFlow: boolean;
  warmth: number;   // 0.0–1.0
  clarity: number;  // 0.0–1.0
  outputFormat: "wav";
}
