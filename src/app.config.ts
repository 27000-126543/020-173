export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/practice/index',
    'pages/quiz/index',
    'pages/mine/index',
    'pages/scene-detail/index',
    'pages/read-detail/index',
    'pages/quiz-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2CB67D',
    navigationBarTitleText: '话术练习',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2CB67D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '场景练习'
      },
      {
        pagePath: 'pages/practice/index',
        text: '跟读卡片'
      },
      {
        pagePath: 'pages/quiz/index',
        text: '班前测验'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
