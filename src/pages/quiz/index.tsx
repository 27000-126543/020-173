import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { quizzesData, getLatestQuiz } from '@/data/quizzes'
import { useApp } from '@/store/appContext'
import classnames from 'classnames'

export default function QuizPage() {
  const { userProgress, getAverageQuizScore } = useApp()

  useDidShow(() => {
    console.log('[QuizPage] Page showed')
  })

  const latestQuiz = useMemo(() => getLatestQuiz(), [])
  const historyQuizzes = useMemo(() => {
    return quizzesData.filter(q => q.completed || userProgress.quizProgress[q.id]?.completed)
  }, [userProgress])

  const getQuizStatus = (quizId: string) => {
    return userProgress.quizProgress[quizId] || null
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'good'
    if (score >= 60) return 'medium'
    return 'bad'
  }

  const handleStartQuiz = (quizId: string) => {
    console.log('[QuizPage] Start quiz:', quizId)
    Taro.navigateTo({
      url: `/pages/quiz-detail/index?id=${quizId}`
    })
  }

  const handleReviewQuiz = (quizId: string) => {
    console.log('[QuizPage] Review quiz:', quizId)
    Taro.navigateTo({
      url: `/pages/quiz-detail/index?id=${quizId}&review=1`
    })
  }

  const avgScore = getAverageQuizScore()

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <Text className={styles.pageTitle}>班前五分钟测验</Text>
        <Text className={styles.pageSub}>
          每日5题，巩固话术要点 · 均分 {avgScore}分
        </Text>
      </View>

      <View className={styles.content}>
        {latestQuiz && (
          <View className={styles.todayQuiz}>
            <Text className={styles.todayLabel}>今日测验</Text>
            <Text className={styles.quizTitle}>{latestQuiz.title}</Text>
            <Text className={styles.quizDesc}>{latestQuiz.description}</Text>
            
            <View className={styles.quizMeta}>
              <View className={styles.metaItem}>
                <Text>📝 {latestQuiz.questions.length} 道题</Text>
              </View>
              <View className={styles.metaItem}>
                <Text>⏱️ 约5分钟</Text>
              </View>
            </View>

            {(() => {
              const status = getQuizStatus(latestQuiz.id)
              if (status?.completed) {
                return (
                  <Button
                    className={classnames(styles.startBtn, styles.completed)}
                    onClick={() => handleReviewQuiz(latestQuiz.id)}
                  >
                    查看结果 · {status.score}分
                  </Button>
                )
              }
              return (
                <Button
                  className={styles.startBtn}
                  onClick={() => handleStartQuiz(latestQuiz.id)}
                >
                  开始测验
                </Button>
              )
            })()}
          </View>
        )}

        <View className={styles.historySection}>
          <Text className={styles.sectionTitle}>历史测验</Text>
          
          <View className={styles.historyList}>
            {historyQuizzes.length > 0 ? (
              historyQuizzes.map((quiz) => {
                const status = getQuizStatus(quiz.id)
                const score = status?.score ?? quiz.score ?? 0
                return (
                  <View
                    key={quiz.id}
                    className={styles.historyItem}
                    onClick={() => handleReviewQuiz(quiz.id)}
                  >
                    <View className={styles.historyHeader}>
                      <Text className={styles.historyTitle}>{quiz.title}</Text>
                      <View
                        className={classnames(
                          styles.scoreBadge,
                          styles[getScoreLevel(score)]
                        )}
                      >
                        <Text>{score}分</Text>
                      </View>
                    </View>
                    <Text className={styles.historyDesc}>{quiz.description}</Text>
                    <View className={styles.historyFooter}>
                      <Text className={styles.historyDate}>{quiz.date}</Text>
                      <Text className={styles.reviewBtn}>查看详情 →</Text>
                    </View>
                  </View>
                )
              })
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📋</Text>
                <Text className={styles.emptyText}>暂无历史测验记录</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
