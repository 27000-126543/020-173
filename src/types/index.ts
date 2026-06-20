export interface SceneOption {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
  type: 'good' | 'bad' | 'neutral'
}

export interface SceneQuestion {
  id: string
  patientQuestion: string
  options: SceneOption[]
}

export interface Scene {
  id: string
  title: string
  description: string
  icon: string
  color: string
  questions: SceneQuestion[]
  totalQuestions: number
  completedCount?: number
}

export interface ReadCardPhrase {
  id: string
  text: string
  pinyin?: string
}

export interface ReadCard {
  id: string
  title: string
  category: string
  description: string
  phrases: ReadCardPhrase[]
  completed?: boolean
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctAnswerId: string
  explanation: string
  isEasyMistake?: boolean
}

export interface Quiz {
  id: string
  date: string
  title: string
  description: string
  questions: QuizQuestion[]
  completed?: boolean
  score?: number
}

export interface UserProgress {
  sceneProgress: Record<string, number>
  readCardProgress: Record<string, boolean>
  quizProgress: Record<string, QuizProgressItem>
}

export interface QuizProgressItem {
  completed: boolean
  score: number
  wrongAnswers: string[]
  userAnswers: Record<string, string>
  completedAt?: string
}

export interface SelfEvaluation {
  speed: number
  pause: number
  politeness: number
  comment: string
}

export interface PhraseRecord {
  phraseId: string
  cardId: string
  audioBase64: string
  duration: number
  createdAt: string
}

export interface QuizQuestionBank {
  id: string
  question: string
  options: QuizOption[]
  correctAnswerId: string
  explanation: string
  isEasyMistake?: boolean
  category: string
}

export interface PublishedQuiz {
  id: string
  date: string
  title: string
  description: string
  questionIds: string[]
  publishedBy: string
  publishedAt: string
}

export interface UserRole {
  isManager: boolean
}
