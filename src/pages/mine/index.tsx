import React, { useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/appContext'
import { scenesData } from '@/data/scenes'

export default function MinePage() {
  const {
    userProgress,
    getTotalCompletedScenes,
    getTotalPracticedCards,
    getAverageQuizScore
  } = useApp()

  useDidShow(() => {
    console.log('[MinePage] Page showed')
  })

  const completedScenes = getTotalCompletedScenes()
  const practicedCards = getTotalPracticedCards()
  const avgScore = getAverageQuizScore()

  const easyMistakes = useMemo(() => {
    const mistakes: Array<{ id: string; title: string; times: number }> = []
    
    Object.entries(userProgress.quizProgress).forEach(([quizId, progress]) => {
      if (progress.completed && progress.wrongAnswers.length > 0) {
        progress.wrongAnswers.forEach(questionId => {
          const existing = mistakes.find(m => m.id === questionId)
          if (existing) {
            existing.times++
          } else {
            mistakes.push({
              id: questionId,
              title: `高频错题 ${questionId}`,
              times: 1
            })
          }
        })
      }
    })
    
    return mistakes.sort((a, b) => b.times - a.times).slice(0, 5)
  }, [userProgress])

  const handlePracticeScene = (sceneId: string) => {
    console.log('[MinePage] Practice scene:', sceneId)
    Taro.switchTab({
      url: '/pages/home/index'
    })
  }

  const handleClearData = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有学习进度吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.removeStorageSync('userProgress')
            Taro.removeStorageSync('selfEvaluations')
            Taro.showToast({
              title: '已清除数据',
              icon: 'success'
            })
            console.log('[MinePage] All data cleared')
            setTimeout(() => {
              Taro.reLaunch({
                url: '/pages/home/index'
              })
            }, 1000)
          } catch (error) {
            console.error('[MinePage] Failed to clear data:', error)
          }
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👩‍⚕️</Text>
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>前台咨询师</Text>
            <Text className={styles.userRole}>XX口腔诊所 · 入职30天</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{completedScenes}</Text>
              <Text className={styles.statLabel}>完成场景</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{practicedCards}</Text>
              <Text className={styles.statLabel}>跟读卡片</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{avgScore}</Text>
              <Text className={styles.statLabel}>测验均分</Text>
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>常用功能</Text>
        <View className={styles.menuSection}>
          <View
            className={styles.menuItem}
            onClick={() => handlePracticeScene('phone-price')}
          >
            <View className={styles.menuIcon}>
              <Text>📞</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>继续练习</Text>
              <Text className={styles.menuDesc}>上次练习到"电话问价"第3题</Text>
            </View>
            <Text className={styles.menuArrow}>→</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.switchTab({ url: '/pages/quiz/index' })}
          >
            <View className={styles.menuIcon}>
              <Text>📋</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>今日测验</Text>
              <Text className={styles.menuDesc}>每天5题，巩固话术要点</Text>
            </View>
            <Text className={styles.menuArrow}>→</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.switchTab({ url: '/pages/practice/index' })}
          >
            <View className={styles.menuIcon}>
              <Text>🎤</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>跟读练习</Text>
              <Text className={styles.menuDesc}>标准表达，碎片化练习</Text>
            </View>
            <Text className={styles.menuArrow}>→</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>我的易错点</Text>
        <View className={styles.weaknessSection}>
          {easyMistakes.length > 0 ? (
            <View className={styles.weaknessList}>
              {easyMistakes.map((mistake) => (
                <View key={mistake.id} className={styles.weaknessItem}>
                  <View className={styles.weaknessInfo}>
                    <Text className={styles.weaknessTitle}>{mistake.title}</Text>
                    <Text className={styles.weaknessTimes}>已错 {mistake.times} 次</Text>
                  </View>
                  <Button className={styles.practiceBtn}>去巩固</Button>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyWeakness}>
              <Text className={styles.emptyIcon}>🎉</Text>
              <Text className={styles.emptyText}>太棒了！暂无易错点</Text>
            </View>
          )}
        </View>

        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.menuSection}>
          <View className={styles.menuItem} onClick={handleClearData}>
            <View className={styles.menuIcon}>
              <Text>⚙️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>清除学习进度</Text>
              <Text className={styles.menuDesc}>重置所有练习记录</Text>
            </View>
            <Text className={styles.menuArrow}>→</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={styles.menuIcon}>
              <Text>ℹ️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>关于我们</Text>
              <Text className={styles.menuDesc}>话术练习 v1.0.0</Text>
            </View>
            <Text className={styles.menuArrow}>→</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
