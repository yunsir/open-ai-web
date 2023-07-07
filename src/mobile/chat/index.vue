<script setup lang="ts">
import { NInput, NScrollbar, NAvatar } from 'naive-ui';
import { parseTime } from '@/utils/Date';
import Waiting from '@/components/Waiting';
import { md } from '@/utils/Markdown';
import { nextTick, onMounted, ref, watch } from 'vue';
import store from '@/store';
import emitter from '@/utils/Emitter';

let scroll_bar = ref()

let messages: any = ref([])

let max_width = ref(0)
onMounted(() => {
    nextTick(() => {
        let body: any = document.querySelector(".dialogue .n-scrollbar-content")
        if(body)
        scroll_bar.value.scrollBy(0, body.scrollHeight)

        let chat:any = document.querySelector(".chat")
        max_width.value = chat.scrollWidth - 36
    })
})
watch(() => messages.value, (value) => {
    nextTick(() => {
        let body: any = document.querySelector(".dialogue .n-scrollbar-content")
        if(body)scroll_bar.value.scrollBy(0, body.scrollHeight)
    })
}, { deep: true })

let question: any = ref()
let diable_input = ref(false)
const decoder = new TextDecoder("utf-8");
async function handleQuestion() {
    try {
        diable_input.value = true
        let content = question.value.trim()
        if(!content) return
        question.value = null

        messages.value.push({ role: 'user', content: content, date: parseTime(new Date(), '{y}/{m}/{d} {h}:{i}:{s}') })
        messages.value.push({ role: 'assistant', content: '', date: parseTime(new Date(), '{y}/{m}/{d} {h}:{i}:{s}') })
        let resp: any = await fetch(`http://localhost:8080/chat/completions/stream`, {
            method: 'post',
            headers: { "Content-Type": "application/json", "Authorization": 'Bearer ' + store.state.token },
            body: JSON.stringify({ content })
        })

        if (resp.ok && resp.body) {
            const reader = resp.body.getReader();
            await readStream(reader)
        } else {

        }
    } catch (e) {

    } finally {
        diable_input.value = false
        emitter.emit('finished')
    }
}
async function readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedText = decoder.decode(value, { stream: true });

        if (decodedText && decodedText.length > 0) {

            let reg = /({.*})/g
            let temp
            while (temp = reg.exec(decodedText)) {
                if (!temp || !temp[1]) {
                    continue;
                }
                let result = JSON.parse(temp[1])
                if (result.return_code === 'success') {
                    let { content, created, error } = result.data
                    if (error) {

                    } else {

                    }
                    setLastMessage(content, created)
                } else {
                    setLastMessage(result.return_msg, new Date().getTime())
                }
            }
        }
    }
}

function setLastMessage(msg: any, date: any) {
    if (!msg) return
    let last = messages.value[messages.value.length - 1]
    last.content += msg

    last.date = parseTime(new Date(Number(date)), '{y}/{m}/{d} {h}:{i}:{s}')
}

</script>

<template>
    <div class="chat">
        <n-scrollbar class="dialogue" style="max-height: 100%;" ref="scroll_bar">
            <template v-for="item in messages">
                <div :class="['row', item.role === 'user' ? 'reverse' : '']">
                    <div class="left">
                        <icon v-if="item.role !== 'user'" name="chatgpt" style="font-size:28px"></icon>
                        <n-avatar v-else round size="small"
                            src="https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg" />
                    </div>
                    <div class="right" :style="[max_width?{maxWidth: max_width + 'px'}:{}]">
                        <div class="date">{{ item.date }}</div>
                        <div class="content">
                            <div class="markdown-body" v-if="item.content" v-html="md.render(item.content)"></div>
                            <waiting v-else />
                        </div>

                    </div>
                </div>
            </template>
        </n-scrollbar>
        <div class="question">
            <div class="input">
                <n-input v-model:value="question" type="textarea" placeholder="请输入命令" :autosize="{
                    minRows: 1
                }" @keydown.enter.prevent="() => false" @keyup.enter.prevent="handleQuestion" :disabled="diable_input">
                    <template #suffix>
                        <icon name="fasong" style="color: green;font-size: 1rem;"></icon>
                    </template>

                </n-input>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.markdown-body {
    background-color: transparent;
    font-size: 14px;
    pre {
        font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
            "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB",
            "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN",
            "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti",
            SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    }
}

.chat {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    margin: auto;
    width: 100%;
    max-width: 1280px;

    .dialogue {
        flex: 1;
        width: 100%;

        .row.reverse {
            flex-direction: row-reverse;

            .left {
                margin-left: 0.5rem;
                margin-right: 0;
            }

            .right {
                .date {
                    text-align: right;
                }
            }
        }

        .row {
            display: flex;

            .left {
                margin-right: 0.5rem;
            }

            .right {
                .date {
                    color: rgb(180 187 196);
                    font-size: 0.75rem;
                    line-height: 1rem;
                }

                .content {
                    margin-top: 10px;
                    background-color: rgb(244 246 248);
                    padding: 0.75rem;
                    border-radius: 0.375rem;
                }
            }

            margin-bottom: 15px;
        }
    }

    .question {
        width: 100%;
        margin-top: 10px;

        .input {
            margin: auto;
        }

        :deep(.n-input) {
            padding: 1rem;
            border-radius: .75rem;
            box-shadow: 0 0 transparent, 0 0 transparent, 0 0 15px rgba(0, 0, 0, .1);
            --n-border-hover: none !important;
            --n-border-focus: none !important;
            --n-caret-color: none !important;
            --n-box-shadow-focus: none !important;
            --n-text-decoration-color: none !important;
            //--n-border: 1px solid rgba(0, 0, 0, 0.1);
            --n-border: none !important;
            --n-font-size: 1rem !important;
            --n-border-disabled: none !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;

            textarea {
                font-size: 14px;
                line-height: 1.5rem !important;
            }

            .n-input__placeholder {
                font-size: 14px;
            }

        }
    }
}

:deep(.n-input) {
    --n-height: 24px !important;
}
</style>