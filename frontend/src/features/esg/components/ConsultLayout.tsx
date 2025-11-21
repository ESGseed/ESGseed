"use client";

import { useEsgStore } from '@/store';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { ChecklistSidebar } from './ChecklistSidebar';
import { ChatInterface } from './ChatInterface';
import { PreviewPanel } from './PreviewPanel';
import { ReportView } from './ReportView';
import { FloatingHelpButton } from './FloatingHelpButton';

export function ConsultLayout() {
  // Selectors for better performance
  const activeTab = useEsgStore((state) => state.activeTab);
  const setActiveTab = useEsgStore((state) => state.setActiveTab);
  const messages = useEsgStore((state) => state.messages);
  const inputText = useEsgStore((state) => state.inputText);
  const setInputText = useEsgStore((state) => state.setInputText);
  const sendMessage = useEsgStore((state) => state.sendMessage);
  const checklistItems = useEsgStore((state) => state.checklistItems);
  const previewCards = useEsgStore((state) => state.previewCards);
  const reportSections = useEsgStore((state) => state.reportSections);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'consultation' ? (
          <>
            <ChecklistSidebar items={checklistItems} />
            <ChatInterface
              messages={messages}
              inputValue={inputText}
              onInputChange={setInputText}
              onSendMessage={sendMessage}
            />
            <PreviewPanel cards={previewCards} />
          </>
        ) : (
          <ReportView sections={reportSections} />
        )}
      </main>

      <FloatingHelpButton />
    </div>
  );
}

