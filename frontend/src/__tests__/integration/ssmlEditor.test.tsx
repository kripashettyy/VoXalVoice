import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SsmlEditor from '@/components/ssml-editor/SsmlEditor'

const mockSynthesize = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockSynthesize.mockResolvedValue(new ArrayBuffer(8))
  // mock createObjectURL / revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
})

function renderEditor() {
  return render(<SsmlEditor voiceId="en-US-AriaNeural" synthesize={mockSynthesize} />)
}


describe('SsmlEditor rendering', () => {
  it('renders the SSML output preview', () => {
    renderEditor()
    expect(screen.getByLabelText('Generated SSML')).toBeTruthy()
  })

  it('initial SSML is <speak></speak>', () => {
    renderEditor()
    expect(screen.getByLabelText('Generated SSML').textContent).toBe('<speak></speak>')
  })

  it('renders the synthesize button', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: /synthesize ssml/i })).toBeTruthy()
  })

  it('synthesize button is disabled when no text exists', () => {
    renderEditor()
    const btn = screen.getByRole('button', { name: /synthesize ssml/i })
    expect(btn).toBeDisabled()
  })

  it('renders insert pause buttons', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: /insert weak pause/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /insert medium pause/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /insert strong pause/i })).toBeTruthy()
  })

  it('renders insert emphasis button', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: /insert emphasis/i })).toBeTruthy()
  })

  it('renders insert prosody button', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: /insert prosody/i })).toBeTruthy()
  })

  it('renders clear button', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: /clear all nodes/i })).toBeTruthy()
  })
})

//  text input 

describe('text node editing', () => {
  it('updates SSML preview when text is typed', () => {
    renderEditor()
    const textarea = screen.getByLabelText('Text content')
    fireEvent.change(textarea, { target: { value: 'Hello world.' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toBe('<speak>Hello world.</speak>')
  })

  it('enables synthesize button after text entry', () => {
    renderEditor()
    const textarea = screen.getByLabelText('Text content')
    fireEvent.change(textarea, { target: { value: 'Some text.' } })
    const btn = screen.getByRole('button', { name: /synthesize ssml/i })
    expect(btn).not.toBeDisabled()
  })

  it('escapes & in SSML output', () => {
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'cats & dogs' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('&amp;')
  })
})

//  tag insertion 

describe('tag insertion', () => {
  it('inserting a medium pause adds a break node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert medium pause/i }))
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('<break')
  })

  it('inserting emphasis adds an emphasis node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert emphasis/i }))
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('<emphasis')
  })

  it('inserting prosody adds a prosody node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert prosody/i }))
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('<prosody')
  })

  it('break node strength can be changed via select', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert medium pause/i }))
    const select = screen.getByLabelText('Pause strength')
    fireEvent.change(select, { target: { value: 'strong' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('strength="strong"')
  })

  it('emphasis level can be changed via select', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert emphasis/i }))
    const select = screen.getByLabelText('Emphasis level')
    fireEvent.change(select, { target: { value: 'strong' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('level="strong"')
  })

  it('emphasized text updates the SSML', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert emphasis/i }))
    fireEvent.change(screen.getByLabelText('Emphasized text'), { target: { value: 'hello' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('>hello<')
  })

  it('prosody text updates the SSML', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert prosody/i }))
    fireEvent.change(screen.getByLabelText('Prosody text'), { target: { value: 'faster text' } })
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('faster text')
  })
})

//  node management 

describe('node management', () => {
  it('remove button deletes a node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert medium pause/i }))
    expect(screen.getByLabelText('Generated SSML').textContent).toContain('<break')
    // Two nodes exist (text + break); remove the last one (break)
    const removeButtons = screen.getAllByRole('button', { name: /remove node/i })
    fireEvent.click(removeButtons[removeButtons.length - 1])
    expect(screen.getByLabelText('Generated SSML').textContent).not.toContain('<break')
  })

  it('clear resets to a single empty text node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /insert medium pause/i }))
    fireEvent.click(screen.getByRole('button', { name: /insert emphasis/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear all nodes/i }))
    expect(screen.getByLabelText('Generated SSML').textContent).toBe('<speak></speak>')
  })
})

//  synthesis 

describe('synthesis', () => {
  it('calls synthesize with plain text extracted from nodes', async () => {
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'Hello.' } })
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(mockSynthesize).toHaveBeenCalledOnce())
    const arg: string = mockSynthesize.mock.calls[0][0]
    expect(arg).toContain('Hello.')
    expect(arg).not.toContain('<speak>')
  })

  it('shows audio player after successful synthesis', async () => {
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'Hello.' } })
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(screen.getByLabelText('SSML audio preview')).toBeTruthy())
  })

  it('shows error message when synthesis fails', async () => {
    mockSynthesize.mockRejectedValueOnce(new Error('Voice unavailable'))
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'Hello.' } })
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByRole('alert').textContent).toContain('Voice unavailable')
  })

  it('passes SSML containing emphasis to synthesize', async () => {
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'Before ' } })
    fireEvent.click(screen.getByRole('button', { name: /insert emphasis/i }))
    fireEvent.change(screen.getByLabelText('Emphasized text'), { target: { value: 'bold' } })
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(mockSynthesize).toHaveBeenCalledOnce())
    // Tags are stripped — plain text is sent to the engine
    const arg: string = mockSynthesize.mock.calls[0][0]
    expect(arg).toContain('Before')
    expect(arg).toContain('bold')
    expect(arg).not.toContain('<emphasis')
  })

  it('passes plain text when break nodes are present', async () => {
    renderEditor()
    fireEvent.change(screen.getByLabelText('Text content'), { target: { value: 'Hi.' } })
    fireEvent.click(screen.getByRole('button', { name: /insert strong pause/i }))
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(mockSynthesize).toHaveBeenCalledOnce())
    const arg: string = mockSynthesize.mock.calls[0][0]
    expect(arg).toContain('Hi.')
    expect(arg).not.toContain('<break')
  })
})

//  raw mode 

describe('raw SSML mode', () => {
  it('clicking Raw SSML shows the raw editor', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    expect(screen.getByLabelText('Raw SSML editor')).toBeTruthy()
  })

  it('visual editor is hidden in raw mode', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    expect(screen.queryByLabelText('Text content')).toBeNull()
  })

  it('switching back to visual shows text node', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.click(screen.getByRole('button', { name: /visual editor/i }))
    expect(screen.getByLabelText('Text content')).toBeTruthy()
  })

  it('synthesize is disabled when raw SSML is invalid', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.change(screen.getByLabelText('Raw SSML editor'), { target: { value: 'not valid xml' } })
    expect(screen.getByRole('button', { name: /synthesize ssml/i })).toBeDisabled()
  })

  it('synthesize is enabled when raw SSML is valid', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.change(screen.getByLabelText('Raw SSML editor'), { target: { value: '<speak>Hello.</speak>' } })
    expect(screen.getByRole('button', { name: /synthesize ssml/i })).not.toBeDisabled()
  })

  it('calls synthesize with raw SSML content', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.change(screen.getByLabelText('Raw SSML editor'), { target: { value: '<speak>Raw test.</speak>' } })
    fireEvent.click(screen.getByRole('button', { name: /synthesize ssml/i }))
    await waitFor(() => expect(mockSynthesize).toHaveBeenCalledOnce())
    // Tags are stripped before sending — plain text only
    const arg: string = mockSynthesize.mock.calls[0][0]
    expect(arg).toBe('Raw test.')
  })

  it('shows validation error text for bare &', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.change(screen.getByLabelText('Raw SSML editor'), { target: { value: '<speak>cats & dogs</speak>' } })
    // The error message contains literal text "&amp;" — match by partial content
    const container = document.body
    expect(container.textContent).toContain('&amp;')
  })

  it('shows valid indicator for correct SSML', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    fireEvent.change(screen.getByLabelText('Raw SSML editor'), { target: { value: '<speak>Hello.</speak>' } })
    expect(screen.getByText(/valid ssml/i)).toBeTruthy()
  })

  it('insert snippet buttons add text at cursor', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: /raw ssml/i }))
    const editor = screen.getByLabelText('Raw SSML editor') as HTMLTextAreaElement
    fireEvent.change(editor, { target: { value: '<speak></speak>' } })
    fireEvent.click(screen.getByRole('button', { name: /<break\/>/i }))
    expect(editor.value).toContain('<break strength="medium"/>')
  })
})
