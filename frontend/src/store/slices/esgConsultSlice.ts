import { StateCreator } from 'zustand';
import { EsgConsultStore } from '../types';
import type { ChatMessage } from '@/lib/data/esg';
import { 
  CHECKLIST_ITEMS, 
  PREVIEW_CARDS, 
  FINAL_REPORT_CONTENT, 
  CHAT_HISTORY_MOCK 
} from '@/lib/data/esg';

export const createEsgConsultSlice: StateCreator<EsgConsultStore> = (set, get) => ({
  // Initial State
  activeTab: 'consultation',
  inputText: '',
  messages: CHAT_HISTORY_MOCK,
  checklistItems: CHECKLIST_ITEMS,
  previewCards: PREVIEW_CARDS,
  reportSections: FINAL_REPORT_CONTENT,

  // Tab Actions
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // Input Actions
  setInputText: (text) => {
    set({ inputText: text });
  },

  // Message Actions
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: () => {
    const { inputText } = get();
    
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      type: 'message',
    };

    // Add user message
    set((state) => ({
      messages: [...state.messages, newMessage],
      inputText: '',
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '입력하신 정보를 바탕으로 S2-15 항목을 업데이트하겠습니다.',
        type: 'message',
      };
      
      set((state) => ({
        messages: [...state.messages, aiMessage],
      }));
    }, 1000);
  },

  resetChat: () => {
    set({
      messages: CHAT_HISTORY_MOCK,
      inputText: '',
    });
  },

  // Data Actions
  updateChecklistItem: (id, status) => {
    set((state) => ({
      checklistItems: state.checklistItems.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  },

  updatePreviewCard: (id, card) => {
    set((state) => ({
      previewCards: state.previewCards.map((c) =>
        c.id === id ? { ...c, ...card } : c
      ),
    }));
  },
});

