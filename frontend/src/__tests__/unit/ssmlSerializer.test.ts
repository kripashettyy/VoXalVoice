import { describe, it, expect } from 'vitest'
import { serialize, plainText } from '@/lib/ssml'
import type { SsmlNode } from '@/lib/ssml'

//  serialize 

describe('serialize', () => {
  it('wraps output in <speak> tags', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: 'Hello.' }]
    const out = serialize(nodes)
    expect(out).toMatch(/^<speak>/)
    expect(out).toMatch(/<\/speak>$/)
  })

  it('serializes a plain text node', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: 'Hello world.' }]
    expect(serialize(nodes)).toBe('<speak>Hello world.</speak>')
  })

  it('serializes a break node with strength', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'break', tag: { type: 'break', strength: 'medium' } }]
    expect(serialize(nodes)).toBe('<speak><break strength="medium"/></speak>')
  })

  it('serializes a break node with no attributes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'break', tag: { type: 'break' } }]
    expect(serialize(nodes)).toBe('<speak><break/></speak>')
  })

  it('serializes an emphasis node', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'emphasis', text: 'important', tag: { type: 'emphasis', level: 'strong' } }]
    expect(serialize(nodes)).toBe('<speak><emphasis level="strong">important</emphasis></speak>')
  })

  it('serializes a prosody node with pitch', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'prosody', text: 'higher', tag: { type: 'prosody', pitch: '+10%' } }]
    expect(serialize(nodes)).toBe('<speak><prosody pitch="+10%">higher</prosody></speak>')
  })

  it('serializes a prosody node with rate and volume', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'prosody', text: 'text', tag: { type: 'prosody', rate: 'slow', volume: 'loud' } }]
    expect(serialize(nodes)).toBe('<speak><prosody rate="slow" volume="loud">text</prosody></speak>')
  })

  it('serializes a prosody node with all three attributes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'prosody', text: 'hi', tag: { type: 'prosody', pitch: '+5%', rate: 'fast', volume: '+3dB' } }]
    const out = serialize(nodes)
    expect(out).toContain('pitch="+5%"')
    expect(out).toContain('rate="fast"')
    expect(out).toContain('volume="+3dB"')
  })

  it('serializes multiple nodes in order', () => {
    const nodes: SsmlNode[] = [
      { id: '1', kind: 'text', text: 'Hello' },
      { id: '2', kind: 'break', tag: { type: 'break', strength: 'strong' } },
      { id: '3', kind: 'text', text: 'World.' },
    ]
    expect(serialize(nodes)).toBe('<speak>Hello<break strength="strong"/>World.</speak>')
  })

  it('escapes & in text', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: 'cats & dogs' }]
    expect(serialize(nodes)).toBe('<speak>cats &amp; dogs</speak>')
  })

  it('escapes < in text', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: '1 < 2' }]
    expect(serialize(nodes)).toBe('<speak>1 &lt; 2</speak>')
  })

  it('escapes > in text', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: '2 > 1' }]
    expect(serialize(nodes)).toBe('<speak>2 &gt; 1</speak>')
  })

  it('escapes " in text', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: 'say "hello"' }]
    expect(serialize(nodes)).toBe('<speak>say &quot;hello&quot;</speak>')
  })

  it('escapes special chars inside emphasis', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'emphasis', text: 'a & b', tag: { type: 'emphasis', level: 'moderate' } }]
    expect(serialize(nodes)).toBe('<speak><emphasis level="moderate">a &amp; b</emphasis></speak>')
  })

  it('returns <speak></speak> for empty node list', () => {
    expect(serialize([])).toBe('<speak></speak>')
  })

  it('returns <speak></speak> for text node with empty string', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: '' }]
    expect(serialize(nodes)).toBe('<speak></speak>')
  })

  it('omits undefined prosody attributes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'prosody', text: 'hi', tag: { type: 'prosody', pitch: '+5%' } }]
    const out = serialize(nodes)
    expect(out).not.toContain('rate=')
    expect(out).not.toContain('volume=')
  })

  it('serializes break with time attribute', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'break', tag: { type: 'break', time: '500ms' } }]
    expect(serialize(nodes)).toBe('<speak><break time="500ms"/></speak>')
  })
})

//  plainText 

describe('plainText', () => {
  it('extracts text from text nodes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text', text: 'Hello world.' }]
    expect(plainText(nodes)).toBe('Hello world.')
  })

  it('extracts text from emphasis nodes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'emphasis', text: 'important', tag: { type: 'emphasis', level: 'strong' } }]
    expect(plainText(nodes)).toBe('important')
  })

  it('extracts text from prosody nodes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'prosody', text: 'slower', tag: { type: 'prosody', rate: 'slow' } }]
    expect(plainText(nodes)).toBe('slower')
  })

  it('returns empty string for break nodes', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'break', tag: { type: 'break', strength: 'medium' } }]
    expect(plainText(nodes)).toBe('')
  })

  it('concatenates text across mixed nodes', () => {
    const nodes: SsmlNode[] = [
      { id: '1', kind: 'text', text: 'Hello ' },
      { id: '2', kind: 'break', tag: { type: 'break', strength: 'medium' } },
      { id: '3', kind: 'emphasis', text: 'world', tag: { type: 'emphasis', level: 'strong' } },
      { id: '4', kind: 'text', text: '.' },
    ]
    expect(plainText(nodes)).toBe('Hello world.')
  })

  it('returns empty string for empty node list', () => {
    expect(plainText([])).toBe('')
  })

  it('handles undefined text fields gracefully', () => {
    const nodes: SsmlNode[] = [{ id: '1', kind: 'text' }]
    expect(plainText(nodes)).toBe('')
  })
})
