import { Edit3, Trash2, Calendar, Award } from "lucide-react";

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
  reviewCount: number;
  nextReviewAt: string;
}

interface FlashcardItemProps {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

export default function FlashcardItem({ card, onEdit, onDelete }: FlashcardItemProps) {
  const getMasteryBadge = (level: number) => {
    const badges = [
      { text: "Mới tạo", bg: "bg-slate-100 text-slate-600 border border-slate-200" },
      { text: "Cấp độ 1", bg: "bg-rose-50 text-rose-600 border border-rose-100" },
      { text: "Cấp độ 2", bg: "bg-amber-50 text-amber-600 border border-amber-100" },
      { text: "Cấp độ 3", bg: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
      { text: "Cấp độ 4", bg: "bg-blue-50 text-blue-600 border border-blue-100" },
      { text: "Thuộc lòng", bg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    ];
    return badges[level] || badges[0];
  };

  const badge = getMasteryBadge(card.masteryLevel);
  const formattedDate = new Date(card.nextReviewAt).toLocaleDateString("vi-VN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between shadow-sm relative overflow-hidden group">
      {/* Background glow hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg}`}>
                {badge.text}
              </span>
              {card.jlptLevel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  {card.jlptLevel}
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-2 pt-1">
              <h3 className="text-2xl font-bold text-slate-800 tracking-wide">{card.vocabulary}</h3>
              {card.partOfSpeech && (
                <span className="text-xs text-slate-500 font-medium italic">({card.partOfSpeech})</span>
              )}
            </div>
            {card.reading && (
              <p className="text-sm text-indigo-600 font-medium">/{card.reading}/</p>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onEdit(card)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
              title="Chỉnh sửa"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-800">{card.meaning}</p>
          {card.exampleSentence && (
            <div className="mt-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <p className="text-slate-700 font-medium leading-relaxed">{card.exampleSentence}</p>
              {card.exampleTranslation && (
                <p className="text-slate-500 mt-1 italic leading-relaxed">{card.exampleTranslation}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 relative z-10 font-medium">
        <div className="flex items-center space-x-1.5">
          <Award className="h-3.5 w-3.5 text-slate-400" />
          <span>Đã ôn {card.reviewCount} lần</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Lịch ôn: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
