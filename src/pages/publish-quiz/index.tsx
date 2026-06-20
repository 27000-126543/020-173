import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/appContext'
import { getTodayString } from '@/utils'
import classnames from 'classnames'
import { QuizQuestionBank } from '@/types'

const CATEGORIES = ['全部', '电话问价', '候诊安抚', '洗牙转诊', '种植顾虑', '投诉处理']

export default function PublishQuizPage() {
  const { questionBank, publishQuiz, publishedQuiz } = useApp()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useDidShow(() => {
    console.log('[PublishQuiz] Page showed')
    if (publishedQuiz) {
      setSelectedIds(publishedQuiz.questionIds)
    }
  })

  const filteredQuestions = useMemo(() => {
    if (activeCategory === '全部') return questionBank
    return questionBank.filter(q => q.category === activeCategory)
  }, [questionBank, activeCategory])

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id)
  }, [selectedIds])

  const toggleQuestion = useCallback((question: QuizQuestionBank) => {
    setSelectedIds(prev => {
      if (prev.includes(question.id)) {
        return prev.filter(id => id !== question.id)
      } else {
        if (prev.length >= 5) {
          Taro.showToast({
            title: '最多选择5道题',
            icon: 'none'
          })
          return prev
        }
        return [...prev, question.id]
      }
    })
  }, [])

  const handlePublish = useCallback(() => {
    if (selectedIds.length < 5) {
      Taro.showToast({
        title: '请选择5道题',
        icon: 'none'
      })
      return
    }

    const today = getTodayString()
    const dateObj = new Date()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()

    Taro.showModal({
      title: '确认发布',
      content: `确定要发布今日的班前测验吗？共 ${selectedIds.length} 道题。`,
      success: (res) => {
        if (res.confirm) {
          const title = `${month}月${day}日班前测验`
          const categories = [...new Set(selectedIds.map(id => {
            const q = questionBank.find(item => item.id === id)
            return q?.category || ''
          }))].filter(Boolean)
          const description = `今日主题：${categories.slice(0, 2).join('、')}`

          publishQuiz(selectedIds, title, description)
          
          Taro.showToast({
            title: '发布成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      }
    })
  }, [selectedIds, questionBank, publishQuiz])

  const handleCancel = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const getCorrectOptionText = (question: QuizQuestionBank) => {
    const correct = question.options.find(o => o.id === question.correctAnswerId)
    return correct?.text || ''
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>发布今日测验</Text>
        <Text className={styles.pageSub}>
          从题库中选择5道题组成今日班前测验
        </Text>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionTitle}>
          已选题目
          <Text className={styles.selectedCount}>{selectedIds.length}/5</Text>
        </View>

        <View className={styles.categoryTabs}>
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              className={classnames(styles.categoryTab, {
                [styles.active]: activeCategory === cat
              })}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </View>

        {filteredQuestions.length > 0 ? (
          <View className={styles.questionList}>
            {filteredQuestions.map((question, index) => (
              <View
                key={question.id}
                className={classnames(styles.questionItem, {
                  [styles.selected]: isSelected(question.id)
                })}
                onClick={() => toggleQuestion(question)}
              >
                <View className={styles.questionHeader}>
                  <View className={styles.questionIndex}>
                    {isSelected(question.id) ? '✓' : index + 1}
                  </View>
                  <Text className={styles.questionText}>{question.question}</Text>
                  <View className={styles.selectCheckbox}>
                    {isSelected(question.id) ? '✓' : ''}
                  </View>
                </View>

                <View className={styles.questionOptions}>
                  {question.options.map((opt, optIdx) => {
                    const isCorrect = opt.id === question.correctAnswerId
                    return (
                      <View
                        key={opt.id}
                        className={classnames(styles.optionItem, {
                          [styles.correct]: isCorrect
                        })}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt.text}
                      </View>
                    )
                  })}
                </View>

                <View className={styles.questionFooter}>
                  <View className={styles.questionCategory}>
                    {question.category}
                  </View>
                  {question.isEasyMistake && (
                    <View className={styles.questionCategory}>
                      ⭐ 高频考点
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            该分类暂无题目
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.cancelBtn}
          onClick={handleCancel}
        >
          取消
        </Button>
        <Button
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={selectedIds.length !== 5}
        >
          {publishedQuiz ? '重新发布' : '发布测验'}
        </Button>
      </View>
    </View>
  )
}
