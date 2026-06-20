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
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBase64, setAudioBase64] = useState<string>('')

  const platform = getPlatform()

  const timerRef = useRef<number | null>(null)
  const currentDurationRef = useRef(0)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const weappRecorderRef = useRef<any>(null)
  const weappTempFilePathRef = useRef<string>('')
  const weappAudioCtxRef = useRef<any>(null)
  const weappSavedFilePathRef = useRef<string>('')
  const h5AudioRef = useRef<HTMLAudioElement | null>(null)
  const hasListenersRef = useRef(false)

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
    timerRef.current = (window.setInterval as any)(() => {
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

  const stopPlayback = useCallback(() => {
    if (platform === 'weapp') {
      if (weappAudioCtxRef.current) {
        try {
          weappAudioCtxRef.current.stop()
        } catch (e) {}
      }
    } else {
      if (h5AudioRef.current) {
        try {
          h5AudioRef.current.pause()
          h5AudioRef.current.currentTime = 0
        } catch (e) {}
      }
    }
    setIsPlaying(false)
  }, [platform])

  const setupWeappAudioContext = useCallback((src: string) => {
    if (!weappAudioCtxRef.current) {
      weappAudioCtxRef.current = Taro.createInnerAudioContext()
    }
    const ctx = weappAudioCtxRef.current
    ctx.src = src

    if (!hasListenersRef.current) {
      hasListenersRef.current = true
      ctx.onPlay(() => {
        setIsPlaying(true)
      })
      ctx.onPause(() => {
        setIsPlaying(false)
      })
      ctx.onStop(() => {
        setIsPlaying(false)
      })
      ctx.onEnded(() => {
        setIsPlaying(false)
      })
      ctx.onError((err: any) => {
        console.error('[useRecorder] Weapp audio error:', err)
        setIsPlaying(false)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      })
    }
    return ctx
  }, [])

  const playAudio = useCallback(() => {
    const src = audioUrl || weappSavedFilePathRef.current
    if (!src && !audioBase64) {
      Taro.showToast({ title: '请先录音', icon: 'none' })
      return
    }

    stopPlayback()

    if (platform === 'weapp') {
      let playSrc = weappSavedFilePathRef.current || audioUrl
      
      if (!playSrc && audioBase64) {
        const fs = Taro.getFileSystemManager()
        const filePath = `${Taro.env.USER_DATA_PATH}/record_${Date.now()}.mp3`
        const base64Data = audioBase64.split(',')[1] || audioBase64
        
        fs.writeFile({
          filePath,
          data: base64Data,
          encoding: 'base64',
          success: () => {
            weappSavedFilePathRef.current = filePath
            const ctx = setupWeappAudioContext(filePath)
            ctx.play()
          },
          fail: (err: any) => {
            console.error('[useRecorder] Write base64 to file failed:', err)
            Taro.showToast({ title: '播放失败', icon: 'none' })
          }
        })
        return
      }

      if (playSrc) {
        const ctx = setupWeappAudioContext(playSrc)
        ctx.play()
      }
    } else {
      let urlToPlay = audioUrl
      if (!urlToPlay && audioBase64) {
        urlToPlay = createAudioUrlFromBase64(audioBase64)
        setAudioUrl(urlToPlay)
      }
      
      if (urlToPlay) {
        try {
          const audio = new Audio(urlToPlay)
          h5AudioRef.current = audio
          audio.onended = () => setIsPlaying(false)
          audio.onerror = () => {
            setIsPlaying(false)
            Taro.showToast({ title: '播放失败', icon: 'none' })
          }
          audio.play().catch(err => {
            console.error('[useRecorder] Play error:', err)
            setIsPlaying(false)
            Taro.showToast({ title: '播放失败', icon: 'none' })
          })
          setIsPlaying(true)
        } catch (e) {
          console.error('[useRecorder] Play error:', e)
          Taro.showToast({ title: '播放失败', icon: 'none' })
        }
      }
    }
  }, [platform, audioUrl, audioBase64, stopPlayback, setupWeappAudioContext, createAudioUrlFromBase64])

  const handleRecordingStop = useCallback(async (audioData: {
    url?: string
    blob?: Blob
    base64?: string
    duration: number
  }) => {
    setIsRecording(false)
    clearTimer()
    stopStream()
    stopPlayback()

    try {
      let finalBase64 = audioData.base64 || ''
      let finalUrl = audioData.url || ''

      if (audioData.blob && !finalBase64) {
        finalBase64 = await blobToBase64(audioData.blob)
      }

      if (platform === 'h5') {
        if (audioData.blob) {
          finalUrl = URL.createObjectURL(audioData.blob)
        } else if (finalBase64 && !finalUrl) {
          finalUrl = createAudioUrlFromBase64(finalBase64)
        }
      }

      if (platform === 'weapp' && audioData.url) {
        weappTempFilePathRef.current = audioData.url
        finalUrl = audioData.url
      }

      if (platform === 'h5') {
        revokeAudioUrl()
      }
      
      setAudioUrl(finalUrl)
      setAudioBase64(finalBase64)
      setDuration(audioData.duration)

      if (finalBase64) {
        options.onStop?.(finalBase64, audioData.duration)
      }

      setTimeout(() => {
        if (platform === 'weapp') {
          if (finalUrl) {
            const ctx = setupWeappAudioContext(finalUrl)
            ctx.play()
          }
        } else {
          const urlToPlay = finalUrl || (finalBase64 && platform === 'h5' ? createAudioUrlFromBase64(finalBase64) : '')
          if (urlToPlay) {
            try {
              const audio = new Audio(urlToPlay)
              h5AudioRef.current = audio
              audio.onended = () => setIsPlaying(false)
              audio.play().catch(e => {
                console.warn('[useRecorder] Auto play failed:', e)
              })
              setIsPlaying(true)
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
  }, [blobToBase64, createAudioUrlFromBase64, clearTimer, stopStream, stopPlayback, revokeAudioUrl, options, platform, setupWeappAudioContext])

  const openPermissionSetting = useCallback(() => {
    if (platform === 'weapp') {
      Taro.openSetting({
        success: (res) => {
          if (res.authSetting['scope.record']) {
            setPermissionState('granted')
            Taro.showToast({ title: '权限已开启', icon: 'success' })
            setTimeout(() => startRecording(), 500)
          } else {
            setPermissionState('denied')
            Taro.showToast({ title: '未开启麦克风权限', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('[useRecorder] openSetting failed:', err)
        }
      })
    }
  }, [platform])

  const showPermissionError = useCallback(() => {
    Taro.showModal({
      title: '需要麦克风权限',
      content: '请在微信设置中开启麦克风权限，以便进行话术录音练习',
      confirmText: '去设置',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          openPermissionSetting()
        } else {
          setPermissionState('denied')
        }
      }
    })
  }, [openPermissionSetting])

  const showError = useCallback((msg: string, type: 'permission' | 'notSupported' | 'other', error?: any) => {
    console.error('[useRecorder] Error:', msg, error)
    setErrorMessage(msg)
    setIsRecording(false)
    clearTimer()
    stopStream()

    if (type === 'permission' && platform === 'weapp') {
      Taro.showModal({
        title: '录音失败',
        content: msg,
        confirmText: '去设置',
        cancelText: '知道了',
        success: (res) => {
          if (res.confirm) {
            openPermissionSetting()
          }
        }
      })
    } else {
      Taro.showModal({
        title: '录音失败',
        content: msg,
        showCancel: false,
        confirmText: '知道了'
      })
    }

    options.onError?.(error || new Error(msg), type)
  }, [clearTimer, stopStream, options, platform, openPermissionSetting])

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
      })

      recorder.onStop(async (res: any) => {
        if (hasError) return
        const durationSec = Math.max(1, Math.round((res.duration || 0) / 1000))
        weappTempFilePathRef.current = res.tempFilePath || ''

        if (Taro.getFileSystemManager && res.tempFilePath) {
          try {
            const fs = Taro.getFileSystemManager()
            fs.readFile({
              filePath: res.tempFilePath,
              encoding: 'base64',
              success: (readRes: any) => {
                const mimeType = 'audio/mpeg'
                const base64Data = `data:${mimeType};base64,${readRes.data}`
                
                const savedPath = `${Taro.env.USER_DATA_PATH}/record_${Date.now()}.mp3`
                fs.writeFile({
                  filePath: savedPath,
                  data: readRes.data,
                  encoding: 'base64',
                  success: () => {
                    weappSavedFilePathRef.current = savedPath
                    handleRecordingStop({
                      url: savedPath,
                      base64: base64Data,
                      duration: durationSec || currentDurationRef.current
                    })
                  },
                  fail: () => {
                    handleRecordingStop({
                      url: res.tempFilePath,
                      base64: base64Data,
                      duration: durationSec || currentDurationRef.current
                    })
                  }
                })
              },
              fail: () => {
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

      Taro.getSetting({
        success: (setting) => {
          const recordAuth = setting.authSetting['scope.record']
          
          if (recordAuth === false) {
            setPermissionState('denied')
            showPermissionError()
            return
          }

          Taro.authorize({
            scope: 'scope.record',
            success: () => {
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
              if (authErr?.errMsg?.includes('cancel') || authErr?.errMsg?.includes('deny')) {
                setPermissionState('denied')
                showPermissionError()
              } else {
                showError('获取麦克风权限失败，请重试', 'permission', authErr)
              }
            }
          })
        },
        fail: () => {
          Taro.authorize({
            scope: 'scope.record',
            success: () => {
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
              setPermissionState('denied')
              showPermissionError()
            }
          })
        }
      })
    } catch (e: any) {
      showError('启动录音失败，请重试', 'other', e)
    }
  }, [startTimer, handleRecordingStop, showError, showPermissionError, options])

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
      setAudioBase64('')
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

  const resetRecording = useCallback(() => {
    stopPlayback()
    
    if (platform === 'h5') {
      revokeAudioUrl()
    }
    
    setAudioUrl('')
    setAudioBase64('')
    setDuration(0)
    setRecordTime(0)
    setIsRecording(false)
    setErrorMessage('')
    stopStream()
    clearTimer()
    
    weappTempFilePathRef.current = ''
    weappSavedFilePathRef.current = ''
    
    if (h5AudioRef.current) {
      try {
        h5AudioRef.current.pause()
        h5AudioRef.current = null
      } catch (e) {}
    }
  }, [revokeAudioUrl, stopStream, clearTimer, stopPlayback, platform])

  const loadSavedAudio = useCallback((base64Data: string, savedDuration: number): boolean => {
    if (!base64Data) return false

    try {
      stopPlayback()
      setAudioBase64(base64Data)
      setDuration(savedDuration)

      if (platform === 'h5') {
        const url = createAudioUrlFromBase64(base64Data)
        setAudioUrl(url)
        return true
      }

      if (platform === 'weapp') {
        const fs = Taro.getFileSystemManager()
        const filePath = `${Taro.env.USER_DATA_PATH}/saved_${Date.now()}.mp3`
        const base64Content = base64Data.split(',')[1] || base64Data
        
        fs.writeFile({
          filePath,
          data: base64Content,
          encoding: 'base64',
          success: () => {
            weappSavedFilePathRef.current = filePath
            setAudioUrl(filePath)
          },
          fail: (err: any) => {
            console.error('[useRecorder] Load saved audio write file failed:', err)
          }
        })
        return true
      }

      return false
    } catch (err) {
      console.error('[useRecorder] Load saved audio error:', err)
      return false
    }
  }, [createAudioUrlFromBase64, stopPlayback, platform])

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
      stopPlayback()
      
      if (audioUrl && audioUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(audioUrl) } catch (e) {}
      }
      
      if (mediaRecorderRef.current && isRecording) {
        try { mediaRecorderRef.current.stop() } catch (e) {}
      }
      
      if (weappRecorderRef.current && isRecording) {
        try { weappRecorderRef.current.stop() } catch (e) {}
      }
      
      if (weappAudioCtxRef.current) {
        try { weappAudioCtxRef.current.destroy() } catch (e) {}
      }
      
      if (h5AudioRef.current) {
        try { h5AudioRef.current.pause() } catch (e) {}
      }
    }
  }, [audioUrl, isRecording, clearTimer, stopStream, stopPlayback])

  return {
    isRecording,
    recordTime,
    audioUrl,
    audioBase64,
    duration,
    permissionState,
    errorMessage,
    platform,
    isPlaying,
    startRecording,
    stopRecording,
    toggleRecording,
    playAudio,
    stopPlayback,
    resetRecording,
    loadSavedAudio,
    blobToBase64,
    base64ToBlob
  }
}
