import { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'

interface UseRecorderOptions {
  onStart?: () => void
  onStop?: (audioData: string, duration: number) => void
  onError?: (error: any, type: 'permission' | 'notSupported' | 'other') => void
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const currentDurationRef = useRef(0)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setPermissionState(result.state as 'granted' | 'denied' | 'prompt')
          result.onchange = () => {
            setPermissionState(result.state as 'granted' | 'denied' | 'prompt')
          }
        })
        .catch(() => {
          setPermissionState('unknown')
        })
    }
  }, [])

  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }, [])

  const base64ToBlob = useCallback((base64: string): Blob => {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'audio/webm'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }, [])

  const createAudioUrlFromBase64 = useCallback((base64: string): string => {
    const blob = base64ToBlob(base64)
    return URL.createObjectURL(blob)
  }, [base64ToBlob])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    setErrorMessage('')
    
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      const msg = '当前环境不支持录音功能，请在浏览器或微信小程序中使用'
      setErrorMessage(msg)
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
      options.onError?.(new Error(msg), 'notSupported')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      setPermissionState('granted')

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      currentDurationRef.current = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const recordedDuration = currentDurationRef.current
        
        try {
          const base64Data = await blobToBase64(audioBlob)
          const url = URL.createObjectURL(audioBlob)
          
          setAudioUrl(url)
          setDuration(recordedDuration)
          setIsRecording(false)
          stopStream()
          
          options.onStop?.(base64Data, recordedDuration)
        } catch (err) {
          console.error('[useRecorder] Convert to base64 error:', err)
          const msg = '录音保存失败，请重试'
          setErrorMessage(msg)
          Taro.showToast({ title: msg, icon: 'none' })
          options.onError?.(err, 'other')
          setIsRecording(false)
          stopStream()
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('[useRecorder] MediaRecorder error:', event)
        const msg = '录音出错了，请重试'
        setErrorMessage(msg)
        Taro.showToast({ title: msg, icon: 'none' })
        options.onError?.(event, 'other')
        setIsRecording(false)
        stopStream()
        clearTimer()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordTime(0)
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl('')
      }

      clearTimer()
      timerRef.current = window.setInterval(() => {
        currentDurationRef.current += 1
        setRecordTime(prev => prev + 1)
      }, 1000)

      options.onStart?.()
      
    } catch (error: any) {
      console.error('[useRecorder] Start recording error:', error)
      
      let errorType: 'permission' | 'notSupported' | 'other' = 'other'
      let msg = '录音失败，请重试'
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'permission'
        msg = '麦克风权限被拒绝，请在设置中开启麦克风权限后重试'
        setPermissionState('denied')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        msg = '未检测到麦克风设备'
        errorType = 'other'
      } else if (error.name === 'NotReadableError') {
        msg = '麦克风被占用，请关闭其他使用麦克风的应用'
        errorType = 'other'
      } else if (error.name === 'OverconstrainedError') {
        msg = '设备不支持指定的录音参数'
        errorType = 'notSupported'
      } else if (error.name === 'SecurityError') {
        msg = '安全限制导致无法录音，请使用 HTTPS 协议访问'
        errorType = 'permission'
      }
      
      setErrorMessage(msg)
      Taro.showModal({
        title: '录音失败',
        content: msg,
        showCancel: errorType === 'permission',
        confirmText: '知道了',
        cancelText: '重新授权',
        success: (res) => {
          if (res.cancel) {
            startRecording()
          }
        }
      })
      
      options.onError?.(error, errorType)
      stopStream()
      clearTimer()
    }
  }, [options, audioUrl, blobToBase64, stopStream, clearTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      clearTimer()
    }
  }, [isRecording, clearTimer])

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
      audio.play().catch(err => {
        console.error('[useRecorder] Playback error:', err)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      })
      return audio
    }
    return null
  }, [audioUrl])

  const playAudioFromBase64 = useCallback((base64: string) => {
    const url = createAudioUrlFromBase64(base64)
    const audio = new Audio(url)
    audio.onended = () => {
      URL.revokeObjectURL(url)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    }
    audio.play().catch(err => {
      console.error('[useRecorder] Play base64 audio error:', err)
      URL.revokeObjectURL(url)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    })
    return audio
  }, [createAudioUrlFromBase64])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl('')
    setDuration(0)
    setRecordTime(0)
    setIsRecording(false)
    setErrorMessage('')
    stopStream()
    clearTimer()
  }, [audioUrl, stopStream, clearTimer])

  const loadSavedAudio = useCallback((base64Data: string, savedDuration: number) => {
    if (base64Data) {
      try {
        const url = createAudioUrlFromBase64(base64Data)
        setAudioUrl(url)
        setDuration(savedDuration)
        return url
      } catch (err) {
        console.error('[useRecorder] Load saved audio error:', err)
        return null
      }
    }
    return null
  }, [createAudioUrlFromBase64])

  useEffect(() => {
    return () => {
      clearTimer()
      stopStream()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop()
        } catch (e) {}
      }
    }
  }, [audioUrl, isRecording, clearTimer, stopStream])

  return {
    isRecording,
    recordTime,
    audioUrl,
    duration,
    permissionState,
    errorMessage,
    startRecording,
    stopRecording,
    toggleRecording,
    playAudio,
    playAudioFromBase64,
    resetRecording,
    loadSavedAudio,
    blobToBase64,
    base64ToBlob
  }
}
