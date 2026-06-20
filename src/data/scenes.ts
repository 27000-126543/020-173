import { Scene } from '@/types'

export const scenesData: Scene[] = [
  {
    id: 'phone-price',
    title: '电话问价',
    description: '患者来电咨询价格，如何专业解答并引导到店',
    icon: '📞',
    color: '#4ECDC4',
    totalQuestions: 5,
    completedCount: 2,
    questions: [
      {
        id: 'q1',
        patientQuestion: '你们补牙多少钱啊？',
        options: [
          {
            id: 'opt1',
            text: '补牙价格从200到2000不等，看你选哪种材料。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引发反感：直接报价格区间会让患者觉得"水很深"，容易继续追问最低价，难以引导到店面诊。'
          },
          {
            id: 'opt2',
            text: '补牙的费用要看牙齿蛀坏的程度和选择的材料，建议您先到店让医生检查一下，我帮您预约个免费检查号可以吗？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先说明价格的决定因素，再自然引导到店检查，用"免费检查"降低门槛，提高到店率。'
          },
          {
            id: 'opt3',
            text: '我们家补牙不贵的，您什么时候方便过来看看？',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 不够专业："不贵"这种主观描述缺乏说服力，没有建立专业信任感。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '为什么你们洗牙比别家贵？',
        options: [
          {
            id: 'opt1',
            text: '我们用的是进口设备，而且医生都是正规医学院毕业的。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 比较空泛：设备和医生资质是基础，但没有直接体现对患者的价值。'
          },
          {
            id: 'opt2',
            text: '那你觉得多少钱合适？我们也有便宜的。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引发反感：价格谈判姿态会降低专业形象，患者会觉得可以随便砍价。'
          },
          {
            id: 'opt3',
            text: '我们的洗牙包含了牙周检查、牙结石清理、抛光和牙龈上药四个步骤，全程约40分钟，医生会根据您的口腔情况给出个性化建议，而不是简单的"洗洗白"。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：用"包含的服务内容"来体现价值差异，让患者理解"贵得有道理"，而不是直接反驳。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '我只想问个大概价格，合适再过去。',
        options: [
          {
            id: 'opt1',
            text: '那我告诉您最低价是200，您过来检查后再说。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引发反感：只说最低价会让患者有被"套路"的感觉，到店后价格更高反而会引起纠纷。'
          },
          {
            id: 'opt2',
            text: '理解您的顾虑！其实口腔治疗和买东西不一样，同样是补牙，浅龋和深龋的治疗方案差别很大。我帮您约个医生先免费检查，医生会给您一个准确的报价和方案，您觉得合适再做，这样更靠谱，您说呢？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先共情理解，再用专业理由说明"为什么不能直接报价"，用"免费检查"和"合适再做"降低心理门槛。'
          },
          {
            id: 'opt3',
            text: '那您还是过来检查吧，不见到牙齿情况真的没法说。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 态度生硬：虽然是事实，但表达方式容易让患者觉得被拒绝，缺乏服务意识。'
          }
        ]
      },
      {
        id: 'q4',
        patientQuestion: '你们做牙齿矫正多少钱？',
        options: [
          {
            id: 'opt1',
            text: '矫正要看您选择哪种方式，金属的、陶瓷的、隐形的价格都不一样，从一万多到四五万都有。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 信息过载：价格范围太大会让患者感到茫然，也容易和别家对比价格。'
          },
          {
            id: 'opt2',
            text: '矫正价格因人而异，建议您先到店做个免费的矫正面诊，我们有专门的矫正医生可以给您拍片检查，设计专属方案，这样报的价格才准确。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：强调"专属方案"和"免费面诊"，让患者感受到重视，同时自然引导到店。'
          },
          {
            id: 'opt3',
            text: '我们现在矫正有活动，优惠很大的，您过来看看吧。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 显得廉价：用"活动"、"优惠"来吸引，对矫正这种高客单价项目来说，反而会降低专业可信度。'
          }
        ]
      },
      {
        id: 'q5',
        patientQuestion: '你们家比别家贵好几百呢，能不能便宜点？',
        options: [
          {
            id: 'opt1',
            text: '不好意思，我们是明码标价不议价的。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 容易让患者觉得冷冰冰：虽然坚持了价格原则，但缺乏温度。'
          },
          {
            id: 'opt2',
            text: '那您能接受什么价位？我帮您问问店长。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 自降身价：轻易让步会让患者觉得利润空间很大，也破坏了价格体系。'
          },
          {
            id: 'opt3',
            text: '非常理解您的想法！我们确实不是最便宜的，但我们的治疗材料都是正规品牌，医生也有多年经验，而且术后有一年的免费复诊保障，您看这几项加起来，其实性价比很高。如果您今天预约，我可以帮您申请一个免费的口腔检查套餐赠送。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先共情，再用"材料+医生+服务保障"三个支点支撑价格，最后用"赠送"替代"降价"，既不破坏价格体系，又给了患者获得感。'
          }
        ]
      }
    ]
  },
  {
    id: 'waiting-comfort',
    title: '到店候诊安抚',
    description: '患者到店后的接待、等候安抚和情绪管理',
    icon: '🛋️',
    color: '#FFB4A2',
    totalQuestions: 4,
    completedCount: 0,
    questions: [
      {
        id: 'q1',
        patientQuestion: '怎么还要等这么久啊？我预约了时间的。',
        options: [
          {
            id: 'opt1',
            text: '不好意思啊今天人特别多，您再坐会儿。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 不够真诚："人特别多"听起来像是借口，没有给出具体的等待时间和解决方案。'
          },
          {
            id: 'opt2',
            text: '真的很抱歉让您久等！前面这位患者的治疗比预期复杂了一些，大约还需要15分钟。我先给您倒杯菊花茶，再给您拿份我们的口腔保健小册子，您看可以吗？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：真诚道歉+给出具体等待时间+提供补偿性服务（茶水+读物），三重安抚有效缓解焦虑。'
          },
          {
            id: 'opt3',
            text: '预约也只是大概时间，治疗时间本来就不确定的。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引发反感：听起来像是在推卸责任，把问题归咎于患者对"预约"的理解有误。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '（紧张地）我还是有点怕疼，能不做吗？',
        options: [
          {
            id: 'opt1',
            text: '不用怕的，一点都不疼，放心吧。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易失去信任："一点都不疼"的承诺过于绝对，如果治疗过程中有疼痛感，会让患者觉得被骗了。'
          },
          {
            id: 'opt2',
            text: '我特别理解您的感受！很多人都会紧张。其实我们会先打麻药，过程中只会有轻微的酸胀感。您要是实在紧张，治疗过程中觉得不舒服就举左手，我们马上停下。您看这样可以吗？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先共情（"很多人都会紧张"），再描述真实感受（"轻微酸胀"），最后给患者控制权（"举左手停下"），有效降低焦虑感。'
          },
          {
            id: 'opt3',
            text: '那不行啊，您这牙越早治疗越好，拖下去更疼更贵。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 沟通方式过于直接：虽然说的是事实，但在患者紧张焦虑的时候，讲道理只会增加反感。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '你们这个消毒没问题吧？我看新闻说有些诊所消毒不严格。',
        options: [
          {
            id: 'opt1',
            text: '您放心，我们消毒肯定没问题的。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 缺乏说服力：空口保证不如具体细节来得可信。'
          },
          {
            id: 'opt2',
            text: '您的顾虑太正常了！我们也特别重视消毒这块。您看那边的消毒室，所有器械都是"一人一用一消毒"，消毒过程有16个步骤，我们有专门的消毒登记本，您要是感兴趣我可以拿给您看看。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先肯定患者的顾虑，然后用具体细节（16个步骤、登记本、可视化的消毒室）来打消疑虑，专业又真诚。'
          },
          {
            id: 'opt3',
            text: '新闻上说的都是不正规的小诊所，我们不会的。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 有贬低同行之嫌，而且依然没有提供证据证明自己的消毒水平。'
          }
        ]
      },
      {
        id: 'q4',
        patientQuestion: '（带着小孩）孩子一直哭闹，要不我们下次再来吧。',
        options: [
          {
            id: 'opt1',
            text: '好吧，那你们下次再来。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 错失机会：简单同意会让本次接诊前功尽弃，也没有尝试解决问题。'
          },
          {
            id: 'opt2',
            text: '您别着急！我先带小朋友去看看我们的"牙齿小火车"诊疗椅，让他摸摸这个会喷水的小水枪玩一下。我们的儿童医生特别有经验，等孩子熟悉环境了再看，您看行吗？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：针对儿童的特点，先用趣味化的描述（牙齿小火车、小水枪）降低恐惧感，再介绍医生的专业性，给家长信心。'
          },
          {
            id: 'opt3',
            text: '这孩子就是这样，得哄哄。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 评价孩子容易让家长不悦，而且没有提供任何建设性的解决方案。'
          }
        ]
      }
    ]
  },
  {
    id: 'cleaning-referral',
    title: '洗牙转诊检查',
    description: '洗牙过程中发现问题，如何自然推荐进一步治疗',
    icon: '🦷',
    color: '#A8E6CF',
    totalQuestions: 4,
    completedCount: 1,
    questions: [
      {
        id: 'q1',
        patientQuestion: '我就是来洗个牙，怎么还说我有牙周病要治疗？',
        options: [
          {
            id: 'opt1',
            text: '洗牙和牙周治疗是两回事，您这个情况光洗牙解决不了。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 太专业生硬：患者听不懂"两回事"是什么意思，容易觉得是在推销项目。'
          },
          {
            id: 'opt2',
            text: '您放心，我们绝对不会过度医疗。您看这张口腔全景片，您的牙槽骨已经有吸收了，如果只是简单洗牙，牙结石还会继续往牙龈下面长，到时候牙齿松动了就晚了。我们先做个深度清洁把龈下结石去掉，这是在帮您保住牙齿。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先打消"推销"的顾虑，再用X光片作为可视化证据，最后用"保住牙齿"这个远期价值来打动患者。'
          },
          {
            id: 'opt3',
            text: '不治疗的话以后牙齿会掉的，您自己考虑清楚。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 恐吓式沟通容易引起反感，患者会觉得你在吓唬他来消费。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '你们这洗牙还带推销的啊？',
        options: [
          {
            id: 'opt1',
            text: '我们不是推销，是真的为您好。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 越解释越像推销，这句话本身就是销售常用语。'
          },
          {
            id: 'opt2',
            text: '非常理解您的感受！换作是我也会有这种顾虑。其实我们医生的收入和项目推荐不挂钩，只是您这个情况如果不及时处理，下次来可能就不是几百块能解决的了。您要不要先了解一下治疗方案和费用，觉得不合适也没关系的。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先共情，再用"医生收入不挂钩"打消推销顾虑，然后讲出不治疗的后果，最后给选择权，让患者觉得是"为我好"而不是"赚我钱"。'
          },
          {
            id: 'opt3',
            text: '不想做就不做，我们不勉强。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 态度敷衍，既没有解释清楚，也破坏了医患信任。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '这个蛀牙一定要做根管治疗吗？不能直接补吗？',
        options: [
          {
            id: 'opt1',
            text: '您这个蛀得太深了，已经到神经了，必须做根管。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 太直接太绝对：患者对"必须"两个字会有抵触情绪，也不理解为什么"必须"。'
          },
          {
            id: 'opt2',
            text: '您看这张牙片，蛀牙已经蛀到牙神经所在的空腔了，如果直接补上，里面的炎症会继续发展，以后会疼得更厉害，最后还得做根管，白花钱还遭罪。我们现在做根管是把感染的神经清理干净，再把牙齿补起来，这样才能保住这颗牙。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：用可视化的牙片做证据，对比"直接补"和"做根管"两种选择的后果，让患者理解"为什么要做"而不是"医生让我做"。'
          },
          {
            id: 'opt3',
            text: '直接补也行，但以后疼了别找我们。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 不负责任的说法，听起来像是赌气，非常不专业。'
          }
        ]
      },
      {
        id: 'q4',
        patientQuestion: '我考虑考虑再说吧。',
        options: [
          {
            id: 'opt1',
            text: '好的，那您考虑好联系我们。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 过于被动：很可能患者一出门就忘了，转化率极低。'
          },
          {
            id: 'opt2',
            text: '没问题，您可以慢慢考虑！我把您的牙片和治疗方案打印一份给您带走，上面有详细的费用明细。您看您对哪方面还有顾虑，我现在可以帮您解答。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：同意考虑→给出实物资料（加深记忆）→主动询问顾虑（解决问题），既尊重患者的选择，又为后续沟通留下了伏笔。'
          },
          {
            id: 'opt3',
            text: '还考虑什么呀，这种情况越早治疗越好。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引起反感：催促会让患者觉得你在逼他做决定，反而会抗拒。'
          }
        ]
      }
    ]
  },
  {
    id: 'implant-concern',
    title: '种植顾虑解释',
    description: '解答患者对种植牙的价格、疼痛、寿命等顾虑',
    icon: '🌱',
    color: '#B5EAD7',
    totalQuestions: 5,
    completedCount: 0,
    questions: [
      {
        id: 'q1',
        patientQuestion: '种植牙太贵了，一颗就要一万多。',
        options: [
          {
            id: 'opt1',
            text: '种植牙本来就是这个价格，我们用的都是进口植体。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 缺乏价值塑造：只说"进口植体"无法支撑一万多的价格，患者还是觉得贵。'
          },
          {
            id: 'opt2',
            text: '您算一笔账就明白了：种植牙如果维护得好可以用二三十年，平均下来每天才一块多，而且不损伤旁边的好牙。要是做烤瓷桥，虽然便宜几千，但要磨掉两颗好牙，而且10年左右就得换，到时候那两颗好牙也可能出问题，反而花得更多。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：用"时间成本分解+对比疗法"让患者理解性价比，而不是只谈价格。"每天一块多"的说法让贵的感觉大幅降低。'
          },
          {
            id: 'opt3',
            text: '我们现在有活动，能便宜两千。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 轻易降价会让患者觉得利润空间大，而且没有解决"为什么贵"的根本问题，下次问还是觉得贵。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '种植牙疼不疼啊？听起来就很可怕。',
        options: [
          {
            id: 'opt1',
            text: '打了麻药不疼的，放心吧。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 太笼统：没有具体描述过程和感受，患者还是会想象得很可怕。'
          },
          {
            id: 'opt2',
            text: '很多患者都跟我说过同样的担心！其实种植是个很小的手术，比拔牙创伤还小。术前我们会打进口麻药，过程中您只会感觉到轻微的震动感，不会疼。术后我们会给您开止痛药和消炎药，大多数人第二天就能正常吃饭上班了。我们上周有个70岁的阿姨做完，说比拔牙舒服多了。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先共情，再用"比拔牙创伤小"降低预期，具体描述感受（"轻微震动感"），最后用真实案例增加说服力。'
          },
          {
            id: 'opt3',
            text: '哪有不疼的手术，忍忍就过去了。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 增加恐惧感：这句话会让本来就紧张的患者更加害怕，直接打退堂鼓。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '种植牙能用多少年啊？会不会过几年就掉了？',
        options: [
          {
            id: 'opt1',
            text: '我们植体是终身质保的，您放心。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 不够严谨："终身质保"是厂家的，但如果患者自己维护不好，植体还是会出问题，容易留下纠纷隐患。'
          },
          {
            id: 'opt2',
            text: '种植牙的使用寿命和您自己的维护密切相关。世界上第一颗种植牙用了整整48年，直到主人去世都还好好的。我们会教您正确的清洁方法，只要您每年定期复查，用个二三十年是很普遍的。而且我们的植体有厂家质保，只要按要求复查，有任何问题我们都负责。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：用真实案例（48年）增加可信度，说明"维护很重要"的同时给出承诺，既严谨又给了患者信心。'
          },
          {
            id: 'opt3',
            text: '这个要看个人使用情况，有的人用得久有的人用不久。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 等于没说，而且会让患者更加不确定，不敢做决定。'
          }
        ]
      },
      {
        id: 'q4',
        patientQuestion: '我年纪大了，做种植牙会不会有风险？',
        options: [
          {
            id: 'opt1',
            text: '年纪不是问题，我们80多岁的都做过。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 听起来很勇敢，但不够严谨：患者关心的是"风险"，不是"有没有人做过"。'
          },
          {
            id: 'opt2',
            text: '您这个担心特别好！我们术前会给您做全面的身体检查，包括血压、血糖这些指标，确认身体条件允许才会安排手术。我们的种植医生有十多年经验，术前评估非常严格。如果身体条件不适合，我们也不会建议您做的，安全永远是第一位的。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先肯定顾虑，然后描述术前评估流程（让患者感到严谨），强调医生经验和"安全第一"，让患者觉得你们是负责任的。'
          },
          {
            id: 'opt3',
            text: '任何手术都有风险，您要签字同意的。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 冷冰冰的流程化说法，会让患者觉得你们在推卸责任。'
          }
        ]
      },
      {
        id: 'q5',
        patientQuestion: '我再跟家里人商量一下。',
        options: [
          {
            id: 'opt1',
            text: '好的，商量好告诉我。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 过于被动，没有为后续沟通铺垫，患者可能一去不复返。'
          },
          {
            id: 'opt2',
            text: '应该的，这么大的事是要和家人商量。这样吧，我把您的CT片和种植方案发到您微信上，您给家人看的时候也有个参考。另外下周三有个种植专家坐诊，要是您家人方便，可以一起来让专家再看看，有什么问题当场解答。我帮您留个位置？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先表示理解，再主动提供资料帮助沟通，最后用"专家坐诊"创造二次到店的机会，把"商量"变成"一起咨询"，大大提高转化率。'
          },
          {
            id: 'opt3',
            text: '还商量什么呀，这是为您好。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 不尊重患者的决定，容易引起反感，反而会坚定患者"再想想"的想法。'
          }
        ]
      }
    ]
  },
  {
    id: 'complaint-handling',
    title: '投诉处理',
    description: '应对患者的不满和投诉，化解矛盾提升满意度',
    icon: '💬',
    color: '#FFD3B6',
    totalQuestions: 3,
    completedCount: 0,
    questions: [
      {
        id: 'q1',
        patientQuestion: '你们补的牙才半个月就掉了！什么水平！',
        options: [
          {
            id: 'opt1',
            text: '不可能吧，您是不是咬了硬东西？',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 容易引发更大反感：第一反应是"不可能"和"你自己的问题"，完全没有倾听和共情，像在推卸责任。'
          },
          {
            id: 'opt2',
            text: '真的很抱歉让您遇到这种情况！您先别着急，我马上帮您安排医生检查，看看具体是什么问题。不管是什么原因，我们都会帮您处理好，您放心。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先道歉+安抚情绪→马上安排解决→给出承诺，先处理情绪再处理问题，让患者感到被重视。'
          },
          {
            id: 'opt3',
            text: '补牙本来就有脱落的概率，我们质保一年，掉了可以免费补。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 虽然讲的是事实，但在患者生气的时候说"本来就有概率"，听起来像在辩解，缺乏同理心。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '你们洗的时候怎么出了这么多血？是不是伤到我了？',
        options: [
          {
            id: 'opt1',
            text: '出血是因为您牙周炎太重了，不怪我们。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 完全在推卸责任："不怪我们"四个字直接把患者推到对立面，让简单的疑问升级为投诉。'
          },
          {
            id: 'opt2',
            text: '非常抱歉让您担心了！其实出血的位置恰恰说明您的牙龈有炎症，健康的牙龈洗牙是不会出血的。我们已经帮您把牙结石清理干净了，配合使用药用漱口水，炎症消了以后刷牙就不会出血了。您要是不放心，我让医生再给您检查一下？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先道歉安抚→解释出血的真正原因（把"你们弄伤的"转化为"你自己的问题，但我们能解决"）→给出解决方案→提供复查选项，层层递进化解疑虑。'
          },
          {
            id: 'opt3',
            text: '洗牙出血很正常的，别人也这样。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 缺乏说服力："别人也这样"并不能解答患者的疑惑，反而显得不专业。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '你们收费单上怎么还有个"特殊材料费"，这不是乱收费吗？',
        options: [
          {
            id: 'opt1',
            text: '所有项目收费都是公示过的，您自己没看吧。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 攻击性语言："您自己没看吧"把责任推给患者，会让对方下不来台，激化矛盾。'
          },
          {
            id: 'opt2',
            text: '这个问题提得特别好！是我们工作没做到位，术前没给您讲清楚。这个"特殊材料费"是您补牙时用的进口粘结剂，单子上每一项都有物价局备案的。我给您拿我们的价目表，一项一项给您解释清楚，行吗？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先肯定问题+主动承担责任（"是我们没讲清楚"）→解释费用明细→提供透明化服务，有效打消"乱收费"的疑虑。'
          },
          {
            id: 'opt3',
            text: '这是正常收费，每个患者都收的。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 解释不够透明："每个患者都收"并不能证明收费合理，反而会让患者觉得是霸王条款。'
          }
        ]
      }
    ]
  },
  {
    id: 'post-op-follow',
    title: '术后回访话术',
    description: '治疗后的电话回访，提升患者满意度和复购',
    icon: '📱',
    color: '#CDB4DB',
    totalQuestions: 3,
    completedCount: 0,
    questions: [
      {
        id: 'q1',
        patientQuestion: '（接起电话）你好哪位？',
        options: [
          {
            id: 'opt1',
            text: '您好，我是XX齿科的小张，您昨天在我们这补过牙，今天打电话回访一下。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 中规中矩，但不够温暖：直接报"做过什么治疗"容易让患者紧张，担心出了什么问题。'
          },
          {
            id: 'opt2',
            text: '您好李阿姨！我是XX齿科的小周呀，还记得我吗？昨天您临走前我还跟您说过两天给您打电话~今天主要是想问问您那颗补过的牙用着还好吧？有没有不舒服的地方？',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先亲切称呼+自我介绍（唤起记忆）+说明回访原因（不是出问题，是我们记挂您），让回访变成温暖的关心而不是质量检查。'
          },
          {
            id: 'opt3',
            text: '您好，请问是XXX吗？这里是XX齿科。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 太官方，像催收或推销电话，容易让患者警惕甚至直接挂断。'
          }
        ]
      },
      {
        id: 'q2',
        patientQuestion: '有点疼，而且感觉咬合不太对。',
        options: [
          {
            id: 'opt1',
            text: '那您可能需要回来调一下咬合，什么时候方便？',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 虽然给出了解决方案，但缺乏共情：患者说疼，首先应该表达关心，而不是直接安排复诊。'
          },
          {
            id: 'opt2',
            text: '哎呀，让您受罪了！补完牙后轻微疼痛是正常的，但咬合不对的话需要回来调一下，很快的，5分钟就能搞定。我看明天下午还有号，您这个点来可以吗？我帮您预留好。',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：先表达关心→解释"正常"安抚→说明解决方案（5分钟搞定降低心理负担）→主动预约，流程清晰又温暖。'
          },
          {
            id: 'opt3',
            text: '疼是正常的，过几天就好了。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 轻率敷衍：忽视患者的不适，也没有给出明确的判断标准，万一真有问题会延误。'
          }
        ]
      },
      {
        id: 'q3',
        patientQuestion: '挺好的，没什么问题。',
        options: [
          {
            id: 'opt1',
            text: '好的没问题，那没事了，再见。',
            isCorrect: false,
            type: 'bad',
            feedback: '❌ 错失机会：回访的目的不仅仅是问"有没有问题"，更是维护关系、创造复购的机会，这么快结束太可惜了。'
          },
          {
            id: 'opt2',
            text: '太好了！听到您这么说我就放心了~对了，您的下一次定期洁牙是3个月后，我已经帮您约在了9月15号下午2点，到时候提前一天再给您发消息提醒。您身边要是有家人朋友需要看牙，也欢迎介绍过来呀😉',
            isCorrect: true,
            type: 'good',
            feedback: '✅ 最佳回复：分享喜悦→主动预约下次（锁定复购）→顺便请转介绍（创造新客），一举三得，把回访变成客户运营的机会。'
          },
          {
            id: 'opt3',
            text: '那记得半年后复查啊。',
            isCorrect: false,
            type: 'neutral',
            feedback: '⚠️ 提醒了复查，但没有主动预约，患者大概率会忘记，效果打折扣。'
          }
        ]
      }
    ]
  }
]

export function getSceneById(id: string): Scene | undefined {
  return scenesData.find(scene => scene.id === id)
}
