import type { ChatMessage, ChecklistItem, PreviewCard, ReportSection } from '@/lib/data/esg';

export type TabType = 'consultation' | 'report';

export interface EsgConsultState {
    // UI State
    activeTab: TabType;
    inputText: string;

    // Data State
    messages: ChatMessage[];
    checklistItems: ChecklistItem[];
    previewCards: PreviewCard[];
    reportSections: ReportSection[];
}

export interface EsgConsultActions {
    // Tab Actions
    setActiveTab: (tab: TabType) => void;

    // Input Actions
    setInputText: (text: string) => void;

    // Message Actions
    addMessage: (message: ChatMessage) => void;
    sendMessage: () => void;
    resetChat: () => void;

    // Data Actions
    updateChecklistItem: (id: string, status: ChecklistItem['status']) => void;
    updatePreviewCard: (id: string, card: Partial<PreviewCard>) => void;
}

export type EsgConsultStore = EsgConsultState & EsgConsultActions;

