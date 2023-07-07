<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN, NMessageProvider, NDialogProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-dialog-provider>
      <n-message-provider>
        <router-view></router-view>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped></style>
