import { Quiz } from '@/types'

export const quizzesData: Quiz[] = [
  {
    id: 'quiz-20260620',
    date: '2026-06-20',
    title: '6月20日班前测验',
    description: '今日主题：电话问价应对',
    completed: false,
    questions: [
      {
        id: 'q1',
        question: '患者问"你们补牙多少钱"，最佳回复是？',
        options: [
          { id: 'opt1', text: '补牙价格从200到2000不等' },
          { id: 'opt2', text: '要看牙齿蛀坏程度，建议先到店免费检查' },
          { id: 'opt3', text: '我们家补牙不贵的' }
        ],
        correctAnswerId: 'opt2',
        explanation: '先说明价格的决定因素，再自然引导到店检查，用"免费检查"降低门槛。',
        isEasyMistake: true
      },
      {
        id: 'q2',
        question: '患者说"你们比别家贵好几百，能不能便宜点"，应该？',
        options: [
          { id: 'opt1', text: '不好意思，我们不议价' },
          { id: 'opt2', text: '那您能接受什么价位' },
          { id: 'opt3', text: '用材料、医生、服务保障说明价值，可赠送检查套餐' }
        ],
        correctAnswerId: 'opt3',
        explanation: '用"材料+医生+服务保障"支撑价格，用"赠送"替代"降价"。',
        isEasyMistake: true
      },
      {
        id: 'q3',
        question: '患者说"我只想问个大概价格"，应该？',
        options: [
          { id: 'opt1', text: '告知最低价200元' },
          { id: 'opt2', text: '共情理解，说明口腔治疗因人而异，建议免费检查' },
          { id: 'opt3', text: '不见到牙齿真的没法说' }
        ],
        correctAnswerId: 'opt2',
        explanation: '先共情，说明"为什么不能直接报价"，降低患者的抵触情绪。',
        isEasyMistake: false
      },
      {
        id: 'q4',
        question: '关于矫正价格咨询，以下哪种说法是正确的？',
        options: [
          { id: 'opt1', text: '我们现在矫正有活动，优惠很大' },
          { id: 'opt2', text: '从一万多到四五万都有' },
          { id: 'opt3', text: '建议先做免费矫正面诊，设计专属方案后报价' }
        ],
        correctAnswerId: 'opt3',
        explanation: '强调"专属方案"和"免费面诊"，让患者感受到重视。',
        isEasyMistake: false
      },
      {
        id: 'q5',
        question: '患者问"为什么洗牙比别家贵"，最佳回复是？',
        options: [
          { id: 'opt1', text: '我们用的是进口设备' },
          { id: 'opt2', text: '详细说明包含的服务内容和步骤' },
          { id: 'opt3', text: '那你觉得多少钱合适' }
        ],
        correctAnswerId: 'opt2',
        explanation: '用"包含的服务内容"体现价值差异，让患者理解"贵得有道理"。',
        isEasyMistake: true
      }
    ]
  },
  {
    id: 'quiz-20260619',
    date: '2026-06-19',
    title: '6月19日班前测验',
    description: '今日主题：候诊安抚技巧',
    completed: true,
    score: 80,
    questions: [
      {
        id: 'q1',
        question: '患者抱怨"怎么还要等这么久"，最佳回复是？',
        options: [
          { id: 'opt1', text: '今天人特别多' },
          { id: 'opt2', text: '真诚道歉+告知具体等待时间+提供茶水读物' },
          { id: 'opt3', text: '预约也只是大概时间' }
        ],
        correctAnswerId: 'opt2',
        explanation: '三重安抚：道歉+具体时间+补偿性服务。',
        isEasyMistake: true
      },
      {
        id: 'q2',
        question: '患者紧张说"我怕疼"，应该？',
        options: [
          { id: 'opt1', text: '一点都不疼，放心吧' },
          { id: 'opt2', text: '共情+描述真实感受+给患者控制权' },
          { id: 'opt3', text: '越早治疗越好，拖下去更疼' }
        ],
        correctAnswerId: 'opt2',
        explanation: '不要做绝对化承诺，要给患者真实的预期和控制感。',
        isEasyMistake: true
      },
      {
        id: 'q3',
        question: '患者担心消毒问题，应该？',
        options: [
          { id: 'opt1', text: '我们消毒肯定没问题' },
          { id: 'opt2', text: '用具体细节（消毒步骤、登记本）打消疑虑' },
          { id: 'opt3', text: '新闻说的都是不正规的' }
        ],
        correctAnswerId: 'opt2',
        explanation: '空口保证不如具体细节来得可信。',
        isEasyMistake: false
      },
      {
        id: 'q4',
        question: '带孩子的家长说"孩子一直哭闹"，应该？',
        options: [
          { id: 'opt1', text: '好吧，下次再来' },
          { id: 'opt2', text: '用趣味化描述降低孩子的恐惧感' },
          { id: 'opt3', text: '这孩子就是这样' }
        ],
        correctAnswerId: 'opt2',
        explanation: '针对儿童特点，用趣味化描述（牙齿小火车、小水枪）降低恐惧感。',
        isEasyMistake: false
      },
      {
        id: 'q5',
        question: '患者说"我考虑考虑"，最佳回复是？',
        options: [
          { id: 'opt1', text: '好的，联系我们' },
          { id: 'opt2', text: '提供资料+主动询问顾虑' },
          { id: 'opt3', text: '还考虑什么呀' }
        ],
        correctAnswerId: 'opt2',
        explanation: '给出实物资料加深记忆，主动询问顾虑解决问题。',
        isEasyMistake: true
      }
    ]
  },
  {
    id: 'quiz-20260618',
    date: '2026-06-18',
    title: '6月18日班前测验',
    description: '今日主题：投诉处理原则',
    completed: true,
    score: 100,
    questions: [
      {
        id: 'q1',
        question: '患者生气说"补的牙掉了"，第一句话应该？',
        options: [
          { id: 'opt1', text: '不可能吧，是不是咬硬东西了' },
          { id: 'opt2', text: '先道歉安抚，马上安排检查' },
          { id: 'opt3', text: '补牙本来就有脱落概率' }
        ],
        correctAnswerId: 'opt2',
        explanation: '先处理情绪再处理问题，让患者感到被重视。',
        isEasyMistake: true
      },
      {
        id: 'q2',
        question: '患者质疑"乱收费"，应该？',
        options: [
          { id: 'opt1', text: '所有项目都是公示过的' },
          { id: 'opt2', text: '主动承担责任，透明化解释' },
          { id: 'opt3', text: '每个患者都收的' }
        ],
        correctAnswerId: 'opt2',
        explanation: '先主动承担"没讲清楚"的责任，再透明化解释。',
        isEasyMistake: true
      },
      {
        id: 'q3',
        question: '患者说"洗牙出了很多血"，应该？',
        options: [
          { id: 'opt1', text: '出血是因为您牙周炎太重' },
          { id: 'opt2', text: '先道歉，再解释原因，给出解决方案' },
          { id: 'opt3', text: '洗牙出血很正常' }
        ],
        correctAnswerId: 'opt2',
        explanation: '先安抚，再把"你们弄伤的"转化为"您的问题但我们能解决"。',
        isEasyMistake: true
      },
      {
        id: 'q4',
        question: '处理投诉的正确顺序是？',
        options: [
          { id: 'opt1', text: '先处理情绪→再处理问题' },
          { id: 'opt2', text: '先解释原因→再道歉' },
          { id: 'opt3', text: '先推卸责任→再解决问题' }
        ],
        correctAnswerId: 'opt1',
        explanation: '情绪处理永远是第一位的。',
        isEasyMistake: false
      },
      {
        id: 'q5',
        question: '以下哪种说法是正确的？',
        options: [
          { id: 'opt1', text: '患者生气时，要马上辩解' },
          { id: 'opt2', text: '要先共情，再解决问题' },
          { id: 'opt3', text: '直接说"这不怪我们"' }
        ],
        correctAnswerId: 'opt2',
        explanation: '共情是沟通的基础，先理解对方的感受。',
        isEasyMistake: false
      }
    ]
  }
]

export function getQuizById(id: string): Quiz | undefined {
  return quizzesData.find(quiz => quiz.id === id)
}

export function getLatestQuiz(): Quiz | undefined {
  return quizzesData.find(quiz => !quiz.completed) || quizzesData[0]
}
