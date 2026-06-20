import { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { generateId } from '@/utils'

interface UseRecorderOptions {
  onStart?: () => void
  onStop?: (audioUrl: string, duration: number) => void
  onError?: (error: any) => void
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(audioBlob)
          const recordedDuration = recordTime
          setAudioUrl(url)
          setDuration(recordedDuration)
          setIsRecording(false)

          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }

          options.onStop?.(url, recordedDuration)
        }

        mediaRecorder.start()
        setIsRecording(true)
        setRecordTime(0)
        setAudioUrl('')

        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        timerRef.current = window.setInterval(() => {
          setRecordTime(prev => prev + 1)
        }, 1000)

        options.onStart?.()
      } else {
        Taro.showToast({
          title: '当前环境不支持录音',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('[useRecorder] Start recording error:', error)
      Taro.showToast({
        title: '无法访问麦克风',
        icon: 'none'
      })
      options.onError?.(error)
    }
  }, [options, recordTime])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const playAudio = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
      return audio
    }
    return null
  }, [audioUrl])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl('')
    setDuration(0)
    setRecordTime(0)
    setIsRecording(false)
  }, [audioUrl])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return {
    isRecording,
    recordTime,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    toggleRecording,
    playAudio,
    resetRecording
  }
}
