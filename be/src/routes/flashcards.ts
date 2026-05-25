import { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import prisma from "../database/db";

const router = Router();

const cardSchema = z.object({
  vocabulary: z.string().min(1, "Từ vựng không được để trống"),
  meaning: z.string().min(1, "Định nghĩa không được để trống"),
  exampleSentence: z.string().optional().nullable(),
  exampleTranslation: z.string().optional().nullable(),
  reading: z.string().optional().nullable(),
  partOfSpeech: z.string().optional().nullable(),
  jlptLevel: z.string().optional().nullable()
});

// GET /api/flashcards (List with search)
router.get("/", async (req: Request, res: Response) => {
  const search = req.query.search as string;

  try {
    const cards = await prisma.flashcard.findMany({
      where: search
        ? {
            OR: [
              { vocabulary: { contains: search } },
              { meaning: { contains: search } },
              { reading: { contains: search } }
            ]
          }
        : {},
      orderBy: { createdAt: "desc" }
    });
    return res.json(cards);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

// GET /api/flashcards/:id (Detail)
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const card = await prisma.flashcard.findFirst({
      where: { id }
    });
    if (!card) {
      return res.status(404).json({ error: "Flashcard not found" });
    }
    return res.json(card);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch flashcard" });
  }
});

// POST /api/flashcards (Create)
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = cardSchema.parse(req.body);
    const card = await prisma.flashcard.create({
      data: {
        vocabulary: data.vocabulary,
        meaning: data.meaning,
        exampleSentence: data.exampleSentence,
        exampleTranslation: data.exampleTranslation,
        reading: data.reading,
        partOfSpeech: data.partOfSpeech,
        jlptLevel: data.jlptLevel
      }
    });
    return res.status(201).json(card);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid inputs", details: err.errors });
    }
    return res.status(500).json({ error: "Failed to create flashcard" });
  }
});

// PUT /api/flashcards/:id (Update)
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = cardSchema.parse(req.body);
    const existing = await prisma.flashcard.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flashcard not found" });
    }

    const card = await prisma.flashcard.update({
      where: { id },
      data: {
        vocabulary: data.vocabulary,
        meaning: data.meaning,
        exampleSentence: data.exampleSentence,
        exampleTranslation: data.exampleTranslation,
        reading: data.reading,
        partOfSpeech: data.partOfSpeech,
        jlptLevel: data.jlptLevel
      }
    });
    return res.json(card);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid inputs", details: err.errors });
    }
    return res.status(500).json({ error: "Failed to update flashcard" });
  }
});

// DELETE /api/flashcards/:id (Delete)
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.flashcard.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Flashcard not found" });
    }

    await prisma.flashcard.delete({ where: { id } });
    return res.json({ message: "Flashcard deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete flashcard" });
  }
});

export default router;
