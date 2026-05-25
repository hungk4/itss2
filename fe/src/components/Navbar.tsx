import { BookOpen, BarChart3, Brain, FileQuestion } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: "dashboard", label: "Trang chủ", icon: BarChart3 },
    { id: "flashcards", label: "Flashcard", icon: BookOpen },
    { id: "study", label: "Ôn tập", icon: Brain },
    { id: "quiz", label: "Quiz", icon: FileQuestion },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-sm">
          <Brain className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gradient">AuraCards</span>
      </div>

      <div className="flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/80 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
