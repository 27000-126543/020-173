import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/appContext'
import { quizzesData } from '@/data/quizzes'
import classnames from 'classnames'

export default function QuizPage() {
  const {
    userProgress,
    getAverageQuizScore,
    isManager,
    toggleManagerMode,
    publishedQuiz,
    questionBank,
    getTodayQuizQuestions
  } = useApp()

  useDidShow(() => {
    console.log('[QuizPage] Page showed, isManager:', isManager)
  })

  const todayQuestions = getTodayQuizQuestions()

  const todayQuiz = useMemo(() => {
    if (publishedQuiz) {
      return {
        id: publishedQuiz.id,
        title: publishedQuiz.title,
        description: publishedQuiz.description,
        questions: todayQuestions,
        date: publishedQuiz.date
      }
    }
    return null
  }, [publishedQuiz, todayQuestions])

  const historyQuizzes = useMemo(() => {
    return quizzesData.filter(q => q.completed || userProgress.quizProgress[q.id]?.completed)
  }, [userProgress])

  const getQuizStatus = useCallback((quizId: string) => {
    return userProgress.quizProgress[quizId] || null
  }, [userProgress])

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

  const handlePublishQuiz = () => {
    Taro.navigateTo({
      url: '/pages/publish-quiz/index'
    })
  }

  const handleToggleManager = () => {
    Taro.showActionSheet({
      itemList: isManager ? ['切换为员工模式'] : ['切换为店长模式'],
      success: (res) => {
        if (res.tapIndex === 0) {
          toggleManagerMode()
          Taro.showToast({
            title: isManager ? '已切换为员工模式' : '已切换为店长模式',
            icon: 'none'
          })
        }
      }
    })
  }

  const avgScore = getAverageQuizScore()

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.pageTitle}>班前五分钟测验</Text>
          <Button
            className={styles.managerToggle}
            onClick={handleToggleManager}
          >
            {isManager ? '店长' : '员工'}
          </Button>
        </View>
        <Text className={styles.pageSub}>
          每日5题，巩固话术要点 · 均分 {avgScore}分
        </Text>
      </View>

      <View className={styles.content}>
        {isManager && (
          <View className={styles.managerSection}>
            <Text className={styles.sectionTitle}>店长功能</Text>
            <Button
              className={styles.publishBtn}
              onClick={handlePublishQuiz}
            >
              {publishedQuiz ? '📝 重新发布今日测验' : '📝 发布今日测验'}
            </Button>
            {publishedQuiz && (
              <Text className={styles.publishHint}>
                今日测验已发布 · {todayQuestions.length} 道题
              </Text>
            )}
          </View>
        )}

        {todayQuiz ? (
          <View className={styles.todayQuiz}>
            <Text className={styles.todayLabel}>今日测验</Text>
            <Text className={styles.quizTitle}>{todayQuiz.title}</Text>
            <Text className={styles.quizDesc}>{todayQuiz.description}</Text>
            
            <View className={styles.quizMeta}>
              <View className={styles.metaItem}>
                <Text>📝 {todayQuiz.questions.length} 道题</Text>
              </View>
              <View className={styles.metaItem}>
                <Text>⏱️ 约5分钟</Text>
              </View>
            </View>

            {(() => {
              const status = getQuizStatus(todayQuiz.id)
              if (status?.completed) {
                return (
                  <Button
                    className={classnames(styles.startBtn, styles.completed)}
                    onClick={() => handleReviewQuiz(todayQuiz.id)}
                  >
                    查看易错点
                  </Button>
                )
              }
              return (
                <Button
                  className={styles.startBtn}
                  onClick={() => handleStartQuiz(todayQuiz.id)}
                >
                  开始测验
                </Button>
              )
            })()}
          </View>
        ) : (
          <View className={styles.noTodayQuiz}>
            <Text className={styles.noTodayIcon}>📋</Text>
            <Text className={styles.noTodayText}>
              {isManager ? '请先发布今日测验' : '今日测验暂未发布'}
            </Text>
            {isManager && (
              <Button
                className={styles.goPublishBtn}
                onClick={handlePublishQuiz}
              >
                去发布
              </Button>
            )}
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
                      <Text className={styles.reviewBtn}>查看易错点 →</Text>
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
