<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

let waiting = ref()
let interval: any = null
onMounted(() => {
    let flicker: any = false
    interval = setInterval(() => {
        waiting.value.innerHTML = flicker ? "|" : '&nbsp;'
        flicker = !flicker
    }, 600)
})

onUnmounted(() => {
    if (interval != null) {
        clearInterval(interval)
    }
})

</script>

<template>
    <div class="waiting" ref="waiting">|</div>
</template>

<style lang="scss" scoped></style>