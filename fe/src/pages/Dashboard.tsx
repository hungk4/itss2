import { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Brain, CheckCircle, Percent, ArrowRight, Activity, Calendar } from "lucide-react";

interface DashboardProps {
  apiBaseUrl: string;
  setActiveTab: (tab: string) => void;
}

interface DashboardData {
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  totalReviews: number;
  accuracy: number;
  chartData: Array<{ date: string; count: number; correct: number }>;
}

export default function Dashboard({ apiBaseUrl, setActiveTab }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/study/dashboard`);
        setData(res.data);
      } catch (err) {
        setError("Không thể tải thông tin thống kê học tập.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 p-6 max-w-lg mx-auto shadow-sm">
        <p className="text-rose-600 font-medium">{error || "Đã xảy ra lỗi"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const masteredPercentage = data.totalCards > 0 ? Math.round((data.masteredCards / data.totalCards) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6 bg-slate-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Chào mừng trở lại!</h1>
        <p className="text-slate-500 text-sm">Dưới đây là tổng quan về lộ trình ôn luyện từ vựng của bạn.</p>
      </div>

      {/* Reminder Banner */}
      {data.dueCards > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-700 shrink-0">
              <Brain className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">🔔 Từ cần ôn hôm nay</h4>
              <p className="text-xs text-slate-600">Bạn đang có <span className="font-bold text-amber-700">{data.dueCards} từ vựng</span> đến hạn ôn tập. Hãy dành ít phút ôn tập ngay để củng cố kiến thức nhé!</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("study")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-[0.98] shrink-0"
          >
            Ôn tập ngay
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">🎉 Tuyệt vời! Không có từ cần ôn hôm nay</h4>
            <p className="text-xs text-slate-600">Bạn đã hoàn thành tất cả các thẻ đến lịch ôn tập. Hãy giữ vững phong độ nhé!</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Từ đã học</span>
            <p className="text-3xl font-extrabold text-slate-900">{data.totalCards}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Từ cần ôn</span>
            <p className="text-3xl font-extrabold text-amber-600">{data.dueCards}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <Brain className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã thuộc</span>
            <p className="text-3xl font-extrabold text-emerald-600">{data.masteredCards}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Độ ghi nhớ</span>
            <p className="text-3xl font-extrabold text-pink-600">{data.accuracy}%</p>
          </div>
          <div className="bg-pink-50 p-3 rounded-xl text-pink-600">
            <Percent className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              <h2 className="font-bold text-lg text-slate-800">Thống kê ôn tập 7 ngày qua</h2>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Gần đây nhất</span>
            </div>
          </div>

          {/* Simple Custom Bar Chart using CSS */}
          <div className="flex items-end justify-between h-48 px-2 pt-4 relative">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-0 border-t border-slate-100" />
            <div className="absolute inset-x-0 top-1/3 border-t border-slate-100" />
            <div className="absolute inset-x-0 top-2/3 border-t border-slate-100" />
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-100" />

            {data.chartData.map((day, idx) => {
              const maxCount = Math.max(...data.chartData.map(d => d.count), 5);
              const heightPercent = Math.round((day.count / maxCount) * 100);
              const formattedDate = day.date.slice(5).replace("-", "/");

              return (
                <div key={idx} className="flex flex-col items-center flex-1 group z-10">
                  <div className="relative w-7 sm:w-10 bg-slate-50 rounded-t-lg h-36 flex items-end overflow-hidden border border-slate-100">
                    {/* Correct reviews bar (indigo) */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-md relative transition-all duration-150 group-hover:brightness-95"
                    >
                      {day.count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-2">{formattedDate}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
              <span className="text-slate-500">Số lượt ôn tập từ vựng</span>
            </div>
            <span className="text-slate-400 font-medium">Mức độ hoạt động: {data.totalReviews} lượt ôn</span>
          </div>
        </div>

        {/* Dashboard Actions Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-bold text-lg text-slate-800 mb-2">Thực hành & Ôn luyện</h2>
            <p className="text-slate-500 text-xs leading-relaxed">Phát triển thói quen học tập hàng ngày giúp cải thiện trí nhớ lâu dài.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("study")}
              className="w-full flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3 text-left">
                <Brain className="h-5 w-5" />
                <div>
                  <p className="font-bold text-sm">Học Spaced Repetition</p>
                  <p className="text-[10px] text-indigo-100">
                    {data.dueCards > 0 ? `Có ${data.dueCards} từ đến lịch ôn tập` : "Tất cả từ đã được ôn tập"}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center space-x-3 text-left">
                <Percent className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-bold text-sm">Làm Quiz Từ Vựng</p>
                  <p className="text-[10px] text-slate-500">Sinh câu hỏi ngẫu nhiên từ thẻ của bạn</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Progress Circle */}
          <div className="pt-4 border-t border-slate-100 flex items-center space-x-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-indigo-600"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - masteredPercentage / 100)}
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-700">{masteredPercentage}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Tiến trình thuộc lòng</p>
              <p className="text-[10px] text-slate-500">Mục tiêu ghi nhớ mức độ 4 trở lên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
