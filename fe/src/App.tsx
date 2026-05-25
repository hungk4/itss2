import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FlashcardsList from "./pages/FlashcardsList";
import StudySession from "./pages/StudySession";
import QuizSession from "./pages/QuizSession";

const API_BASE_URL = "http://localhost:5000";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "dashboard" && (
          <Dashboard
            apiBaseUrl={API_BASE_URL}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "flashcards" && (
          <FlashcardsList apiBaseUrl={API_BASE_URL} />
        )}
        {activeTab === "study" && (
          <StudySession
            apiBaseUrl={API_BASE_URL}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "quiz" && (
          <QuizSession
            apiBaseUrl={API_BASE_URL}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p>&copy; {new Date().getFullYear()} AuraCards. MVP Developed with pride using Antigravity AI.</p>
      </footer>
    </div>
  );
}
