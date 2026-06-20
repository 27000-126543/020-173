import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { getQuizById } from '@/data/quizzes'
import { useApp } from '@/store/appContext'
import { calculateProgress } from '@/utils'
import classnames from 'classnames'
import { QuizOption } from '@/types'

export default function QuizDetailPage() {
  const router = useRouter()
  const quizId = router.params.id as string
  const isReview = router.params.review === '1'
  const quiz = getQuizById(quizId)
  const { updateQuizProgress, userProgress } = useApp()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({})
  const [showFinalResult, setShowFinalResult] = useState(false)

  useDidShow(() => {
    console.log('[QuizDetail] Page showed, quizId:', quizId, 'isReview:', isReview)
    if (!quiz) {
      Taro.showToast({
        title: '测验不存在',
        icon: 'error'
      })
      setTimeout(() => Taro.navigateBack(), 1000)
    }
  })

  useEffect(() => {
    if (quiz) {
      Taro.setNavigationBarTitle({
        title: quiz.title
      })
      
      if (isReview) {
        setShowFinalResult(true)
      }
    }
  }, [quiz, isReview])

  const currentQuestion = quiz?.questions[currentQuestionIndex]
  const totalQuestions = quiz?.questions.length || 0

  const existingResult = useMemo(() => {
    return userProgress.quizProgress[quizId] || null
  }, [userProgress, quizId])

  const handleOptionSelect = useCallback((option: QuizOption) => {
    if (showResult) return
    setSelectedOption(option)
    setShowResult(true)
    setAnswers(prev => ({
      ...prev,
      [currentQuestion!.id]: option
    }))
  }, [showResult, currentQuestion])

  const handleNext = useCallback(() => {
    if (!currentQuestion || !quiz) return
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    } else {
      const wrongAnswers: string[] = []
      let correctCount = 0
      
      quiz.questions.forEach(q => {
        const userAnswer = answers[q.id]
        if (userAnswer?.id === q.correctAnswerId) {
          correctCount++
        } else {
          wrongAnswers.push(q.id)
        }
      })
      
      const score = Math.round((correctCount / totalQuestions) * 100)
      updateQuizProgress(quizId, score, wrongAnswers)
      setShowFinalResult(true)
      
      console.log('[QuizDetail] Quiz completed, score:', score, 'wrong:', wrongAnswers)
    }
  }, [currentQuestion, quiz, currentQuestionIndex, totalQuestions, answers, quizId, updateQuizProgress])

  const handleExit = useCallback(() => {
    Taro.showModal({
      title: '退出测验',
      content: '确定要退出当前测验吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack()
        }
      }
    })
  }, [])

  const handleBackToQuiz = useCallback(() => {
    Taro.switchTab({
      url: '/pages/quiz/index'
    })
  }, [])

  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setShowResult(false)
    setAnswers({})
    setShowFinalResult(false)
  }, [])

  if (!quiz) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (showFinalResult || isReview) {
    const result = existingResult || {
      completed: Object.keys(answers).length === totalQuestions,
      score: 0,
      wrongAnswers: [] as string[]
    }
    
    if (!existingResult && Object.keys(answers).length === totalQuestions) {
      let correctCount = 0
      const wrongAnswers: string[] = []
      quiz.questions.forEach(q => {
        const userAnswer = answers[q.id]
        if (userAnswer?.id === q.correctAnswerId) {
          correctCount++
        } else {
          wrongAnswers.push(q.id)
        }
      })
      result.score = Math.round((correctCount / totalQuestions) * 100)
      result.wrongAnswers = wrongAnswers
    }
    
    const correctCount = totalQuestions - result.wrongAnswers.length
    const wrongQuestions = quiz.questions.filter(q => result.wrongAnswers.includes(q.id))
    
    const getResultIcon = () => {
      if (result.score >= 80) return '🎉'
      if (result.score >= 60) return '👍'
      return '💪'
    }
    
    const getResultTitle = () => {
      if (result.score >= 80) return '太棒了！'
      if (result.score >= 60) return '还不错！'
      return '继续加油！'
    }

    return (
      <View className={styles.resultPage}>
        <View className={styles.resultHeader}>
          <Text className={styles.resultIcon}>{getResultIcon()}</Text>
          <Text className={styles.resultTitle}>{getResultTitle()}</Text>
          <Text className={styles.resultSubtitle}>
            {isReview ? '查看测验结果' : `已完成「${quiz.title}」`}
          </Text>
          
          <View className={styles.scoreCircle}>
            <Text className={styles.scoreNumber}>{result.score}</Text>
            <Text className={styles.scoreLabel}>分</Text>
          </View>
          
          <View className={styles.scoreBreakdown}>
            <View className={styles.breakdownItem}>
              <Text className={styles.breakdownNumber}>{correctCount}</Text>
              <Text className={styles.breakdownLabel}>正确</Text>
            </View>
            <View className={styles.breakdownItem}>
              <Text className={styles.breakdownNumber}>{result.wrongAnswers.length}</Text>
              <Text className={styles.breakdownLabel}>错误</Text>
            </View>
            <View className={styles.breakdownItem}>
              <Text className={styles.breakdownNumber}>{totalQuestions}</Text>
              <Text className={styles.breakdownLabel}>总题数</Text>
            </View>
          </View>
        </View>

        <View className={styles.mistakesSection}>
          <Text className={styles.sectionTitle}>
            易错点回顾
            {wrongQuestions.length > 0 && (
              <Text className={styles.mistakesCount}>{wrongQuestions.length}题</Text>
            )}
          </Text>
          
          {wrongQuestions.length > 0 ? (
            <View className={styles.mistakeList}>
              {wrongQuestions.map((q, index) => {
                const correctOption = q.options.find(o => o.id === q.correctAnswerId)
                const userAnswer = isReview ? null : answers[q.id]
                
                return (
                  <View key={q.id} className={styles.mistakeCard}>
                    <Text className={styles.mistakeQuestion}>
                      {index + 1}. {q.question}
                    </Text>
                    
                    {userAnswer && (
                      <View className={styles.mistakeRow}>
                        <Text className={styles.rowLabel}>你的答案</Text>
                        <Text className={classnames(styles.rowContent, styles.wrong)}>
                          ✗ {userAnswer.text}
                        </Text>
                      </View>
                    )}
                    
                    <View className={styles.mistakeRow}>
                      <Text className={styles.rowLabel}>正确答案</Text>
                      <Text className={classnames(styles.rowContent, styles.correct)}>
                        ✓ {correctOption?.text}
                      </Text>
                    </View>
                    
                    <View className={styles.mistakeExplanation}>
                      <Text className={styles.explanationLabel}>💡 要点解析</Text>
                      <Text className={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <View className={styles.noMistakes}>
              <Text className={styles.noMistakesIcon}>🎊</Text>
              <Text className={styles.noMistakesText}>
                太棒了！本次测验全部正确，没有易错点
              </Text>
            </View>
          )}
        </View>

        <View className={styles.actionButtons}>
          <Button
            className={classnames(styles.actionBtn, styles.secondary)}
            onClick={handleRetry}
          >
            再测一次
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={handleBackToQuiz}
          >
            返回列表
          </Button>
        </View>
      </View>
    )
  }

  if (!currentQuestion) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const progress = calculateProgress(currentQuestionIndex + 1, totalQuestions)
  const isCorrect = selectedOption?.id === currentQuestion.correctAnswerId
  const correctOption = currentQuestion.options.find(o => o.id === currentQuestion.correctAnswerId)

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.quizTitle}>{quiz.title}</Text>
        <Text className={styles.quizDesc}>{quiz.description}</Text>
        <Text className={styles.progressText}>
          第 {currentQuestionIndex + 1}/{totalQuestions} 题
        </Text>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <View className={styles.questionCard}>
        <Text className={styles.questionLabel}>
          {currentQuestion.isEasyMistake ? '⭐ 高频考点' : '单选题'}
        </Text>
        <Text className={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View className={styles.optionList}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id
          const isCorrectOption = option.id === currentQuestion.correctAnswerId
          
          return (
            <Button
              key={option.id}
              className={classnames(styles.optionItem, {
                [styles.selected]: isSelected && !showResult,
                [styles.correct]: showResult && isCorrectOption,
                [styles.incorrect]: showResult && isSelected && !isCorrectOption
              })}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult}
            >
              <View className={styles.optionContent}>
                <Text className={styles.optionIndex}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text className={styles.optionText}>{option.text}</Text>
                {showResult && isCorrectOption && (
                  <Text className={styles.optionIcon}>✓</Text>
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <Text className={styles.optionIcon}>✗</Text>
                )}
              </View>
            </Button>
          )
        })}
      </View>

      {showResult && (
        <View
          className={classnames(styles.explanationCard, {
            [styles.correct]: isCorrect,
            [styles.incorrect]: !isCorrect
          })}
        >
          <Text className={styles.explanationLabel}>
            {isCorrect ? '✨ 回答正确！' : '💡 解析'}
          </Text>
          <Text className={styles.explanationText}>
            {currentQuestion.explanation}
          </Text>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.exitBtn} onClick={handleExit}>
          退出
        </Button>
        <Button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={!showResult}
        >
          {currentQuestionIndex < totalQuestions - 1 ? '下一题' : '提交答案'}
        </Button>
      </View>
    </View>
  )
}
