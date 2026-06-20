import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { UserProgress, SelfEvaluation, PhraseRecord, QuizQuestionBank, PublishedQuiz } from '@/types'
import { getStorageItem, setStorageItem, generateId, getTodayString } from '@/utils'

interface AppContextType {
  userProgress: UserProgress
  updateSceneProgress: (sceneId: string, completedQuestions: number) => void
  updateReadCardProgress: (cardId: string) => void
  updateQuizProgress: (quizId: string, score: number, wrongAnswers: string[]) => void
  selfEvaluations: Record<string, SelfEvaluation>
  updateSelfEvaluation: (phraseId: string, evaluation: SelfEvaluation) => void
  phraseRecords: Record<string, PhraseRecord>
  updatePhraseRecord: (phraseId: string, record: PhraseRecord) => void
  getTotalCompletedScenes: () => number
  getTotalPracticedCards: () => number
  getAverageQuizScore: () => number
  isManager: boolean
  toggleManagerMode: () => void
  questionBank: QuizQuestionBank[]
  publishedQuiz: PublishedQuiz | null
  publishQuiz: (questionIds: string[], title: string, description: string) => void
  getTodayQuizQuestions: () => QuizQuestionBank[]
}

const defaultProgress: UserProgress = {
  sceneProgress: {},
  readCardProgress: {},
  quizProgress: {}
}

const defaultQuestionBank: QuizQuestionBank[] = [
  {
    id: 'bank-q1',
    question: '患者问"你们补牙多少钱"，最佳回复是？',
    options: [
      { id: 'opt1', text: '补牙价格从200到2000不等' },
      { id: 'opt2', text: '要看牙齿蛀坏程度，建议先到店免费检查' },
      { id: 'opt3', text: '我们家补牙不贵的' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先说明价格的决定因素，再自然引导到店检查，用"免费检查"降低门槛。',
    isEasyMistake: true,
    category: '电话问价'
  },
  {
    id: 'bank-q2',
    question: '患者说"你们比别家贵好几百，能不能便宜点"，应该？',
    options: [
      { id: 'opt1', text: '不好意思，我们不议价' },
      { id: 'opt2', text: '那您能接受什么价位' },
      { id: 'opt3', text: '用材料、医生、服务保障说明价值，可赠送检查套餐' }
    ],
    correctAnswerId: 'opt3',
    explanation: '用"材料+医生+服务保障"支撑价格，用"赠送"替代"降价"。',
    isEasyMistake: true,
    category: '电话问价'
  },
  {
    id: 'bank-q3',
    question: '患者说"我只想问个大概价格"，应该？',
    options: [
      { id: 'opt1', text: '告知最低价200元' },
      { id: 'opt2', text: '共情理解，说明口腔治疗因人而异，建议免费检查' },
      { id: 'opt3', text: '不见到牙齿真的没法说' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先共情，说明"为什么不能直接报价"，降低患者的抵触情绪。',
    isEasyMistake: false,
    category: '电话问价'
  },
  {
    id: 'bank-q4',
    question: '患者问"为什么洗牙比别家贵"，最佳回复是？',
    options: [
      { id: 'opt1', text: '我们用的是进口设备' },
      { id: 'opt2', text: '详细说明包含的服务内容和步骤' },
      { id: 'opt3', text: '那你觉得多少钱合适' }
    ],
    correctAnswerId: 'opt2',
    explanation: '用"包含的服务内容"体现价值差异，让患者理解"贵得有道理"。',
    isEasyMistake: true,
    category: '电话问价'
  },
  {
    id: 'bank-q5',
    question: '患者抱怨"怎么还要等这么久"，最佳回复是？',
    options: [
      { id: 'opt1', text: '今天人特别多' },
      { id: 'opt2', text: '真诚道歉+告知具体等待时间+提供茶水读物' },
      { id: 'opt3', text: '预约也只是大概时间' }
    ],
    correctAnswerId: 'opt2',
    explanation: '三重安抚：道歉+具体时间+补偿性服务。',
    isEasyMistake: true,
    category: '候诊安抚'
  },
  {
    id: 'bank-q6',
    question: '患者紧张说"我怕疼"，应该？',
    options: [
      { id: 'opt1', text: '一点都不疼，放心吧' },
      { id: 'opt2', text: '共情+描述真实感受+给患者控制权' },
      { id: 'opt3', text: '越早治疗越好，拖下去更疼' }
    ],
    correctAnswerId: 'opt2',
    explanation: '不要做绝对化承诺，要给患者真实的预期和控制感。',
    isEasyMistake: true,
    category: '候诊安抚'
  },
  {
    id: 'bank-q7',
    question: '患者担心消毒问题，应该？',
    options: [
      { id: 'opt1', text: '我们消毒肯定没问题' },
      { id: 'opt2', text: '用具体细节（消毒步骤、登记本）打消疑虑' },
      { id: 'opt3', text: '新闻说的都是不正规的' }
    ],
    correctAnswerId: 'opt2',
    explanation: '空口保证不如具体细节来得可信。',
    isEasyMistake: false,
    category: '候诊安抚'
  },
  {
    id: 'bank-q8',
    question: '带孩子的家长说"孩子一直哭闹"，应该？',
    options: [
      { id: 'opt1', text: '好吧，下次再来' },
      { id: 'opt2', text: '用趣味化描述降低孩子的恐惧感' },
      { id: 'opt3', text: '这孩子就是这样' }
    ],
    correctAnswerId: 'opt2',
    explanation: '针对儿童特点，用趣味化描述（牙齿小火车、小水枪）降低恐惧感。',
    isEasyMistake: false,
    category: '候诊安抚'
  },
  {
    id: 'bank-q9',
    question: '患者说"我就是来洗个牙，怎么还说我有牙周病"，应该？',
    options: [
      { id: 'opt1', text: '洗牙和牙周治疗是两回事' },
      { id: 'opt2', text: '先打消推销顾虑，用X光片做证据，说明远期价值' },
      { id: 'opt3', text: '不治疗以后牙齿会掉的' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先打消"推销"的顾虑，再用可视化证据，最后用远期价值打动患者。',
    isEasyMistake: true,
    category: '洗牙转诊'
  },
  {
    id: 'bank-q10',
    question: '患者说"你们这洗牙还带推销的啊"，应该？',
    options: [
      { id: 'opt1', text: '我们不是推销，是真的为您好' },
      { id: 'opt2', text: '先共情，说明医生收入不挂钩，讲出不治疗的后果，给选择权' },
      { id: 'opt3', text: '不想做就不做，我们不勉强' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先共情，再打消推销顾虑，然后讲后果，最后给选择权。',
    isEasyMistake: true,
    category: '洗牙转诊'
  },
  {
    id: 'bank-q11',
    question: '种植牙太贵了，最佳回复是？',
    options: [
      { id: 'opt1', text: '种植牙本来就是这个价格' },
      { id: 'opt2', text: '用时间成本分解+对比疗法让患者理解性价比' },
      { id: 'opt3', text: '我们现在有活动，能便宜两千' }
    ],
    correctAnswerId: 'opt2',
    explanation: '用"每天才一块多"的时间分解法，加上对比疗法，让患者理解价值。',
    isEasyMistake: true,
    category: '种植顾虑'
  },
  {
    id: 'bank-q12',
    question: '种植牙疼不疼啊？最佳回复是？',
    options: [
      { id: 'opt1', text: '打了麻药不疼的' },
      { id: 'opt2', text: '先共情，用"比拔牙创伤小"降低预期，用真实案例增加说服力' },
      { id: 'opt3', text: '哪有不疼的手术' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先共情，再降低预期，具体描述感受，最后用真实案例增加说服力。',
    isEasyMistake: false,
    category: '种植顾虑'
  },
  {
    id: 'bank-q13',
    question: '患者生气说"补的牙掉了"，第一句话应该？',
    options: [
      { id: 'opt1', text: '不可能吧，是不是咬硬东西了' },
      { id: 'opt2', text: '先道歉安抚，马上安排检查' },
      { id: 'opt3', text: '补牙本来就有脱落概率' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先处理情绪再处理问题，让患者感到被重视。',
    isEasyMistake: true,
    category: '投诉处理'
  },
  {
    id: 'bank-q14',
    question: '患者质疑"乱收费"，应该？',
    options: [
      { id: 'opt1', text: '所有项目都是公示过的' },
      { id: 'opt2', text: '主动承担责任，透明化解释' },
      { id: 'opt3', text: '每个患者都收的' }
    ],
    correctAnswerId: 'opt2',
    explanation: '先主动承担"没讲清楚"的责任，再透明化解释。',
    isEasyMistake: true,
    category: '投诉处理'
  },
  {
    id: 'bank-q15',
    question: '处理投诉的正确顺序是？',
    options: [
      { id: 'opt1', text: '先处理情绪→再处理问题' },
      { id: 'opt2', text: '先解释原因→再道歉' },
      { id: 'opt3', text: '先推卸责任→再解决问题' }
    ],
    correctAnswerId: 'opt1',
    explanation: '情绪处理永远是第一位的。',
    isEasyMistake: false,
    category: '投诉处理'
  }
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress)
  const [selfEvaluations, setSelfEvaluations] = useState<Record<string, SelfEvaluation>>({})
  const [phraseRecords, setPhraseRecords] = useState<Record<string, PhraseRecord>>({})
  const [isManager, setIsManager] = useState(false)
  const [publishedQuiz, setPublishedQuiz] = useState<PublishedQuiz | null>(null)

  const questionBank = useMemo(() => defaultQuestionBank, [])

  useEffect(() => {
    const progress = getStorageItem<UserProgress>('userProgress', defaultProgress)
    const evaluations = getStorageItem<Record<string, SelfEvaluation>>('selfEvaluations', {})
    const records = getStorageItem<Record<string, PhraseRecord>>('phraseRecords', {})
    const managerMode = getStorageItem<boolean>('isManager', false)
    const published = getStorageItem<PublishedQuiz | null>('publishedQuiz', null)

    setUserProgress(progress)
    setSelfEvaluations(evaluations)
    setPhraseRecords(records)
    setIsManager(managerMode)

    const today = getTodayString()
    if (published && published.date === today) {
      setPublishedQuiz(published)
    } else if (published && published.date !== today) {
      setStorageItem('publishedQuiz', null)
    }
  }, [])

  const saveProgress = useCallback((progress: UserProgress) => {
    setStorageItem('userProgress', progress)
  }, [])

  const saveEvaluations = useCallback((evaluations: Record<string, SelfEvaluation>) => {
    setStorageItem('selfEvaluations', evaluations)
  }, [])

  const saveRecords = useCallback((records: Record<string, PhraseRecord>) => {
    setStorageItem('phraseRecords', records)
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

  const updatePhraseRecord = useCallback((phraseId: string, record: PhraseRecord) => {
    setPhraseRecords(prev => {
      const newRecords = {
        ...prev,
        [phraseId]: record
      }
      saveRecords(newRecords)
      return newRecords
    })
  }, [saveRecords])

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

  const toggleManagerMode = useCallback(() => {
    setIsManager(prev => {
      const newValue = !prev
      setStorageItem('isManager', newValue)
      return newValue
    })
  }, [])

  const publishQuiz = useCallback((questionIds: string[], title: string, description: string) => {
    const today = getTodayString()
    const quiz: PublishedQuiz = {
      id: `quiz-${today}`,
      date: today,
      title,
      description,
      questionIds,
      publishedBy: '店长',
      publishedAt: new Date().toISOString()
    }
    setPublishedQuiz(quiz)
    setStorageItem('publishedQuiz', quiz)
  }, [])

  const getTodayQuizQuestions = useCallback((): QuizQuestionBank[] => {
    if (!publishedQuiz) return []
    return publishedQuiz.questionIds
      .map(id => questionBank.find(q => q.id === id))
      .filter((q): q is QuizQuestionBank => q !== undefined)
  }, [publishedQuiz, questionBank])

  const value: AppContextType = {
    userProgress,
    updateSceneProgress,
    updateReadCardProgress,
    updateQuizProgress,
    selfEvaluations,
    updateSelfEvaluation,
    phraseRecords,
    updatePhraseRecord,
    getTotalCompletedScenes,
    getTotalPracticedCards,
    getAverageQuizScore,
    isManager,
    toggleManagerMode,
    questionBank,
    publishedQuiz,
    publishQuiz,
    getTodayQuizQuestions
  }

  return (
    <AppContext.Provider value={value}>
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
