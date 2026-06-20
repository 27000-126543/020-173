import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { readCardsData } from '@/data/readCards'
import { useApp } from '@/store/appContext'
import classnames from 'classnames'

const CATEGORIES = ['全部', '基础礼仪', '电话礼仪', '沟通技巧', '专业表达', '投诉处理']

export default function PracticePage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const { userProgress, getTotalPracticedCards } = useApp()

  useDidShow(() => {
    console.log('[PracticePage] Page showed')
  })

  const filteredCards = useMemo(() => {
    if (activeCategory === '全部') {
      return readCardsData
    }
    return readCardsData.filter(card => card.category === activeCategory)
  }, [activeCategory])

  const isCardCompleted = (cardId: string) => {
    return userProgress.readCardProgress[cardId] || false
  }

  const handleCardClick = (cardId: string) => {
    console.log('[PracticePage] Click card:', cardId)
    Taro.navigateTo({
      url: `/pages/read-detail/index?id=${cardId}`
    })
  }

  const practicedCount = getTotalPracticedCards()
  const totalCount = readCardsData.length

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <Text className={styles.pageTitle}>跟读卡片</Text>
        <Text className={styles.pageSub}>
          已掌握 {practicedCount}/{totalCount} 张卡片，继续加油！
        </Text>
      </View>

      <View className={styles.content}>
        <ScrollView className={styles.categoryTabs} scrollX>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              className={classnames(styles.categoryTab, {
                [styles.active]: activeCategory === category
              })}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </ScrollView>

        <View className={styles.cardList}>
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <View
                key={card.id}
                className={styles.cardItem}
                onClick={() => handleCardClick(card.id)}
              >
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>{card.title}</Text>
                  {isCardCompleted(card.id) && (
                    <View className={styles.completedBadge}>
                      <Text>✓ 已完成</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.cardCategory}>{card.category}</Text>
                <Text className={styles.cardDesc}>{card.description}</Text>
                <View className={styles.cardFooter}>
                  <Text className={styles.phraseCount}>
                    共 {card.phrases.length} 句标准表达
                  </Text>
                  <Button className={styles.startBtn}>
                    {isCardCompleted(card.id) ? '再练一次' : '开始练习'}
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📚</Text>
              <Text className={styles.emptyText}>该分类暂无卡片</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
