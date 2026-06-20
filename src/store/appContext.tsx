import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { UserProgress, SelfEvaluation } from '@/types'

interface AppContextType {
  userProgress: UserProgress
  updateSceneProgress: (sceneId: string, completedQuestions: number) => void
  updateReadCardProgress: (cardId: string) => void
  updateQuizProgress: (quizId: string, score: number, wrongAnswers: string[]) => void
  selfEvaluations: Record<string, SelfEvaluation>
  updateSelfEvaluation: (phraseId: string, evaluation: SelfEvaluation) => void
  getTotalCompletedScenes: () => number
  getTotalPracticedCards: () => number
  getAverageQuizScore: () => number
}

const defaultProgress: UserProgress = {
  sceneProgress: {},
  readCardProgress: {},
  quizProgress: {}
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress)
  const [selfEvaluations, setSelfEvaluations] = useState<Record<string, SelfEvaluation>>({})

  useEffect(() => {
    try {
      const savedProgress = Taro.getStorageSync('userProgress')
      const savedEvaluations = Taro.getStorageSync('selfEvaluations')
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress))
      }
      if (savedEvaluations) {
        setSelfEvaluations(JSON.parse(savedEvaluations))
      }
    } catch (error) {
      console.error('[AppContext] Failed to load storage:', error)
    }
  }, [])

  const saveProgress = useCallback((progress: UserProgress) => {
    try {
      Taro.setStorageSync('userProgress', JSON.stringify(progress))
    } catch (error) {
      console.error('[AppContext] Failed to save progress:', error)
    }
  }, [])

  const saveEvaluations = useCallback((evaluations: Record<string, SelfEvaluation>) => {
    try {
      Taro.setStorageSync('selfEvaluations', JSON.stringify(evaluations))
    } catch (error) {
      console.error('[AppContext] Failed to save evaluations:', error)
    }
  }, [])

  const updateSceneProgress = useCallback((sceneId: string, completedQuestions: number) => {
    setUserProgress(prev => {
      const newProgress = {
        ...prev,
        sceneProgress: {
          ...prev.sceneProgress,
          [sceneId]: Math.max(prev.sceneProgress[sceneId] || 0, completedQuestions)
        }
      }
      saveProgress(newProgress)
      return newProgress
    })
  }, [saveProgress])

  const updateReadCardProgress = useCallback((cardId: string) => {
    setUserProgress(prev => {
      const newProgress = {
        ...prev,
        readCardProgress: {
          ...prev.readCardProgress,
          [cardId]: true
        }
      }
      saveProgress(newProgress)
      return newProgress
    })
  }, [saveProgress])

  const updateQuizProgress = useCallback((quizId: string, score: number, wrongAnswers: string[]) => {
    setUserProgress(prev => {
      const newProgress = {
        ...prev,
        quizProgress: {
          ...prev.quizProgress,
          [quizId]: { completed: true, score, wrongAnswers }
        }
      }
      saveProgress(newProgress)
      return newProgress
    })
  }, [saveProgress])

  const updateSelfEvaluation = useCallback((phraseId: string, evaluation: SelfEvaluation) => {
    setSelfEvaluations(prev => {
      const newEvaluations = {
        ...prev,
        [phraseId]: evaluation
      }
      saveEvaluations(newEvaluations)
      return newEvaluations
    })
  }, [saveEvaluations])

  const getTotalCompletedScenes = useCallback(() => {
    return Object.keys(userProgress.sceneProgress).filter(
      id => userProgress.sceneProgress[id] > 0
    ).length
  }, [userProgress])

  const getTotalPracticedCards = useCallback(() => {
    return Object.values(userProgress.readCardProgress).filter(Boolean).length
  }, [userProgress])

  const getAverageQuizScore = useCallback(() => {
    const scores = Object.values(userProgress.quizProgress)
      .filter(p => p.completed)
      .map(p => p.score)
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [userProgress])

  return (
    <AppContext.Provider
      value={{
        userProgress,
        updateSceneProgress,
        updateReadCardProgress,
        updateQuizProgress,
        selfEvaluations,
        updateSelfEvaluation,
        getTotalCompletedScenes,
        getTotalPracticedCards,
        getAverageQuizScore
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
