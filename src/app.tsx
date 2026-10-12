import { useEffect } from 'react';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
// 全局样式
import './app.scss';

function App(props) {
  useEffect(() => {
    // 初始化云开发（仅微信小程序）
    // 将 env 替换为你自己的云开发环境 ID（在微信开发者工具「云开发」控制台中获取）
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({ env: process.env.TARO_APP_CLOUD_ENV as string, traceUser: true });
    }
  }, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
