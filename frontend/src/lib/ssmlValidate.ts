export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateSsml(raw: string): ValidationResult {
  const errors: string[] = []
  const trimmed = raw.trim()

  if (!trimmed) {
    return { valid: false, errors: ['SSML cannot be empty.'] }
  }

  if (!trimmed.startsWith('<speak>')) {
    errors.push('Must start with <speak>.')
  }
  if (!trimmed.endsWith('</speak>')) {
    errors.push('Must end with </speak>.')
  }

  // Detect obviously unclosed tags (not self-closing)
  const openTagRe = /<(emphasis|prosody|voice|p|s|lang|sub|phoneme)(\s[^>]*)?>(?![\s\S]*?<\/\1>)/g
  let m: RegExpExecArray | null
  while ((m = openTagRe.exec(trimmed)) !== null) {
    errors.push(`Unclosed <${m[1]}> tag.`)
  }

  // Self-closing tags that MUST be self-closing — flag <break ...> without />
  const badBreak = /<break(?:\s[^>]*)?(?<!\/)>/
  if (badBreak.test(trimmed)) {
    errors.push('<break> must be self-closing: <break .../>.')
  }

  // Unescaped & outside of entities
  const bareAmp = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/g
  if (bareAmp.test(trimmed)) {
    errors.push('Unescaped & found — use &amp; instead.')
  }

  return { valid: errors.length === 0, errors }
}
