/// <reference types="@tarojs/taro" />

declare const TARO_APP_API: string;

declare module '*.png' {
  const src: string;
  export default src;
}
