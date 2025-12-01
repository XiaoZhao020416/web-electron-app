<template>
  <div class="wrapper">
    <div class="content" :style="scaleStyle">
      <transition name="slide">
        <img :key="images[currentIndex]" :src="images[currentIndex]" class="img" alt="" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

const images = ref([]);
const currentIndex = ref(0);
const timer = ref(null);

const nextPage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
};

const designWidth = 1080;
const designHeight = 1920;
const scale = ref(1);

const updateScale = () => {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  scale.value = Math.min(ww / designWidth, wh / designHeight);
};

const scaleStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}));

async function postData() {
  let isSuccess = false;

  try {
    let isRequest = true; // 模拟当前是否可以请求到接口的参数：true表示可以请求（用于写入缓存），false表示不能请求（用于读取缓存）
    // 接口请求
    // const res = await fetch('/art/api/get_img_list', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ page: 0 })
    // });

    if(isRequest) {
      isSuccess = true;
      console.log('POST 成功，已缓存图片');
      const imageUrls = [
        'https://asset/4.jpg',
        'https://asset/5.jpg',
        'https://asset/6.jpg'
      ];

      images.value = imageUrls;

      await window.cacheApi.clear();
      await window.cacheApi.saveImages(imageUrls);
    } else {
      console.log('POST 失败');
    }
  } catch (err) {
    console.log('POST 失败', err);
  }

  if (!isSuccess) {
    console.log("→ 使用本地缓存图片");
    const cachedList = await window.cacheApi.getImages();

    if (cachedList.length) {
      console.log('cachedList:', cachedList)
      images.value = cachedList.map(p => `file://${p}`);
    } else {
      console.log("缓存中无图片");
    }
  }

  updateScale();
  window.addEventListener("resize", updateScale);
  timer.value = setInterval(nextPage, 5000);
}

onMounted(() => {
  postData()
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  window.removeEventListener("resize", updateScale);
});
</script>

<style scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.content {
  aspect-ratio: 1080 / 1920;
  width: 1080px;
  overflow: hidden;
  position: relative;
  transform-origin: center center;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0%);
  opacity: 1;
}
.slide-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.6s ease;
}
</style>
