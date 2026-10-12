export default defineAppConfig({
  lazyCodeLoading: 'requiredComponents',
  pages: [
    'pages/home/index',
    'pages/create/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/edit/index',
    'pages/search/index',
    'pages/category-manage/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#fff8f3',
    navigationBarTitleText: '我的厨房',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9b8e85',
    selectedColor: '#ff6b35',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '菜谱',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-selected.png'
      },
      {
        pagePath: 'pages/create/index',
        text: '新增',
        iconPath: 'assets/tabbar/create.png',
        selectedIconPath: 'assets/tabbar/create-selected.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine-selected.png'
      }
    ]
  }
})
