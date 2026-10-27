'use client'
import { useEffect } from 'react'

export default function WelcomeGreeting() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return

    // Only play once per browser session
    if (sessionStorage.getItem('vv-welcomed')) return
    sessionStorage.setItem('vv-welcomed', '1')

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(
        'Welcome to VoXal Voice. Your studio for natural, beautiful speech.'
      )
      utter.rate = 0.95
      utter.pitch = 1.1
      utter.volume = 0.9

      // Pick the best available female voice
      const voices = window.speechSynthesis.getVoices()
      const female = voices.find(
        (v) =>
          /female|woman|girl/i.test(v.name) ||
          /zira|susan|samantha|karen|moira|victoria|fiona|tessa|aria|jenny|michelle|emma|lisa|kate/i.test(v.name)
      )
      if (female) utter.voice = female

      window.speechSynthesis.speak(utter)
    }

    // Voices may not be loaded yet — wait for the event if needed
    if (window.speechSynthesis.getVoices().length > 0) {
      speak()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true })
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return null
}
