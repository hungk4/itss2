import { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import prisma from "../database/db";

const router = Router();

const reviewSchema = z.object({
  flashcardId: z.string(),
  isCorrect: z.boolean()
});

// GET /api/study/review-queue - Get cards due for review
router.get("/review-queue", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const cards = await prisma.flashcard.findMany({
      where: {
        nextReviewAt: { lte: now }
      },
      orderBy: { nextReviewAt: "asc" }
    });
    return res.json(cards);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get review queue" });
  }
});

// POST /api/study/review - Log a review event (Spaced Repetition SM-2 logic)
router.post("/review", async (req: Request, res: Response) => {
  try {
    const { flashcardId, isCorrect } = reviewSchema.parse(req.body);
    const card = await prisma.flashcard.findFirst({
      where: { id: flashcardId }
    });
    if (!card) {
      return res.status(404).json({ error: "Flashcard not found" });
    }

    let nextMastery = card.masteryLevel;
    let nextReviewAt = new Date();

    if (isCorrect) {
      nextMastery = Math.min(5, nextMastery + 1);
      const intervals = [1, 3, 7, 14, 30];
      const days = intervals[nextMastery - 1] || 30;
      nextReviewAt.setDate(nextReviewAt.getDate() + days);
    } else {
      nextMastery = Math.max(1, nextMastery - 1);
      nextReviewAt.setHours(nextReviewAt.getHours() + 1);
    }

    const updatedCard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        reviewCount: card.reviewCount + 1,
        correctCount: card.correctCount + (isCorrect ? 1 : 0),
        wrongCount: card.wrongCount + (isCorrect ? 0 : 1),
        masteryLevel: nextMastery,
        nextReviewAt
      }
    });

    // Write to history log
    await prisma.learningHistory.create({
      data: {
        flashcardId,
        memoryLevel: nextMastery,
        score: isCorrect ? 100 : 0
      }
    });

    return res.json({
      message: "Review updated successfully",
      card: updatedCard
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid inputs", details: err.errors });
    }
    return res.status(500).json({ error: "Failed to record review" });
  }
});

// GET /api/study/quiz - Generate a dynamic quiz
router.get("/quiz", async (req: Request, res: Response) => {
  try {
    const allCards = await prisma.flashcard.findMany({});

    if (allCards.length < 2) {
      return res.status(400).json({
        error: "Bạn cần có ít nhất 2 thẻ từ vựng để tạo bài kiểm tra. Vui lòng thêm từ mới!"
      });
    }

    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    const quizCards = shuffled.slice(0, 5);

    const quizQuestions = quizCards.map((card, idx) => {
      const type = idx % 3;

      if (type === 0) {
        // Multiple Choice
        const correctOpt = card.meaning;
        const otherMeanings = allCards
          .filter(c => c.id !== card.id)
          .map(c => c.meaning);
        const shuffledDistractors = otherMeanings.sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctOpt, ...shuffledDistractors].sort(() => 0.5 - Math.random());

        while (options.length < 4) {
          options.push(`Định nghĩa thay thế ${options.length + 1}`);
        }

        return {
          id: card.id,
          type: "multiple-choice",
          question: `Từ 「${card.vocabulary}」 có nghĩa là gì?`,
          options,
          correctAnswer: correctOpt
        };
      } else if (type === 1) {
        // True/False
        const isTrue = Math.random() > 0.5;
        let testMeaning = card.meaning;
        if (!isTrue) {
          const otherCards = allCards.filter(c => c.id !== card.id);
          if (otherCards.length > 0) {
            testMeaning = otherCards[Math.floor(Math.random() * otherCards.length)].meaning;
          } else {
            testMeaning = "Nghĩa không chính xác";
          }
        }
        return {
          id: card.id,
          type: "true-false",
          question: `Từ 「${card.vocabulary}」 có nghĩa là 「${testMeaning}」, đúng hay sai?`,
          options: ["Đúng", "Sai"],
          correctAnswer: isTrue ? "Đúng" : "Sai"
        };
      } else {
        // Short Answer
        return {
          id: card.id,
          type: "short-answer",
          question: `Nhập nghĩa tiếng Việt của từ 「${card.vocabulary}」`,
          correctAnswer: card.meaning
        };
      }
    });

    return res.json(quizQuestions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// GET /api/study/dashboard - Load learning overview and progress analytics
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const totalCards = await prisma.flashcard.count({});
    const now = new Date();
    const dueCards = await prisma.flashcard.count({
      where: {
        nextReviewAt: { lte: now }
      }
    });

    const masteredCards = await prisma.flashcard.count({
      where: {
        masteryLevel: { gte: 4 }
      }
    });

    const cardsAgg = await prisma.flashcard.aggregate({
      _sum: {
        reviewCount: true,
        correctCount: true,
        wrongCount: true
      }
    });

    const totalReviews = cardsAgg._sum.reviewCount || 0;
    const totalCorrect = cardsAgg._sum.correctCount || 0;
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await prisma.learningHistory.findMany({
      where: {
        reviewTime: { gte: sevenDaysAgo }
      },
      orderBy: { reviewTime: "asc" }
    });

    const dailyStats: Record<string, { date: string; count: number; correct: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyStats[key] = { date: key, count: 0, correct: 0 };
    }

    history.forEach(log => {
      const key = log.reviewTime.toISOString().split("T")[0];
      if (dailyStats[key]) {
        dailyStats[key].count += 1;
        if (log.score === 100) {
          dailyStats[key].correct += 1;
        }
      }
    });

    const chartData = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      totalCards,
      dueCards,
      masteredCards,
      totalReviews,
      accuracy,
      chartData
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load dashboard metrics" });
  }
});

export default router;
