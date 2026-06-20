import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, RefreshControl } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { scenesData } from '@/data/scenes'
import { useApp } from '@/store/appContext'
import { calculateProgress } from '@/utils'
import classnames from 'classnames'

export default function HomePage() {
  const [refreshing, setRefreshing] = useState(false)
  const { userProgress, getTotalCompletedScenes, getTotalPracticedCards, getAverageQuizScore } = useApp()

  useDidShow(() => {
    console.log('[HomePage] Page showed')
  })

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      console.log('[HomePage] Refreshed')
    }, 1000)
  }, [])

  const handleSceneClick = (sceneId: string) => {
    console.log('[HomePage] Click scene:', sceneId)
    Taro.navigateTo({
      url: `/pages/scene-detail/index?id=${sceneId}`
    })
  }

  const getSceneProgress = (sceneId: string, total: number) => {
    const completed = userProgress.sceneProgress[sceneId] || 0
    return {
      completed,
      total,
      percentage: calculateProgress(completed, total)
    }
  }

  const totalScenes = scenesData.length
  const completedScenes = getTotalCompletedScenes()
  const practicedCards = getTotalPracticedCards()
  const avgScore = getAverageQuizScore()

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>早上好 ☀️</Text>
        <Text className={styles.subGreeting}>今天也要加油练习话术哦~</Text>
        
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{completedScenes}/{totalScenes}</Text>
            <Text className={styles.statLabel}>已练场景</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{practicedCards}</Text>
            <Text className={styles.statLabel}>跟读卡片</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{avgScore}分</Text>
            <Text className={styles.statLabel}>测验均分</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.sectionTitle}>选择练习场景</Text>
        <Text className={styles.sectionSub}>点击卡片开始真实场景模拟训练</Text>

        <View className={styles.sceneGrid}>
          {scenesData.map((scene) => {
            const progress = getSceneProgress(scene.id, scene.totalQuestions)
            return (
              <View
                key={scene.id}
                className={styles.sceneCard}
                onClick={() => handleSceneClick(scene.id)}
              >
                <View
                  className={styles.iconWrapper}
                  style={{ background: `${scene.color}20` }}
                >
                  <Text>{scene.icon}</Text>
                </View>
                <Text className={styles.sceneTitle}>{scene.title}</Text>
                <Text className={styles.sceneDesc}>{scene.description}</Text>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressFill}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </View>
                <Text className={styles.progressText}>
                  已完成 {progress.completed}/{progress.total} 题
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}
