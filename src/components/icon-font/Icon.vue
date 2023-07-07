<script setup lang="ts">
import '@/assets/iconfont/iconfont'
import { computed } from 'vue';

const props = defineProps({
  'type': String,
  'name': String,
  'otherClass': String
})

let iconName = computed(() => {
  return `#icon-${props.name}`;
})

</script>

<template>
  <svg class="icon" :class="otherClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  line-height: 0;
}
</style>
