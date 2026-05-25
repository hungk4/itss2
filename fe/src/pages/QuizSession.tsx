import { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, ChevronRight, CheckCircle2, XCircle, RefreshCw, HelpCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface QuizSessionProps {
  apiBaseUrl: string;
  setActiveTab: (tab: string) => void;
}

export default function QuizSession({ apiBaseUrl, setActiveTab }: QuizSessionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoring, setScoring] = useState({ score: 0, accuracy: 0, correct: 0 });

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    setIsSubmitted(false);
    setAnswers({});
    setCurrentIndex(0);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/study/quiz`);
      setQuestions(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        "Không thể tạo Quiz. Bạn cần có ít nhất 2 flashcard trong thư viện!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [apiBaseUrl]);

  const selectAnswer = (ans: string) => {
    setAnswers({
      ...answers,
      [currentIndex]: ans
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const normalizeVietnamese = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?!"']/g, "")
      .trim();
  };

  const evaluateAnswer = (userAns: string, correctAns: string): boolean => {
    const normUser = normalizeVietnamese(userAns);
    if (!normUser) return false;

    const options = correctAns
      .split(/[,\/;|\n]+/)
      .map(opt => normalizeVietnamese(opt))
      .filter(opt => opt.length > 0);

    for (const opt of options) {
      if (normUser === opt) return true;
      if (opt.includes(normUser) && normUser.length >= 2) return true;
      if (normUser.includes(opt) && opt.length >= 2) return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    
    const results = questions.map((q, idx) => {
      const userAns = answers[idx] || "";
      const isCorrect = evaluateAnswer(userAns, q.correctAnswer);
      if (isCorrect) correctCount++;
      return {
        flashcardId: q.id,
        isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const accuracy = Math.round((correctCount / questions.length) * 100);
    setScoring({ score, accuracy, correct: correctCount });
    setIsSubmitted(true);

    try {
      for (const res of results) {
        await axios.post(
          `${apiBaseUrl}/api/study/review`,
          { flashcardId: res.flashcardId, isCorrect: res.isCorrect }
        );
      }
    } catch (err) {
      console.error("Failed to submit study reviews in background", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Đang khởi tạo bộ câu hỏi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6 bg-slate-50">
        <div className="inline-flex bg-indigo-50 p-5 rounded-full text-indigo-600 border border-indigo-100 shadow-sm">
          <HelpCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Chưa thể làm Quiz</h2>
          <p className="text-slate-500 text-xs leading-relaxed">{error}</p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => setActiveTab("flashcards")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-1.5 mx-auto"
          >
            <span>Tới thư viện để tạo thẻ</span>
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-8 bg-slate-50">
        {/* Score Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-5 relative overflow-hidden">
          <div className="inline-flex bg-amber-50 p-4 rounded-2xl text-amber-600 border border-amber-100 shadow-sm">
            <Trophy className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-800">Kết quả kiểm tra</h2>
            <p className="text-slate-500 text-sm">Điểm số và dữ liệu ôn tập đã đồng bộ vào lịch sử học.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Điểm số
              </span>
              <span className="text-2xl font-black text-indigo-600">{scoring.score} / 100</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Đúng / Tổng số
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {scoring.correct} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-800">Chi tiết đáp án</h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = answers[idx] || "Chưa trả lời";
              const isCorrect = evaluateAnswer(userAns, q.correctAnswer);
              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-800">
                      Câu {idx + 1}: {q.question}
                    </p>
                    <p className="text-xs text-slate-500">
                      Đáp án của bạn: <span className={isCorrect ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>{userAns}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-indigo-600">
                        Đáp án đúng: <span className="font-semibold">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition"
          >
            Về Trang chủ
          </button>
          <button
            onClick={fetchQuiz}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center space-x-2 transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm bài Test mới</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const userSelected = answers[currentIndex] || "";

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 bg-slate-50">
      {/* Quiz Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold uppercase tracking-wider text-indigo-600">
          Bài kiểm tra từ vựng
        </span>
        <span className="font-bold">
          Câu {currentIndex + 1} / {questions.length}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
        />
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
        <div className="space-y-2">
          <span className="text-[10px] text-indigo-600 uppercase tracking-widest font-bold block">
            Câu hỏi {currentQ.type === "multiple-choice" ? "Trắc nghiệm" : currentQ.type === "true-false" ? "Đúng / Sai" : "Tự luận ngắn"}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide leading-relaxed">
            {currentQ.question}
          </h2>
        </div>

        {/* Dynamic Inputs depending on type */}
        {currentQ.type === "multiple-choice" && currentQ.options && (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userSelected === opt;
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(opt)}
                  className={`w-full p-4 text-left rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <span className="inline-block w-6 h-6 mr-3 text-center leading-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === "true-false" && currentQ.options && (
          <div className="grid grid-cols-2 gap-4">
            {currentQ.options.map((opt) => {
              const isSelected = userSelected === opt;
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  className={`py-4 text-center rounded-xl text-sm font-bold border transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === "short-answer" && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
              Nhập đáp án của bạn
            </label>
            <input
              type="text"
              value={userSelected}
              onChange={(e) => selectAnswer(e.target.value)}
              placeholder="Gõ nghĩa tiếng Việt tại đây..."
              className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-sm"
        >
          Câu trước
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-[0.99]"
          >
            <span>Nộp bài</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center justify-center space-x-1 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>Tiếp theo</span>
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
