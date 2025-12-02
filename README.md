# 安装依赖

npm install

## 源码说明

如果缓存图片时无需清空已有图片，需要在 electron/main.ts 中删除：

<img width="551" height="274" alt="image" src="https://github.com/user-attachments/assets/e96d568f-f6d6-441b-a74c-bc8bf614552e" />

在 electron/preload.ts 中删除：

<img width="685" height="126" alt="image" src="https://github.com/user-attachments/assets/9411c3b7-ba6a-4fe8-b4cd-58358424829a" />

在 App.vue 中取消使用：

<img width="272" height="51" alt="image" src="https://github.com/user-attachments/assets/a405a5bb-7fe3-4734-9f4f-708167d1f197" />

如果想修改本地缓存目录：

<img width="852" height="72" alt="image" src="https://github.com/user-attachments/assets/1c79c541-98b1-4ff3-9a4f-13a9823f2985" />
