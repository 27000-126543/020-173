import { ReadCard } from '@/types'

export const readCardsData: ReadCard[] = [
  {
    id: 'greeting',
    title: '前台接待问候语',
    category: '基础礼仪',
    description: '患者进店时的标准问候话术',
    completed: false,
    phrases: [
      {
        id: 'greeting-p1',
        text: '您好，欢迎光临XX齿科！',
        pinyin: 'nín hǎo，huān yíng guāng lín XX chǐ kē！'
      },
      {
        id: 'greeting-p2',
        text: '请问您有预约吗？',
        pinyin: 'qǐng wèn nín yǒu yù yuē ma？'
      },
      {
        id: 'greeting-p3',
        text: '麻烦您这边登记一下信息。',
        pinyin: 'má fan nín zhè biān dēng jì yī xià xìn xī。'
      },
      {
        id: 'greeting-p4',
        text: '您请坐，我给您倒杯水。',
        pinyin: 'nín qǐng zuò，wǒ gěi nín dǎo bēi shuǐ。'
      },
      {
        id: 'greeting-p5',
        text: '医生很快就好，请您稍等片刻。',
        pinyin: 'yī shēng hěn kuài jiù hǎo，qǐng nín shāo děng piàn kè。'
      }
    ]
  },
  {
    id: 'phone-answer',
    title: '电话接听标准',
    category: '电话礼仪',
    description: '接电话时的标准开场白',
    completed: true,
    phrases: [
      {
        id: 'phone-answer-p1',
        text: '您好，XX齿科，很高兴为您服务。',
        pinyin: 'nín hǎo，XX chǐ kē，hěn gāo xìng wéi nín fú wù。'
      },
      {
        id: 'phone-answer-p2',
        text: '请问有什么可以帮到您？',
        pinyin: 'qǐng wèn yǒu shén me kě yǐ bāng dào nín？'
      },
      {
        id: 'phone-answer-p3',
        text: '好的，我帮您记录一下。',
        pinyin: 'hǎo de，wǒ bāng nín jì lù yī xià。'
      },
      {
        id: 'phone-answer-p4',
        text: '请问您贵姓？怎么称呼您？',
        pinyin: 'qǐng wèn nín guì xìng？zěn me chēng hu nín？'
      },
      {
        id: 'phone-answer-p5',
        text: '好的，已经帮您预约好了。',
        pinyin: 'hǎo de，yǐ jīng bāng nín yù yuē hǎo le。'
      }
    ]
  },
  {
    id: 'price-explain',
    title: '价格解释话术',
    category: '沟通技巧',
    description: '解释治疗费用的标准表达',
    completed: false,
    phrases: [
      {
        id: 'price-explain-p1',
        text: '我们的费用主要由三部分组成。',
        pinyin: 'wǒ men de fèi yòng zhǔ yào yóu sān bù fen zǔ chéng。'
      },
      {
        id: 'price-explain-p2',
        text: '首先是检查诊断费，然后是材料费，最后是治疗费。',
        pinyin: 'shǒu xiān shì jiǎn chá zhěn duàn fèi，rán hòu shì cái liào fèi，zuì hòu shì zhì liáo fèi。'
      },
      {
        id: 'price-explain-p3',
        text: '我们使用的材料都是进口品牌，质量有保障。',
        pinyin: 'wǒ men shǐ yòng de cái liào dōu shì jìn kǒu pǐn pái，zhì liàng yǒu bǎo zhàng。'
      },
      {
        id: 'price-explain-p4',
        text: '而且我们术后有一年的免费复诊保障。',
        pinyin: 'ér qiě wǒ men shù hòu yǒu yī nián de miǎn fèi fù zhěn bǎo zhàng。'
      },
      {
        id: 'price-explain-p5',
        text: '综合来看，性价比还是很高的。',
        pinyin: 'zōng hé lái kàn，xìng jià bǐ hái shì hěn gāo de。'
      }
    ]
  },
  {
    id: 'comfort-words',
    title: '安抚患者用语',
    category: '沟通技巧',
    description: '缓解患者紧张情绪的话术',
    completed: false,
    phrases: [
      {
        id: 'comfort-words-p1',
        text: '我特别理解您的感受。',
        pinyin: 'wǒ tè bié lǐ jiě nín de gǎn shòu。'
      },
      {
        id: 'comfort-words-p2',
        text: '很多人刚开始都会有点紧张。',
        pinyin: 'hěn duō rén gāng kāi shǐ dōu huì yǒu diǎn jǐn zhāng。'
      },
      {
        id: 'comfort-words-p3',
        text: '您放心，我们医生非常有经验。',
        pinyin: 'nín fàng xīn，wǒ men yī shēng fēi cháng yǒu jīng yàn。'
      },
      {
        id: 'comfort-words-p4',
        text: '过程中要是不舒服，您随时举手示意。',
        pinyin: 'guò chéng zhōng yào shì bù shū fu，nín suí shí jǔ shǒu shì yì。'
      },
      {
        id: 'comfort-words-p5',
        text: '我们会尽量轻一点，您放松就好。',
        pinyin: 'wǒ men huì jǐn liàng qīng yī diǎn，nín fàng sōng jiù hǎo。'
      }
    ]
  },
  {
    id: 'treatment-intro',
    title: '治疗方案介绍',
    category: '专业表达',
    description: '向患者介绍治疗方案的话术',
    completed: false,
    phrases: [
      {
        id: 'treatment-intro-p1',
        text: '根据您的口腔情况，我们有两种治疗方案。',
        pinyin: 'gēn jù nín de kǒu qiāng qíng kuàng，wǒ men yǒu liǎng zhǒng zhì liáo fāng àn。'
      },
      {
        id: 'treatment-intro-p2',
        text: '第一种是传统的治疗方式，优点是价格比较实惠。',
        pinyin: 'dì yī zhǒng shì chuán tǒng de zhì liáo fāng shì，yōu diǎn shì jià gé bǐ jiào shí huì。'
      },
      {
        id: 'treatment-intro-p3',
        text: '第二种是微创治疗，恢复更快，疼痛感更轻。',
        pinyin: 'dì èr zhǒng shì wēi chuàng zhì liáo，huī fù gèng kuài，téng tòng gǎn gèng qīng。'
      },
      {
        id: 'treatment-intro-p4',
        text: '我拿模型给您演示一下，这样更直观。',
        pinyin: 'wǒ ná mó xíng gěi nín yǎn shì yī xià，zhè yàng gèng zhí guān。'
      },
      {
        id: 'treatment-intro-p5',
        text: '您可以根据自己的情况来选择。',
        pinyin: 'nín kě yǐ gēn jù zì jǐ de qíng kuàng lái xuǎn zé。'
      }
    ]
  },
  {
    id: 'post-op-notice',
    title: '术后注意事项',
    category: '专业表达',
    description: '治疗结束后的医嘱话术',
    completed: false,
    phrases: [
      {
        id: 'post-op-notice-p1',
        text: '治疗已经结束了，您感觉怎么样？',
        pinyin: 'zhì liáo yǐ jīng jié shù le，nín gǎn jué zěn me yàng？'
      },
      {
        id: 'post-op-notice-p2',
        text: '两个小时内不要吃东西，也不要漱口。',
        pinyin: 'liǎng gè xiǎo shí nèi bú yào chī dōng xi，yě bú yào shù kǒu。'
      },
      {
        id: 'post-op-notice-p3',
        text: '今天尽量吃温凉软烂的食物。',
        pinyin: 'jīn tiān jǐn liàng chī wēn liáng ruǎn làn de shí wù。'
      },
      {
        id: 'post-op-notice-p4',
        text: '如果有轻微疼痛是正常的，疼得厉害就吃片止痛药。',
        pinyin: 'rú guǒ yǒu qīng wēi téng tòng shì zhèng cháng de，téng de lì hài jiù chī piàn zhǐ tòng yào。'
      },
      {
        id: 'post-op-notice-p5',
        text: '有任何问题随时给我们打电话。',
        pinyin: 'yǒu rèn hé wèn tí suí shí gěi wǒ men dǎ diàn huà。'
      }
    ]
  },
  {
    id: 'reception-basic',
    title: '日常接待用语',
    category: '基础礼仪',
    description: '日常工作中的礼貌用语',
    completed: false,
    phrases: [
      {
        id: 'reception-basic-p1',
        text: '不好意思让您久等了。',
        pinyin: 'bù hǎo yì si ràng nín jiǔ děng le。'
      },
      {
        id: 'reception-basic-p2',
        text: '麻烦您这边请。',
        pinyin: 'má fan nín zhè biān qǐng。'
      },
      {
        id: 'reception-basic-p3',
        text: '请问还有什么可以帮您的吗？',
        pinyin: 'qǐng wèn hái yǒu shén me kě yǐ bāng nín de ma？'
      },
      {
        id: 'reception-basic-p4',
        text: '您慢走，有问题随时联系。',
        pinyin: 'nín màn zǒu，yǒu wèn tí suí shí lián xì。'
      },
      {
        id: 'reception-basic-p5',
        text: '感谢您的信任，期待您下次光临。',
        pinyin: 'gǎn xiè nín de xìn rèn，qī dài nín xià cì guāng lín。'
      }
    ]
  },
  {
    id: 'complaint-deal',
    title: '投诉应对开场白',
    category: '投诉处理',
    description: '处理投诉时的开场话术',
    completed: false,
    phrases: [
      {
        id: 'complaint-deal-p1',
        text: '非常抱歉让您遇到这种情况。',
        pinyin: 'fēi cháng bào qiàn ràng nín yù dào zhè zhǒng qíng kuàng。'
      },
      {
        id: 'complaint-deal-p2',
        text: '您先别着急，慢慢说。',
        pinyin: 'nín xiān bié zháo jí，màn màn shuō。'
      },
      {
        id: 'complaint-deal-p3',
        text: '我非常理解您现在的心情。',
        pinyin: 'wǒ fēi cháng lǐ jiě nín xiàn zài de xīn qíng。'
      },
      {
        id: 'complaint-deal-p4',
        text: '您放心，我们一定会妥善处理的。',
        pinyin: 'nín fàng xīn，wǒ men yī dìng huì tuǒ shàn chǔ lǐ de。'
      },
      {
        id: 'complaint-deal-p5',
        text: '我马上帮您联系负责人，请稍等。',
        pinyin: 'wǒ mǎ shàng bāng nín lián xì fù zé rén，qǐng shāo děng。'
      }
    ]
  }
]

export function getReadCardById(id: string): ReadCard | undefined {
  return readCardsData.find(card => card.id === id)
}

export function getPhraseById(phraseId: string): { card: ReadCard; phrase: ReadCard['phrases'][0] } | null {
  for (const card of readCardsData) {
    const phrase = card.phrases.find(p => p.id === phraseId)
    if (phrase) {
      return { card, phrase }
    }
  }
  return null
}
