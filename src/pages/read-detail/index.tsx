import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { getReadCardById } from '@/data/readCards'
import { useApp } from '@/store/appContext'
import { calculateProgress } from '@/utils'
import classnames from 'classnames'
import { SelfEvaluation } from '@/types'

export default function ReadDetailPage() {
  const router = useRouter()
  const cardId = router.params.id as string
  const card = getReadCardById(cardId)
  const { updateReadCardProgress, updateSelfEvaluation, selfEvaluations } = useApp()

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedPhrases, setCompletedPhrases] = useState<Set<string>>(new Set())
  const [showComplete, setShowComplete] = useState(false)
  const [evaluations, setEvaluations] = useState<Record<string, SelfEvaluation>>({})
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useDidShow(() => {
    console.log('[ReadDetail] Page showed, cardId:', cardId)
    if (!card) {
      Taro.showToast({
        title: '卡片不存在',
        icon: 'error'
      })
      setTimeout(() => Taro.navigateBack(), 1000)
    }
  })

  useEffect(() => {
    if (card) {
      Taro.setNavigationBarTitle({
        title: card.title
      })
    }
  }, [card])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const currentPhrase = card?.phrases[currentPhraseIndex]
  const totalPhrases = card?.phrases.length || 0

  const handlePlayAudio = useCallback(() => {
    console.log('[ReadDetail] Play audio for phrase:', currentPhrase?.id)
    Taro.showToast({
      title: '播放示范朗读',
      icon: 'none'
    })
  }, [currentPhrase])

  const handleRecord = useCallback(() => {
    if (isRecording) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRecording(false)
      console.log('[ReadDetail] Recording stopped, duration:', recordTime)
    } else {
      setIsRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1)
      }, 1000)
      console.log('[ReadDetail] Recording started')
    }
  }, [isRecording, recordTime])

  const handlePlayback = useCallback(() => {
    if (!currentPhrase) return
    if (isPlaying) {
      setIsPlaying(false)
      console.log('[ReadDetail] Playback stopped')
    } else {
      setIsPlaying(true)
      console.log('[ReadDetail] Playing recording')
      setTimeout(() => {
        setIsPlaying(false)
      }, 3000)
    }
  }, [currentPhrase, isPlaying])

  const handleStarRating = useCallback((type: 'speed' | 'pause' | 'politeness', value: number) => {
    if (!currentPhrase) return
    setEvaluations(prev => ({
      ...prev,
      [currentPhrase.id]: {
        speed: prev[currentPhrase.id]?.speed || 0,
        pause: prev[currentPhrase.id]?.pause || 0,
        politeness: prev[currentPhrase.id]?.politeness || 0,
        comment: prev[currentPhrase.id]?.comment || '',
        [type]: value
      }
    }))
  }, [currentPhrase])

  const handleCommentChange = useCallback((e: any) => {
    if (!currentPhrase) return
    setEvaluations(prev => ({
      ...prev,
      [currentPhrase.id]: {
        ...prev[currentPhrase.id],
        speed: prev[currentPhrase.id]?.speed || 0,
        pause: prev[currentPhrase.id]?.pause || 0,
        politeness: prev[currentPhrase.id]?.politeness || 0,
        comment: e.detail.value
      }
    }))
  }, [currentPhrase])

  const handleSaveEvaluation = useCallback(() => {
    if (!currentPhrase) return
    const evalData = evaluations[currentPhrase.id]
    if (!evalData || evalData.speed === 0 || evalData.pause === 0 || evalData.politeness === 0) {
      Taro.showToast({
        title: '请完成所有评分',
        icon: 'none'
      })
      return
    }
    updateSelfEvaluation(currentPhrase.id, evalData)
    setCompletedPhrases(prev => new Set(prev).add(currentPhrase.id))
    Taro.showToast({
      title: '已保存自评',
      icon: 'success'
    })
    console.log('[ReadDetail] Evaluation saved:', evalData)
  }, [currentPhrase, evaluations, updateSelfEvaluation])

  const handleNext = useCallback(() => {
    if (!currentPhrase || !card) return
    
    if (!completedPhrases.has(currentPhrase.id)) {
      Taro.showToast({
        title: '请先完成本句自评',
        icon: 'none'
      })
      return
    }
    
    if (currentPhraseIndex < totalPhrases - 1) {
      setCurrentPhraseIndex(prev => prev + 1)
      setIsRecording(false)
      setRecordTime(0)
      setIsPlaying(false)
    } else {
      updateReadCardProgress(cardId)
      setShowComplete(true)
    }
  }, [currentPhrase, card, currentPhraseIndex, totalPhrases, completedPhrases, cardId, updateReadCardProgress])

  const handlePrev = useCallback(() => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(prev => prev - 1)
      setIsRecording(false)
      setRecordTime(0)
      setIsPlaying(false)
    }
  }, [currentPhraseIndex])

  const handleBackToPractice = useCallback(() => {
    Taro.switchTab({
      url: '/pages/practice/index'
    })
  }, [])

  const handleRetry = useCallback(() => {
    setCurrentPhraseIndex(0)
    setIsRecording(false)
    setRecordTime(0)
    setIsPlaying(false)
    setCompletedPhrases(new Set())
    setShowComplete(false)
    setEvaluations({})
  }, [])

  const getCurrentEvaluation = () => {
    if (!currentPhrase) return null
    return evaluations[currentPhrase.id] || selfEvaluations[currentPhrase.id]
  }

  if (!card || !currentPhrase) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const progress = calculateProgress(completedPhrases.size, totalPhrases)
  const currentEval = getCurrentEvaluation()
  const isCurrentCompleted = completedPhrases.has(currentPhrase.id) || selfEvaluations[currentPhrase.id]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderStars = (type: 'speed' | 'pause' | 'politeness', value: number) => {
    return (
      <View className={styles.evalStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            className={styles.star}
            onClick={() => handleStarRating(type, star)}
          >
            {star <= value ? '⭐' : '☆'}
          </Button>
        ))}
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.cardTitle}>{card.title}</Text>
        <Text className={styles.cardCategory}>{card.category}</Text>
        <Text className={styles.progressText}>
          第 {currentPhraseIndex + 1}/{totalPhrases} 句
        </Text>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <View className={styles.phraseList}>
        {card.phrases.map((phrase, index) => {
          const isActive = index === currentPhraseIndex
          const isCompleted = completedPhrases.has(phrase.id) || selfEvaluations[phrase.id]
          
          return (
            <View
              key={phrase.id}
              className={classnames(styles.phraseCard, {
                [styles.active]: isActive,
                [styles.completed]: isCompleted && !isActive
              })}
            >
              <View className={styles.phraseHeader}>
                <View className={styles.phraseIndex}>
                  <View
                    className={classnames(styles.indexBadge, {
                      [styles.active]: isActive,
                      [styles.completed]: isCompleted
                    })}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </View>
                  <Text className={styles.phraseStatus}>
                    {isCompleted ? '已完成' : '待练习'}
                  </Text>
                </View>
                <Button
                  className={styles.playBtn}
                  onClick={handlePlayAudio}
                >
                  🔊
                </Button>
              </View>
              
              <Text className={styles.phraseText}>{phrase.text}</Text>
              <Text className={styles.phrasePinyin}>{phrase.pinyin}</Text>
              
              {isActive && (
                <View className={styles.recordSection}>
                  <View className={styles.recordControls}>
                    <Button
                      className={classnames(styles.recordBtn, {
                        [styles.recording]: isRecording
                      })}
                      onClick={handleRecord}
                    >
                      {isRecording ? '⏹' : '🎤'}
                    </Button>
                    <View className={styles.recordInfo}>
                      <Text className={styles.recordStatus}>
                        {isRecording ? '正在录音...' : (recordTime > 0 ? '已录音' : '点击开始录音')}
                      </Text>
                      <Text className={styles.recordTime}>
                        {recordTime > 0 ? `时长: ${formatTime(recordTime)}` : ''}
                      </Text>
                    </View>
                    {recordTime > 0 && (
                      <Button
                        className={classnames(styles.playbackBtn, {
                          [styles.playing]: isPlaying
                        })}
                        onClick={handlePlayback}
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </Button>
                    )}
                  </View>
                  
                  {recordTime > 0 && (
                    <View className={styles.selfEvalSection}>
                      <Text className={styles.evalTitle}>自我评价</Text>
                      
                      <View className={styles.evalItems}>
                        <View className={styles.evalItem}>
                          <View className={styles.evalLabel}>
                            <Text className={styles.labelText}>语速</Text>
                            <Text className={styles.valueText}>
                              {currentEval?.speed ? `${currentEval.speed}分` : '请打分'}
                            </Text>
                          </View>
                          {renderStars('speed', currentEval?.speed || 0)}
                        </View>
                        
                        <View className={styles.evalItem}>
                          <View className={styles.evalLabel}>
                            <Text className={styles.labelText}>停顿</Text>
                            <Text className={styles.valueText}>
                              {currentEval?.pause ? `${currentEval.pause}分` : '请打分'}
                            </Text>
                          </View>
                          {renderStars('pause', currentEval?.pause || 0)}
                        </View>
                        
                        <View className={styles.evalItem}>
                          <View className={styles.evalLabel}>
                            <Text className={styles.labelText}>礼貌用语</Text>
                            <Text className={styles.valueText}>
                              {currentEval?.politeness ? `${currentEval.politeness}分` : '请打分'}
                            </Text>
                          </View>
                          {renderStars('politeness', currentEval?.politeness || 0)}
                        </View>
                      </View>
                      
                      <View className={styles.evalComment}>
                        <Input
                          className={styles.commentInput}
                          placeholder="写下你的练习心得（选填）"
                          value={currentEval?.comment || ''}
                          onInput={handleCommentChange}
                        />
                      </View>
                      
                      {!isCurrentCompleted && (
                        <Button
                          className={styles.saveBtn}
                          onClick={handleSaveEvaluation}
                        >
                          保存自评
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.prevBtn}
          onClick={handlePrev}
          disabled={currentPhraseIndex === 0}
        >
          上一句
        </Button>
        <Button
          className={styles.nextBtn}
          onClick={handleNext}
        >
          {currentPhraseIndex < totalPhrases - 1 ? '下一句' : '完成练习'}
        </Button>
      </View>

      {showComplete && (
        <View className={styles.completeModal}>
          <View className={styles.modalContent}>
            <Text className={styles.modalIcon}>🎊</Text>
            <Text className={styles.modalTitle}>练习完成！</Text>
            <Text className={styles.modalDesc}>
              已完成「{card.title}」的所有跟读练习
            </Text>
            <View className={styles.modalButtons}>
              <Button
                className={classnames(styles.modalBtn, styles.secondary)}
                onClick={handleRetry}
              >
                再练一次
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.primary)}
                onClick={handleBackToPractice}
              >
                返回列表
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
