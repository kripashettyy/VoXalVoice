export interface VoiceInfo {
  id: string;
  name: string;
  gender: "male" | "female";
  engine: string;
  locale?: string;
}
