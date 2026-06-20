import { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'

interface UseRecorderOptions {
  onStart?: () => void
  onStop?: (audioData: string, duration: number) => void
  onError?: (error: any, type: 'permission' | 'notSupported' | 'other') => void
}

type Platform = 'weapp' | 'h5' | 'other'

function getPlatform(): Platform {
  if (typeof process !== 'undefined' && process.env.TARO_ENV === 'weapp') {
    return 'weapp'
  }
  try {
    if (Taro.getEnv && Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      return 'weapp'
    }
  } catch (e) {}
  if (typeof wx !== 'undefined' && typeof wx.getRecorderManager === 'function') {
    return 'weapp'
  }
  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    return 'h5'
  }
  return 'other'
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const platform = getPlatform()

  const timerRef = useRef<number | null>(null)
  const currentDurationRef = useRef(0)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const weappRecorderRef = useRef<any>(null)
  const weappTempFilePathRef = useRef<string>('')

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    currentDurationRef.current = 0
    setRecordTime(0)
    timerRef.current = window.setInterval(() => {
      currentDurationRef.current += 1
      setRecordTime(prev => prev + 1)
    }, 1000)
  }, [clearTimer])

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

  const revokeAudioUrl = useCallback(() => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audioUrl)
      } catch (e) {}
    }
  }, [audioUrl])

  const handleRecordingStop = useCallback(async (audioData: {
    url?: string
    blob?: Blob
    base64?: string
    duration: number
  }) => {
    setIsRecording(false)
    clearTimer()
    stopStream()

    try {
      let finalBase64 = audioData.base64 || ''
      let finalUrl = audioData.url || ''

      if (audioData.blob && !finalBase64) {
        finalBase64 = await blobToBase64(audioData.blob)
      }

      if (!finalUrl && audioData.blob) {
        finalUrl = URL.createObjectURL(audioData.blob)
      } else if (!finalUrl && finalBase64 && platform === 'h5') {
        finalUrl = createAudioUrlFromBase64(finalBase64)
      }

      revokeAudioUrl()
      setAudioUrl(finalUrl)
      setDuration(audioData.duration)

      if (finalBase64) {
        options.onStop?.(finalBase64, audioData.duration)
      }

      setTimeout(() => {
        if (finalUrl || finalBase64) {
          const urlToPlay = finalUrl || (finalBase64 && platform === 'h5' ? createAudioUrlFromBase64(finalBase64) : '')
          if (urlToPlay) {
            try {
              const audio = new Audio(urlToPlay)
              audio.play().catch(e => {
                console.warn('[useRecorder] Auto play failed:', e)
              })
            } catch (e) {
              console.warn('[useRecorder] Auto play error:', e)
            }
          }
        }
      }, 300)

    } catch (err) {
      console.error('[useRecorder] Process recording error:', err)
      const msg = '录音保存失败，请重试'
      setErrorMessage(msg)
      Taro.showToast({ title: msg, icon: 'none' })
      options.onError?.(err, 'other')
    }
  }, [blobToBase64, createAudioUrlFromBase64, clearTimer, stopStream, revokeAudioUrl, options, platform])

  const showError = useCallback((msg: string, type: 'permission' | 'notSupported' | 'other', error?: any) => {
    console.error('[useRecorder] Error:', msg, error)
    setErrorMessage(msg)
    setIsRecording(false)
    clearTimer()
    stopStream()

    Taro.showModal({
      title: '录音失败',
      content: msg,
      showCancel: type === 'permission',
      confirmText: '知道了',
      cancelText: '重新授权',
      success: (res) => {
        if (res.cancel) {
          setTimeout(() => startRecording(), 200)
        }
      }
    })

    options.onError?.(error || new Error(msg), type)
  }, [clearTimer, stopStream, options])

  const startRecordingWeapp = useCallback(() => {
    try {
      if (!weappRecorderRef.current) {
        weappRecorderRef.current = Taro.getRecorderManager()
      }
      const recorder = weappRecorderRef.current

      let hasError = false

      recorder.onStart(() => {
        setIsRecording(true)
        startTimer()
        setPermissionState('granted')
        options.onStart?.()
        console.log('[useRecorder] Weapp recording started')
      })

      recorder.onStop(async (res: any) => {
        if (hasError) return
        const durationSec = Math.round((res.duration || 0) / 1000)
        weappTempFilePathRef.current = res.tempFilePath || ''

        if (Taro.getFileSystemManager && res.tempFilePath) {
          try {
            const fs = Taro.getFileSystemManager()
            fs.readFile({
              filePath: res.tempFilePath,
              encoding: 'base64',
              success: (readRes: any) => {
                const mimeType = res.mp3Encoded ? 'audio/mpeg' : 'audio/webm'
                const base64Data = `data:${mimeType};base64,${readRes.data}`
                handleRecordingStop({
                  url: res.tempFilePath,
                  base64: base64Data,
                  duration: durationSec || currentDurationRef.current
                })
              },
              fail: (err: any) => {
                console.warn('[useRecorder] Weapp read file failed, use temp path:', err)
                handleRecordingStop({
                  url: res.tempFilePath,
                  base64: '',
                  duration: durationSec || currentDurationRef.current
                })
              }
            })
          } catch (e) {
            handleRecordingStop({
              url: res.tempFilePath,
              base64: '',
              duration: durationSec || currentDurationRef.current
            })
          }
        } else {
          handleRecordingStop({
            url: res.tempFilePath,
            base64: '',
            duration: durationSec || currentDurationRef.current
          })
        }
      })

      recorder.onError((err: any) => {
        hasError = true
        let msg = '录音失败，请重试'
        let errorType: 'permission' | 'notSupported' | 'other' = 'other'

        if (err && (err.errMsg?.includes('auth') || err.errMsg?.includes('authorize') || err.errCode === 10007)) {
          msg = '麦克风权限被拒绝，请在微信设置中开启麦克风权限后重试'
          errorType = 'permission'
          setPermissionState('denied')
        } else if (err && err.errMsg?.includes('not support')) {
          msg = '当前微信版本不支持录音功能'
          errorType = 'notSupported'
        } else if (err && err.errMsg?.includes('cancel')) {
          msg = '用户取消了授权'
          errorType = 'permission'
        }

        showError(msg, errorType, err)
      })

      Taro.authorize({
        scope: 'scope.record',
        success: () => {
          console.log('[useRecorder] Weapp record permission authorized')
          setPermissionState('granted')
          try {
            recorder.start({
              duration: 600000,
              sampleRate: 44100,
              numberOfChannels: 1,
              encodeBitRate: 192000,
              format: 'mp3'
            })
          } catch (e) {
            try {
              recorder.start()
            } catch (e2) {
              showError('启动录音失败，请重试', 'other', e2)
            }
          }
        },
        fail: (authErr: any) => {
          console.warn('[useRecorder] Weapp authorize failed:', authErr)
          if (authErr?.errMsg?.includes('cancel') || authErr?.errMsg?.includes('deny')) {
            showError('麦克风权限被拒绝，请在微信设置中开启麦克风权限后重试', 'permission', authErr)
          } else {
            Taro.getSetting({
              success: (setting) => {
                if (setting.authSetting['scope.record'] === false) {
                  Taro.showModal({
                    title: '需要麦克风权限',
                    content: '请在微信设置中开启麦克风权限，以便进行话术录音练习',
                    confirmText: '去设置',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        Taro.openSetting()
                      } else {
                        showError('麦克风权限被拒绝，请在设置中开启后重试', 'permission', authErr)
                      }
                    }
                  })
                } else {
                  showError('获取麦克风权限失败，请重试', 'permission', authErr)
                }
              },
              fail: () => {
                showError('获取麦克风权限失败，请重试', 'permission', authErr)
              }
            })
          }
        }
      })
    } catch (e: any) {
      showError('启动录音失败，请重试', 'other', e)
    }
  }, [startTimer, handleRecordingStop, showError, options])

  const startRecordingH5 = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      showError('当前环境不支持录音功能，请在浏览器或微信小程序中使用', 'notSupported')
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const recordedDuration = currentDurationRef.current
        handleRecordingStop({
          blob: audioBlob,
          duration: recordedDuration
        })
      }

      mediaRecorder.onerror = (event) => {
        showError('录音出错了，请重试', 'other', event)
      }

      mediaRecorder.start()
      setIsRecording(true)
      revokeAudioUrl()
      setAudioUrl('')
      startTimer()
      options.onStart?.()

    } catch (error: any) {
      let errorType: 'permission' | 'notSupported' | 'other' = 'other'
      let msg = '录音失败，请重试'

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'permission'
        msg = '麦克风权限被拒绝，请在设置中开启麦克风权限后重试'
        setPermissionState('denied')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        msg = '未检测到麦克风设备'
      } else if (error.name === 'NotReadableError') {
        msg = '麦克风被占用，请关闭其他使用麦克风的应用'
      } else if (error.name === 'OverconstrainedError') {
        msg = '设备不支持指定的录音参数'
        errorType = 'notSupported'
      } else if (error.name === 'SecurityError') {
        msg = '安全限制导致无法录音，请使用 HTTPS 协议访问'
        errorType = 'permission'
      }

      showError(msg, errorType, error)
    }
  }, [startTimer, handleRecordingStop, revokeAudioUrl, showError, options])

  const startRecording = useCallback(() => {
    setErrorMessage('')

    if (isRecording) {
      console.warn('[useRecorder] Already recording')
      return
    }

    if (platform === 'weapp') {
      startRecordingWeapp()
    } else if (platform === 'h5') {
      startRecordingH5()
    } else {
      showError('当前环境不支持录音功能，请在浏览器或微信小程序中使用', 'notSupported')
    }
  }, [isRecording, platform, startRecordingWeapp, startRecordingH5, showError])

  const stopRecording = useCallback(() => {
    if (!isRecording) return

    if (platform === 'weapp' && weappRecorderRef.current) {
      try {
        weappRecorderRef.current.stop()
      } catch (e) {
        setIsRecording(false)
        clearTimer()
      }
    } else if (platform === 'h5' && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        setIsRecording(false)
        clearTimer()
        stopStream()
      }
    } else {
      setIsRecording(false)
      clearTimer()
      stopStream()
    }
  }, [isRecording, platform, clearTimer, stopStream])

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
    let url = ''
    if (platform === 'h5') {
      url = createAudioUrlFromBase64(base64)
    }
    if (!url) return null

    const audio = new Audio(url)
    audio.onended = () => {
      if (url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch (e) {}
      }
    }
    audio.onerror = () => {
      if (url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch (e) {}
      }
      Taro.showToast({ title: '播放失败', icon: 'none' })
    }
    audio.play().catch(err => {
      console.error('[useRecorder] Play base64 audio error:', err)
      if (url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch (e) {}
      }
      Taro.showToast({ title: '播放失败', icon: 'none' })
    })
    return audio
  }, [createAudioUrlFromBase64, platform])

  const resetRecording = useCallback(() => {
    revokeAudioUrl()
    setAudioUrl('')
    setDuration(0)
    setRecordTime(0)
    setIsRecording(false)
    setErrorMessage('')
    stopStream()
    clearTimer()
    weappTempFilePathRef.current = ''
  }, [revokeAudioUrl, stopStream, clearTimer])

  const loadSavedAudio = useCallback((base64Data: string, savedDuration: number): string | null => {
    if (base64Data) {
      try {
        let url = ''
        if (platform === 'h5') {
          url = createAudioUrlFromBase64(base64Data)
        }
        if (url) {
          setAudioUrl(url)
          setDuration(savedDuration)
          return url
        }
        setDuration(savedDuration)
        return null
      } catch (err) {
        console.error('[useRecorder] Load saved audio error:', err)
        return null
      }
    }
    return null
  }, [createAudioUrlFromBase64, platform])

  useEffect(() => {
    if (platform === 'h5' && typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
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
  }, [platform])

  useEffect(() => {
    return () => {
      clearTimer()
      stopStream()
      if (audioUrl && audioUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(audioUrl) } catch (e) {}
      }
      if (mediaRecorderRef.current && isRecording) {
        try { mediaRecorderRef.current.stop() } catch (e) {}
      }
      if (weappRecorderRef.current && isRecording) {
        try { weappRecorderRef.current.stop() } catch (e) {}
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
    platform,
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
