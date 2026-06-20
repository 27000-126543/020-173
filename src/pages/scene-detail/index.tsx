import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { getSceneById } from '@/data/scenes'
import { useApp } from '@/store/appContext'
import { calculateProgress } from '@/utils'
import classnames from 'classnames'
import { SceneOption } from '@/types'

export default function SceneDetailPage() {
  const router = useRouter()
  const sceneId = router.params.id as string
  const scene = getSceneById(sceneId)
  const { updateSceneProgress } = useApp()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<SceneOption | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  useDidShow(() => {
    console.log('[SceneDetail] Page showed, sceneId:', sceneId)
    if (!scene) {
      Taro.showToast({
        title: '场景不存在',
        icon: 'error'
      })
      setTimeout(() => Taro.navigateBack(), 1000)
    }
  })

  useEffect(() => {
    if (scene) {
      Taro.setNavigationBarTitle({
        title: scene.title
      })
    }
  }, [scene])

  const currentQuestion = scene?.questions[currentQuestionIndex]
  const totalQuestions = scene?.questions.length || 0

  const handleOptionSelect = useCallback((option: SceneOption) => {
    if (showFeedback) return
    setSelectedOption(option)
    setShowFeedback(true)
    if (option.isCorrect) {
      setCorrectCount(prev => prev + 1)
    }
  }, [showFeedback])

  const handleNext = useCallback(() => {
    if (!scene) return
    
    const progress = Math.min(currentQuestionIndex + 1, totalQuestions)
    updateSceneProgress(sceneId, progress)
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowFeedback(false)
    } else {
      setShowComplete(true)
    }
  }, [scene, currentQuestionIndex, totalQuestions, sceneId, updateSceneProgress])

  const handleExit = useCallback(() => {
    Taro.showModal({
      title: '退出练习',
      content: '确定要退出当前练习吗？进度会自动保存。',
      success: (res) => {
        if (res.confirm) {
          if (scene) {
            updateSceneProgress(sceneId, currentQuestionIndex + 1)
          }
          Taro.navigateBack()
        }
      }
    })
  }, [scene, sceneId, currentQuestionIndex, updateSceneProgress])

  const handleBackToHome = useCallback(() => {
    Taro.switchTab({
      url: '/pages/home/index'
    })
  }, [])

  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setShowFeedback(false)
    setCorrectCount(0)
    setShowComplete(false)
  }, [])

  if (!scene || !currentQuestion) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const progress = calculateProgress(currentQuestionIndex + 1, totalQuestions)
  const finalScore = Math.round((correctCount / totalQuestions) * 100)

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.sceneInfo}>
          <View
            className={styles.sceneIcon}
            style={{ background: `${scene.color}20` }}
          >
            <Text>{scene.icon}</Text>
          </View>
          <View className={styles.sceneDetail}>
            <Text className={styles.sceneTitle}>{scene.title}</Text>
            <Text className={styles.progressText}>
              第 {currentQuestionIndex + 1}/{totalQuestions} 题
            </Text>
          </View>
        </View>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <View className={styles.questionCard}>
        <Text className={styles.questionLabel}>
          场景模拟
        </Text>
        <View className={styles.patientBubble}>
          <Text className={styles.patientLabel}>
            👤 患者提问
          </Text>
          <Text className={styles.patientQuestion}>
            {currentQuestion.patientQuestion}
          </Text>
        </View>
        <Text className={styles.selectHint}>
          请选择最合适的回复方式
        </Text>
      </View>

      <View className={styles.optionList}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id
          const showResult = showFeedback
          const isCorrect = option.isCorrect
          
          return (
            <Button
              key={option.id}
              className={classnames(styles.optionItem, {
                [styles.selected]: isSelected,
                [styles.correct]: showResult && isCorrect,
                [styles.incorrect]: showResult && isSelected && !isCorrect
              })}
              onClick={() => handleOptionSelect(option)}
              disabled={showFeedback}
            >
              <View className={styles.optionHeader}>
                <Text className={styles.optionIndex}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text className={styles.optionText}>{option.text}</Text>
                {showResult && isCorrect && (
                  <Text className={styles.optionIcon}>✓</Text>
                )}
                {showResult && isSelected && !isCorrect && (
                  <Text className={styles.optionIcon}>✗</Text>
                )}
              </View>
            </Button>
          )
        })}
      </View>

      {showFeedback && selectedOption && (
        <View className={classnames(styles.feedbackCard, styles[selectedOption.type])}>
          <Text className={styles.feedbackTitle}>
            {selectedOption.type === 'good' && '✨ 很棒！'}
            {selectedOption.type === 'neutral' && '⚠️ 有待改进'}
            {selectedOption.type === 'bad' && '❌ 需要注意'}
          </Text>
          <Text className={styles.feedbackText}>{selectedOption.feedback}</Text>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.exitBtn} onClick={handleExit}>
          退出
        </Button>
        <Button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={!showFeedback}
        >
          {currentQuestionIndex < totalQuestions - 1 ? '下一题' : '完成练习'}
        </Button>
      </View>

      {showComplete && (
        <View className={styles.completeModal}>
          <View className={styles.modalContent}>
            <Text className={styles.modalIcon}>🎉</Text>
            <Text className={styles.modalTitle}>练习完成！</Text>
            <Text className={styles.modalDesc}>
              已完成「{scene.title}」的所有练习
            </Text>
            <View className={styles.scoreDisplay}>
              <View className={styles.scoreItem}>
                <Text className={styles.scoreNumber}>{correctCount}</Text>
                <Text className={styles.scoreLabel}>正确</Text>
              </View>
              <View className={styles.scoreItem}>
                <Text className={styles.scoreNumber}>{totalQuestions - correctCount}</Text>
                <Text className={styles.scoreLabel}>需改进</Text>
              </View>
              <View className={styles.scoreItem}>
                <Text className={styles.scoreNumber}>{finalScore}</Text>
                <Text className={styles.scoreLabel}>得分</Text>
              </View>
            </View>
            <View className={styles.modalButtons}>
              <Button
                className={classnames(styles.modalBtn, styles.secondary)}
                onClick={handleRetry}
              >
                再练一次
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.primary)}
                onClick={handleBackToHome}
              >
                返回首页
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
