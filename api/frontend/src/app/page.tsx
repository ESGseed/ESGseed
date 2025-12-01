"use client";

import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { HomePage } from "@/components/HomePage";
import { CompanyInfoPage } from "@/components/CompanyInfoPage";
import { ContentGenerationPage } from "@/components/ContentGenerationPage";
import { ChartsPage } from "@/components/ChartsPage";
import { FinalReportPage } from "@/components/FinalReportPage";
import { LoginPage } from "@/components/LoginPage";

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // sessionStorage에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('사용자 정보 파싱 실패:', e);
      }
    }
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'company':
        return <CompanyInfoPage />;
      case 'content':
        return <ContentGenerationPage />;
      case 'charts':
        return <ChartsPage />;
      case 'report':
        return <FinalReportPage />;
      case 'login':
        return <LoginPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={user} />
          <main>
            {renderPage()}
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}