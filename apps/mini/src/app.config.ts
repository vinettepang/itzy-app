export default {
  pages: [
    'pages/gallery/index',
    'pages/gallery/detail/index',
    'pages/schedules/index',
    'pages/poster/index',
    'pages/poster/preview/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#111',
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'white',
  },
  permission: {
    'scope.writePhotosAlbum': {
      desc: '用于将生成的图片保存到你的相册',
    },
  },
};
