import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, X } from "lucide-react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FlashcardsList from "./pages/FlashcardsList";
import StudySession from "./pages/StudySession";
import QuizSession from "./pages/QuizSession";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [dueCount, setDueCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [hasNotified, setHasNotified] = useState<boolean>(false);

  const fetchDueCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/study/dashboard`);
      const count = res.data.dueCards;
      setDueCount(count);
      // Only show the toast once per session when there are due cards
      if (count > 0 && !hasNotified) {
        setShowToast(true);
        setHasNotified(true);
      }
    } catch (err) {
      console.error("Failed to fetch due cards count", err);
    }
  };

  useEffect(() => {
    fetchDueCount();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueCount={dueCount}
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

      {showToast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex items-start space-x-3 transition-all duration-300 transform translate-y-0">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0">
            <Bell className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-bold text-sm text-slate-800">Đến giờ ôn tập tiếng Nhật</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có <span className="font-bold text-indigo-600">{dueCount} từ</span> cần ôn tập hôm nay để duy trì trí nhớ.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  setActiveTab("study");
                  setShowToast(false);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                Ôn tập ngay
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-50 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
