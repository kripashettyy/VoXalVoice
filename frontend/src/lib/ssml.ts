export type SsmlTag =
  | { type: 'break'; strength?: 'x-weak' | 'weak' | 'medium' | 'strong' | 'x-strong'; time?: string }
  | { type: 'emphasis'; level: 'reduced' | 'none' | 'moderate' | 'strong' }
  | { type: 'prosody'; pitch?: string; rate?: string; volume?: string }

export interface SsmlNode {
  id: string
  kind: 'text' | 'break' | 'emphasis' | 'prosody'
  text?: string
  tag?: SsmlTag
}

export function serialize(nodes: SsmlNode[]): string {
  const inner = nodes
    .map((n) => {
      if (n.kind === 'text') return escapeXml(n.text ?? '')
      if (n.kind === 'break') {
        const t = n.tag as Extract<SsmlTag, { type: 'break' }>
        const attrs = [
          t.strength ? `strength="${t.strength}"` : '',
          t.time ? `time="${t.time}"` : '',
        ]
          .filter(Boolean)
          .join(' ')
        return `<break${attrs ? ' ' + attrs : ''}/>`
      }
      if (n.kind === 'emphasis') {
        const t = n.tag as Extract<SsmlTag, { type: 'emphasis' }>
        return `<emphasis level="${t.level}">${escapeXml(n.text ?? '')}</emphasis>`
      }
      if (n.kind === 'prosody') {
        const t = n.tag as Extract<SsmlTag, { type: 'prosody' }>
        const attrs = [
          t.pitch ? `pitch="${t.pitch}"` : '',
          t.rate ? `rate="${t.rate}"` : '',
          t.volume ? `volume="${t.volume}"` : '',
        ]
          .filter(Boolean)
          .join(' ')
        return `<prosody${attrs ? ' ' + attrs : ''}>${escapeXml(n.text ?? '')}</prosody>`
      }
      return ''
    })
    .join('')
  return `<speak>${inner}</speak>`
}

export function plainText(nodes: SsmlNode[]): string {
  return nodes.map((n) => (n.kind === 'text' || n.kind === 'emphasis' || n.kind === 'prosody' ? n.text ?? '' : '')).join('')
}

export function extractProsodyParams(nodes: SsmlNode[]): { pitch?: number; speed?: number } {
  for (const n of nodes) {
    if (n.kind === 'prosody') {
      const tag = n.tag as Extract<SsmlTag, { type: 'prosody' }>
      const result: { pitch?: number; speed?: number } = {}
      if (tag.pitch) {
        const m = tag.pitch.match(/([+-]?\d+)%/)
        if (m) result.pitch = Math.max(0.5, Math.min(2.0, 1.0 + parseInt(m[1]) / 100))
      }
      if (tag.rate) {
        const rates: Record<string, number> = { 'x-slow': 0.5, slow: 0.7, medium: 1.0, fast: 1.4, 'x-fast': 1.8 }
        if (rates[tag.rate]) result.speed = rates[tag.rate]
        const m = tag.rate.match(/([+-]?\d+)%/)
        if (m) result.speed = Math.max(0.5, Math.min(2.5, 1.0 + parseInt(m[1]) / 100))
      }
      return result
    }
  }
  return {}
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

let _counter = 0
export function newId(): string {
  return `n${++_counter}`
}

export function stripSsmlTags(ssml: string): string {
  return ssml
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

export function extractProsodyFromRaw(ssml: string): { pitch?: number; speed?: number } {
  const result: { pitch?: number; speed?: number } = {}
  const pitchMatch = ssml.match(/pitch="([+-]?\d+)%"/)
  if (pitchMatch) {
    result.pitch = Math.max(0.5, Math.min(2.0, 1.0 + parseInt(pitchMatch[1]) / 100))
  }
  const rateMatch = ssml.match(/rate="([^"]+)"/)
  if (rateMatch) {
    const rates: Record<string, number> = { 'x-slow': 0.5, slow: 0.7, medium: 1.0, fast: 1.4, 'x-fast': 1.8 }
    if (rates[rateMatch[1]]) {
      result.speed = rates[rateMatch[1]]
    } else {
      const pct = rateMatch[1].match(/([+-]?\d+)%/)
      if (pct) result.speed = Math.max(0.5, Math.min(2.5, 1.0 + parseInt(pct[1]) / 100))
    }
  }
  return result
}
