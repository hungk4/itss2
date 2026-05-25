import { useState, useEffect } from "react";
import axios from "axios";
import { Brain, Check, X, RotateCw, Sparkles, Smile, ArrowRight } from "lucide-react";

interface Flashcard {
  id: string;
  vocabulary: string;
  meaning: string;
  reading?: string | null;
  partOfSpeech?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  jlptLevel?: string | null;
  masteryLevel: number;
}

interface StudySessionProps {
  apiBaseUrl: string;
  setActiveTab: (tab: string) => void;
}

export default function StudySession({ apiBaseUrl, setActiveTab }: StudySessionProps) {
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/study/review-queue`);
      setQueue(res.data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Failed to load review queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [apiBaseUrl]);

  const handleReview = async (isCorrect: boolean) => {
    const card = queue[currentIndex];
    try {
      await axios.post(
        `${apiBaseUrl}/api/study/review`,
        { flashcardId: card.id, isCorrect }
      );
      
      setReviewedCount(prev => prev + 1);
      
      if (currentIndex < queue.length - 1) {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 150);
      } else {
        setQueue([]);
      }
    } catch (err) {
      alert("Đăng ký ôn tập thất bại, vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Đang tải lịch trình ôn tập...</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6 bg-slate-50">
        <div className="inline-flex bg-emerald-50 p-5 rounded-full text-emerald-600 shadow-sm border border-emerald-100">
          <Smile className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Tuyệt vời! Bạn đã hoàn thành!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Hiện tại không có từ nào đến lịch ôn tập. Trí não của bạn đang trong trạng thái ghi nhớ rất tốt.
          </p>
          {reviewedCount > 0 && (
            <p className="text-xs text-indigo-600 font-semibold">
              Bạn vừa hoàn thành xuất sắc {reviewedCount} thẻ từ vựng trong phiên này!
            </p>
          )}
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <span>Học thêm từ mới</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentCard = queue[currentIndex];
  const progressPercent = Math.round(((currentIndex) / queue.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 bg-slate-50">
      {/* Session progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-indigo-600">
            Tiến độ phiên học
          </span>
          <span className="font-bold">
            {currentIndex + 1} / {queue.length} từ
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="w-full h-80 sm:h-96 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between backface-hidden glow-card">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1">
                <Brain className="h-3.5 w-3.5" />
                <span>Mặt trước - Nhớ từ</span>
              </span>
              <div className="flex items-center space-x-1.5">
                {currentCard.jlptLevel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                    {currentCard.jlptLevel}
                  </span>
                )}
                <span className="font-medium">Nhấn để xem nghĩa</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-wide text-slate-800">
                {currentCard.vocabulary}
              </h2>
              {currentCard.reading && (
                <p className="text-xl text-indigo-600 font-semibold">/{currentCard.reading}/</p>
              )}
              {currentCard.partOfSpeech && (
                <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-full text-xs font-semibold italic">
                  {currentCard.partOfSpeech}
                </span>
              )}
            </div>

            <div className="flex justify-center text-slate-400 text-xs font-semibold">
              <RotateCw className="h-4 w-4 mr-1.5 animate-spin" style={{ animationDuration: "5s" }} />
              <span>Chạm để lật thẻ</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between backface-hidden rotate-y-180 glow-card">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Mặt sau - Nghĩa từ</span>
              </span>
              <span className="font-medium">Bạn đã thuộc chưa?</span>
            </div>

            <div className="text-center space-y-5 my-auto">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                  Định nghĩa
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                  {currentCard.meaning}
                </p>
              </div>

              {currentCard.exampleSentence && (
                <div className="max-w-md mx-auto pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                    Ví dụ minh họa
                  </span>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-xs text-slate-500 italic mt-0.5 leading-relaxed">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center text-slate-400 text-xs font-semibold">
              <span>Chạm để lật lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-3">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm transition-all"
          >
            <RotateCw className="h-4.5 w-4.5" />
            <span>Lật thẻ xem nghĩa</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleReview(false)}
              className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold transition-all"
            >
              <X className="h-5 w-5" />
              <span>Chưa thuộc (Sai)</span>
            </button>
            <button
              onClick={() => handleReview(true)}
              className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-xl font-bold transition-all"
            >
              <Check className="h-5 w-5" />
              <span>Đã thuộc (Đúng)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
