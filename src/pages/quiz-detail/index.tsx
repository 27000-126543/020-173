import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { getQuizById } from '@/data/quizzes'
import { useApp } from '@/store/appContext'
import { calculateProgress } from '@/utils'
import classnames from 'classnames'
import { QuizOption, QuizQuestion } from '@/types'

export default function QuizDetailPage() {
  const router = useRouter()
  const quizId = router.params.id as string
  const isReview = router.params.review === '1'
  const { updateQuizProgress, userProgress, getTodayQuizQuestions, publishedQuiz } = useApp()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({})
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')

  useDidShow(() => {
    console.log('[QuizDetail] Page showed, quizId:', quizId, 'isReview:', isReview)
  })

  useEffect(() => {
    const todayQuestions = getTodayQuizQuestions()
    
    if (publishedQuiz && publishedQuiz.id === quizId && todayQuestions.length > 0) {
      setQuestions(todayQuestions as any)
      setQuizTitle(publishedQuiz.title)
      setQuizDescription(publishedQuiz.description)
    } else {
      const quiz = getQuizById(quizId)
      if (quiz) {
        setQuestions(quiz.questions)
        setQuizTitle(quiz.title)
        setQuizDescription(quiz.description)
      } else {
        Taro.showToast({
          title: '测验不存在',
          icon: 'error'
        })
        setTimeout(() => Taro.navigateBack(), 1000)
      }
    }

    if (isReview) {
      setShowFinalResult(true)
    }
  }, [quizId, isReview, publishedQuiz, getTodayQuizQuestions])

  useEffect(() => {
    if (quizTitle) {
      Taro.setNavigationBarTitle({
        title: quizTitle
      })
    }
  }, [quizTitle])

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  const existingResult = useMemo(() => {
    return userProgress.quizProgress[quizId] || null
  }, [userProgress, quizId])

  const handleOptionSelect = useCallback((option: QuizOption) => {
    if (showResult || !currentQuestion) return
    setSelectedOption(option)
    setShowResult(true)
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }))
  }, [showResult, currentQuestion])

  const handleNext = useCallback(() => {
    if (!currentQuestion || totalQuestions === 0) return
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    } else {
      const wrongAnswers: string[] = []
      let correctCount = 0
      
      questions.forEach(q => {
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
  }, [currentQuestion, currentQuestionIndex, totalQuestions, answers, questions, quizId, updateQuizProgress])

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

  if (questions.length === 0) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (showFinalResult || isReview) {
    const result = existingResult || {
      completed: Object.keys(answers).length === totalQuestions && totalQuestions > 0,
      score: 0,
      wrongAnswers: [] as string[]
    }
    
    if (!existingResult && Object.keys(answers).length === totalQuestions && totalQuestions > 0) {
      let correctCount = 0
      const wrongAnswers: string[] = []
      questions.forEach(q => {
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
    
    const wrongQuestions = questions.filter(q => result.wrongAnswers.includes(q.id))
    const allCorrect = result.wrongAnswers.length === 0

    return (
      <View className={styles.resultPage}>
        <View className={styles.resultHeader}>
          <Text className={styles.resultIcon}>
            {allCorrect ? '🎉' : '📝'}
          </Text>
          <Text className={styles.resultTitle}>
            {allCorrect ? '全部正确！' : '测验完成'}
          </Text>
          <Text className={styles.resultSubtitle}>
            {isReview ? '查看本次测验易错点' : '已完成今日班前测验'}
          </Text>

          {allCorrect ? (
            <View className={styles.allCorrectBox}>
              <Text className={styles.allCorrectText}>
                太棒了！本次测验全部答对，没有易错点
              </Text>
              <Text className={styles.allCorrectHint}>
                继续保持，明天继续加油 💪
              </Text>
            </View>
          ) : (
            <View className={styles.mistakeSummary}>
              <Text className={styles.summaryCount}>
                本次共 <Text className={styles.highlight}>{result.wrongAnswers.length}</Text> 道易错题
              </Text>
              <Text className={styles.summaryHint}>
                请重点复习以下题目，掌握正确话术
              </Text>
            </View>
          )}
        </View>

        {wrongQuestions.length > 0 && (
          <View className={styles.mistakesSection}>
            <Text className={styles.sectionTitle}>
              易错点回顾
            </Text>
            
            <View className={styles.mistakeList}>
              {wrongQuestions.map((q, index) => {
                const correctOption = q.options.find(o => o.id === q.correctAnswerId)
                const userAnswer = isReview ? null : answers[q.id]
                
                return (
                  <View key={q.id} className={styles.mistakeCard}>
                    <View className={styles.mistakeHeader}>
                      <View className={styles.mistakeIndex}>
                        {index + 1}
                      </View>
                      <Text className={styles.mistakeQuestion}>
                        {q.question}
                      </Text>
                    </View>
                    
                    {userAnswer && (
                      <View className={styles.mistakeRow}>
                        <Text className={styles.rowLabel}>你的答案</Text>
                        <Text className={classnames(styles.rowContent, styles.wrong)}>
                          ✗ {userAnswer.text}
                        </Text>
                      </View>
                    )}
                    
                    <View className={styles.mistakeRow}>
                      <Text className={styles.rowLabel}>正确说法</Text>
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
          </View>
        )}

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
        <Text className={styles.quizTitle}>{quizTitle}</Text>
        <Text className={styles.quizDesc}>{quizDescription}</Text>
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
            {isCorrect ? '✨ 回答正确！' : '💡 要点解析'}
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
