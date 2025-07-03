<template>
  <div class="chat-container flex flex-col">
    <div class="flex-1 overflow-y-auto p-4">
      <ChatTextItem
        v-for="(message, index) in messages"
        :key="index"
        :type="message.type"
        :message="message.content"
      />
    </div>
    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Geben Sie Ihre Nachricht ein..."
          class="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ChatTextItem from './ChatTextItem.vue';

interface Message {
  type: 'user' | 'system';
  content: string;
}

// type UiActionText = {
//   type: 'render_text';
//   content: string;
// };

// type FunctionCallingResponseUiAction = UiActionText;

// interface AIChatResponse {
//   chatId: string;
//   reply: string;
//   uiResponse: FunctionCallingResponseUiAction;
// }

const messages = ref<Message[]>([
  { type: 'system', content: 'Welcome here. How can I help you today?' },
]);

const newMessage = ref('');

const sendMessage = async () => {
  if (newMessage.value.trim()) {
    messages.value.push({ type: 'user', content: newMessage.value });
    sendRequest(newMessage.value + '');
    newMessage.value = '';
  }
};

const sendRequest = async (_usersMessage: string) => {
  // const aiResult = await fetchWithToken.post<AIChatResponse>("/v1/ai/chat", {
  //   usersMessage,
  //   chatId: chatId.value,
  // });
  // messages.value.push({ type: "system", content: aiResult.reply });
  // if (aiResult.uiResponse) {
  //   messages.value.push({
  //     type: "system",
  //     content: aiResult.uiResponse.content,
  //   });
  // }
};

const chatId = ref('');
onMounted(async () => {
  // generate a random id for the chat
  chatId.value = Math.random().toString(36).substring(2, 15);
});
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 100px);
}
</style>
