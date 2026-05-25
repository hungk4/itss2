import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with standalone Japanese vocabulary dataset...");

  // Clean database
  await prisma.learningHistory.deleteMany({});
  await prisma.flashcard.deleteMany({});

  // Create initial Japanese flashcards
  const vocabularyData = [
    {
      vocabulary: "勝手",
      reading: "かって",
      meaning: "Tự ý, tùy tiện, ích kỷ",
      partOfSpeech: "Tính từ đuôi な / Danh từ",
      jlptLevel: "N3",
      exampleSentence: "勝手な行動をしてはいけません。",
      exampleTranslation: "Không được tự ý hành động.",
      masteryLevel: 3,
      reviewCount: 5,
      correctCount: 4,
      wrongCount: 1
    },
    {
      vocabulary: "勉強",
      reading: "べんきょう",
      meaning: "Học tập, học hành",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlptLevel: "N5",
      exampleSentence: "毎日日本語を勉強します。",
      exampleTranslation: "Tôi học tiếng Nhật mỗi ngày.",
      masteryLevel: 5,
      reviewCount: 12,
      correctCount: 12,
      wrongCount: 0
    },
    {
      vocabulary: "大切",
      reading: "たいせつ",
      meaning: "Quan trọng, quý giá",
      partOfSpeech: "Tính từ đuôi な",
      jlptLevel: "N5",
      exampleSentence: "これは一番大切な書類です。",
      exampleTranslation: "Đây là tài liệu quan trọng nhất.",
      masteryLevel: 4,
      reviewCount: 8,
      correctCount: 7,
      wrongCount: 1
    },
    {
      vocabulary: "相談",
      reading: "そうだん",
      meaning: "Thảo luận, trao đổi, bàn bạc",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlptLevel: "N3",
      exampleSentence: "進路について先生に相談した。",
      exampleTranslation: "Tôi đã bàn bạc với giáo viên về định hướng tương lai.",
      masteryLevel: 1,
      reviewCount: 3,
      correctCount: 1,
      wrongCount: 2
    },
    {
      vocabulary: "食べる",
      reading: "たべる",
      meaning: "Ăn",
      partOfSpeech: "Động từ nhóm 2",
      jlptLevel: "N5",
      exampleSentence: "朝ご飯をレストランで食べます。",
      exampleTranslation: "Tôi ăn bữa sáng tại nhà hàng.",
      masteryLevel: 2,
      reviewCount: 4,
      correctCount: 2,
      wrongCount: 2
    },
    {
      vocabulary: "難しい",
      reading: "むずかしい",
      meaning: "Khó",
      partOfSpeech: "Tính từ đuôi い",
      jlptLevel: "N5",
      exampleSentence: "日本語の漢字は難しいですね。",
      exampleTranslation: "Chữ Kanji trong tiếng Nhật khó ghê.",
      masteryLevel: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0
    },
    {
      vocabulary: "簡単",
      reading: "かんたん",
      meaning: "Đơn giản, dễ dàng",
      partOfSpeech: "Tính từ đuôi な",
      jlptLevel: "N4",
      exampleSentence: "このテストはとても簡単でした。",
      exampleTranslation: "Bài kiểm tra này đã rất đơn giản.",
      masteryLevel: 1,
      reviewCount: 1,
      correctCount: 1,
      wrongCount: 0
    },
    {
      vocabulary: "約束",
      reading: "やくそく",
      meaning: "Hứa hẹn, cuộc hẹn",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlptLevel: "N4",
      exampleSentence: "友達と約束があります。",
      exampleTranslation: "Tôi có hẹn với bạn bè.",
      masteryLevel: 3,
      reviewCount: 6,
      correctCount: 5,
      wrongCount: 1
    },
    {
      vocabulary: "準備",
      reading: "じゅんび",
      meaning: "Chuẩn bị",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlptLevel: "N4",
      exampleSentence: "旅行の準備はもうできましたか。",
      exampleTranslation: "Bạn đã chuẩn bị xong cho chuyến đi chưa?",
      masteryLevel: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0
    },
    {
      vocabulary: "感謝",
      reading: "かんしゃ",
      meaning: "Cảm tạ, biết ơn",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlptLevel: "N3",
      exampleSentence: "先生の親切に感謝します。",
      exampleTranslation: "Tôi rất biết ơn sự tử tế của thầy cô giáo.",
      masteryLevel: 4,
      reviewCount: 9,
      correctCount: 8,
      wrongCount: 1
    }
  ];

  const now = new Date();

  for (const card of vocabularyData) {
    const nextReviewAt = new Date();
    if (card.masteryLevel > 0) {
      const offsetDays = card.masteryLevel === 5 ? 10 : card.masteryLevel === 4 ? 4 : -1;
      nextReviewAt.setDate(now.getDate() + offsetDays);
    }

    const createdCard = await prisma.flashcard.create({
      data: {
        vocabulary: card.vocabulary,
        reading: card.reading,
        meaning: card.meaning,
        partOfSpeech: card.partOfSpeech,
        jlptLevel: card.jlptLevel,
        exampleSentence: card.exampleSentence,
        exampleTranslation: card.exampleTranslation,
        masteryLevel: card.masteryLevel,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
        wrongCount: card.wrongCount,
        nextReviewAt
      }
    });

    if (card.reviewCount > 0) {
      for (let i = 0; i < card.reviewCount; i++) {
        const reviewTime = new Date();
        reviewTime.setDate(now.getDate() - Math.floor(Math.random() * 6));
        const isCorrect = i < card.correctCount;
        await prisma.learningHistory.create({
          data: {
            flashcardId: createdCard.id,
            memoryLevel: Math.min(5, Math.max(1, card.masteryLevel - (card.reviewCount - i))),
            score: isCorrect ? 100 : 0,
            reviewTime
          }
        });
      }
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
