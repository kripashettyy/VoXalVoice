import { describe, it, expect } from 'vitest'
import { validateSsml } from '@/lib/ssmlValidate'

describe('validateSsml', () => {
  it('valid minimal SSML passes', () => {
    const r = validateSsml('<speak>Hello.</speak>')
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('empty string is invalid', () => {
    const r = validateSsml('')
    expect(r.valid).toBe(false)
    expect(r.errors[0]).toMatch(/empty/i)
  })

  it('whitespace-only is invalid', () => {
    const r = validateSsml('   ')
    expect(r.valid).toBe(false)
  })

  it('missing <speak> opening tag is invalid', () => {
    const r = validateSsml('Hello world.</speak>')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('<speak>'))).toBe(true)
  })

  it('missing </speak> closing tag is invalid', () => {
    const r = validateSsml('<speak>Hello world.')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('</speak>'))).toBe(true)
  })

  it('valid break self-closing passes', () => {
    const r = validateSsml('<speak>Hi<break strength="medium"/>there.</speak>')
    expect(r.valid).toBe(true)
  })

  it('non-self-closing break is invalid', () => {
    const r = validateSsml('<speak>Hi<break strength="medium">there.</speak>')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('<break>'))).toBe(true)
  })

  it('valid emphasis passes', () => {
    const r = validateSsml('<speak><emphasis level="strong">hello</emphasis></speak>')
    expect(r.valid).toBe(true)
  })

  it('unclosed emphasis is invalid', () => {
    const r = validateSsml('<speak><emphasis level="strong">hello</speak>')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('emphasis'))).toBe(true)
  })

  it('valid prosody passes', () => {
    const r = validateSsml('<speak><prosody pitch="+10%">higher</prosody></speak>')
    expect(r.valid).toBe(true)
  })

  it('unclosed prosody is invalid', () => {
    const r = validateSsml('<speak><prosody rate="slow">text</speak>')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('prosody'))).toBe(true)
  })

  it('bare & is invalid', () => {
    const r = validateSsml('<speak>cats & dogs</speak>')
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('&amp;'))).toBe(true)
  })

  it('escaped &amp; is valid', () => {
    const r = validateSsml('<speak>cats &amp; dogs</speak>')
    expect(r.valid).toBe(true)
  })

  it('multiple errors are all reported', () => {
    const r = validateSsml('Hello & world.')
    expect(r.errors.length).toBeGreaterThan(1)
  })

  it('multiline valid SSML passes', () => {
    const ssml = `<speak>
  Hello. <break strength="medium"/>
  <emphasis level="strong">Important.</emphasis>
  <prosody pitch="+5%" rate="slow">Slowly.</prosody>
</speak>`
    const r = validateSsml(ssml)
    expect(r.valid).toBe(true)
  })
})
