import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X, Loader2, BookOpen, AlertCircle } from "lucide-react";
import FlashcardItem from "../components/FlashcardItem";

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

interface FlashcardsListProps {
  apiBaseUrl: string;
}

export default function FlashcardsList({ apiBaseUrl }: FlashcardsListProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Form states
  const [vocabulary, setVocabulary] = useState("");
  const [meaning, setMeaning] = useState("");
  const [reading, setReading] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("Danh từ");
  const [jlptLevel, setJlptLevel] = useState("N5");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCards = async (searchVal = "") => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/flashcards`, {
        params: { search: searchVal }
      });
      setCards(res.data);
    } catch (err) {
      setError("Không thể tải danh sách từ vựng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(search);
  }, [apiBaseUrl, search]);

  const openAddModal = () => {
    setEditingCard(null);
    setVocabulary("");
    setMeaning("");
    setReading("");
    setPartOfSpeech("Danh từ");
    setJlptLevel("N5");
    setExampleSentence("");
    setExampleTranslation("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setVocabulary(card.vocabulary);
    setMeaning(card.meaning);
    setReading(card.reading || "");
    setPartOfSpeech(card.partOfSpeech || "Danh từ");
    setJlptLevel(card.jlptLevel || "N5");
    setExampleSentence(card.exampleSentence || "");
    setExampleTranslation(card.exampleTranslation || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thẻ từ vựng này không?")) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/flashcards/${id}`);
      setCards(cards.filter(c => c.id !== id));
    } catch (err) {
      alert("Xóa thẻ thất bại. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabulary.trim() || !meaning.trim()) {
      setFormError("Từ vựng Nhật và Nghĩa tiếng Việt không được để trống!");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      vocabulary,
      meaning,
      reading: reading.trim() || null,
      partOfSpeech,
      jlptLevel,
      exampleSentence: exampleSentence.trim() || null,
      exampleTranslation: exampleTranslation.trim() || null
    };

    try {
      if (editingCard) {
        const res = await axios.put(`${apiBaseUrl}/api/flashcards/${editingCard.id}`, payload);
        setCards(cards.map(c => (c.id === editingCard.id ? res.data : c)));
      } else {
        const res = await axios.post(`${apiBaseUrl}/api/flashcards`, payload);
        setCards([res.data, ...cards]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Lưu thông tin thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 bg-slate-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Thư viện từ vựng</h1>
          <p className="text-slate-500 text-sm">Lưu trữ, chỉnh sửa và quản lý các flashcard từ vựng của bạn.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all active:scale-[0.99] self-start sm:self-auto font-semibold text-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Thêm từ mới</span>
        </button>
      </div>

      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm từ vựng Kanji, cách đọc Kana hoặc nghĩa tiếng Việt..."
          className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all text-sm"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start space-x-2.5 text-rose-600">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500">Đang tải danh sách thẻ...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold mb-1">Chưa có flashcard nào</p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
            Hãy bắt đầu tạo thẻ từ vựng đầu tiên của bạn để chuẩn bị cho lộ trình học tập!
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            Tạo Flashcard ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <FlashcardItem
              key={card.id}
              card={card}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden transform transition-all duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCard ? "Chỉnh sửa từ vựng" : "Tạo từ vựng mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start space-x-2 text-rose-600 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Từ vựng Nhật (Kanji/Kana) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vocabulary}
                    onChange={(e) => setVocabulary(e.target.value)}
                    placeholder="Ví dụ: 勝手"
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Cách đọc (Kana)
                  </label>
                  <input
                    type="text"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="Ví dụ: かって"
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Từ loại
                  </label>
                  <select
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="Danh từ">Danh từ</option>
                    <option value="Động từ nhóm 1">Động từ nhóm 1</option>
                    <option value="Động từ nhóm 2">Động từ nhóm 2</option>
                    <option value="Động từ nhóm 3">Động từ nhóm 3</option>
                    <option value="Tính từ đuôi い">Tính từ đuôi い</option>
                    <option value="Tính từ đuôi な">Tính từ đuôi な</option>
                    <option value="Trạng từ">Trạng từ</option>
                    <option value="Liên từ">Liên từ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Cấp độ JLPT
                  </label>
                  <select
                    value={jlptLevel}
                    onChange={(e) => setJlptLevel(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                    <option value="Chưa phân loại">Chưa phân loại</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Ý nghĩa / Định nghĩa (tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="Ví dụ: Tự ý, tùy tiện, ích kỷ"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Câu ví dụ (tiếng Nhật)
                  </label>
                  <textarea
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                    placeholder="Ví dụ: 勝手な行動をしてはいけません。"
                    rows={2}
                    className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Dịch câu ví dụ (tiếng Việt)
                  </label>
                  <textarea
                    value={exampleTranslation}
                    onChange={(e) => setExampleTranslation(e.target.value)}
                    placeholder="Ví dụ: Không được tự ý hành động."
                    rows={2}
                    className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-semibold flex items-center transition"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                  <span>{editingCard ? "Cập nhật" : "Tạo từ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
