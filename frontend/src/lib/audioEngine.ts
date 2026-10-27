/**
 * Singleton audio engine.
 *
 * Both ActionBar (mobile) and PlaybackControls (desktop) delegate to this
 * module so there is always exactly one AudioContext, one AnalyserNode and
 * one BufferSourceNode alive at a time.
 */

import { usePlayback } from '@/store/playback'

let _ctx: AudioContext | null = null
let _source: AudioBufferSourceNode | null = null
let _analyser: AnalyserNode | null = null
let _startCtxTime = 0   // audioCtx.currentTime when play() was last called
let _startOffset = 0    // buffer offset we started from
let _rafId: number | null = null

export function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  return _ctx
}

function stopRaf() {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId)
    _rafId = null
  }
}

function stopSource() {
  if (_source) {
    try { _source.onended = null; _source.stop() } catch {}
    _source = null
  }
}

function startRaf(duration: number) {
  stopRaf()
  const tick = () => {
    if (!_ctx) return
    const elapsed = _ctx.currentTime - _startCtxTime + _startOffset
    const clamped = Math.min(elapsed, duration)
    usePlayback.getState().seekTo(clamped)
    _rafId = requestAnimationFrame(tick)
  }
  _rafId = requestAnimationFrame(tick)
}

/** Play a decoded AudioBuffer from `offsetSecs` (default 0). */
export function play(buffer: AudioBuffer, offsetSecs = 0) {
  const store = usePlayback.getState()
  stopSource()
  stopRaf()

  const ctx = getCtx()
  if (ctx.state === 'suspended') ctx.resume()

  if (_analyser) {
    try { _analyser.disconnect() } catch {}
  }
  _analyser = ctx.createAnalyser()
  _analyser.fftSize = 2048
  _analyser.connect(ctx.destination)
  store.setAnalyserNode(_analyser)

  _source = ctx.createBufferSource()
  _source.buffer = buffer
  _source.connect(_analyser)
  _source.start(0, offsetSecs)

  _startCtxTime = ctx.currentTime
  _startOffset = offsetSecs
  store.setStatus('playing')

  const capturedSource = _source
  _source.onended = () => {
    // Only react if this source is still the active one
    if (_source !== capturedSource) return
    _source = null
    stopRaf()
    usePlayback.getState().seekTo(0)
    usePlayback.getState().setStatus('idle')
    usePlayback.getState().setAnalyserNode(null)
  }

  startRaf(buffer.duration)
}

/** Pause — saves position so resume() can continue from here. */
export function pause() {
  if (!_ctx || !_source) return
  _startOffset = _ctx.currentTime - _startCtxTime + _startOffset
  stopSource()
  stopRaf()
  usePlayback.getState().setStatus('paused')
}

/** Resume from where pause() left off. */
export function resume(buffer: AudioBuffer) {
  play(buffer, _startOffset)
}

/** Stop and reset to beginning. */
export function stop() {
  stopSource()
  stopRaf()
  _startOffset = 0
  usePlayback.getState().seekTo(0)
  usePlayback.getState().setStatus('idle')
  usePlayback.getState().setAnalyserNode(null)
}

/** Seek to a specific time (only works while paused or idle). */
export function seekTo(buffer: AudioBuffer, t: number) {
  _startOffset = t
  usePlayback.getState().seekTo(t)
  if (usePlayback.getState().status === 'playing') {
    play(buffer, t)
  }
}

/** Returns current playback offset in seconds (live, not from RAF). */
export function getCurrentOffset(): number {
  if (!_ctx) return _startOffset
  return _ctx.currentTime - _startCtxTime + _startOffset
}
