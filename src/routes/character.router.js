import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 캐릭터 생성
router.post("/create-character", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { characterName } = req.body;
  const isExistName = await prisma.character.findFirst({
    where: {
      characterName,
    },
  });
  if (isExistName) {
    return res.status(409).json({ message: "이미 존재하는 이름입니다." });
  }
  const character = await prisma.character.create({
    data: {
      userId: +userId,
      characterName,
    },
  });

  return res.status(201).json({ data: character });
});

//로그인상태 전체 캐릭터 조회
router.get("/loginCharacter", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const character = await prisma.character.findMany({
    where: { userId },
    select: {
      characterName: true,
      health: true,
      power: true,
      money: true,
    },
  });
  return res.status(200).json({ data: character });
});

//전체 캐릭터 조회
router.get("/character", async (req, res, next) => {
  const character = await prisma.character.findMany({
    select: {
      characterName: true,
      health: true,
      power: true,
    },
  });

  return res.status(200).json({ data: character });
});

//캐릭터 검색
router.get("/character/:characterName", async (req, res, next) => {
  const { characterName } = req.params;

  const character = await prisma.character.findFirst({
    where: { characterName: characterName },
    select: {
      characterName: true,
      health: true,
      power: true,
    },
  });
  if (!character) {
    return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다." });
  }

  return res.status(200).json({ data: character });
});

//로그인 상태 캐릭터 검색
router.get("/loginCharacter/:characterName", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { characterName } = req.params;

    const character = await prisma.character.findFirst({
      where: { characterName: characterName },
      select: {
        userId: true,
        characterName: true,
        health: true,
        power: true,
        money: true,
      },
    });

    // 캐릭터 확인
    if (!character) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다." });
    }

    // 다른 유저일 경우
    if (character.userId !== userId) {
      const { money, userId, ...delInfo } = character;  //구조 분해 할당 문법
      return res.status(200).json({ data: delInfo });
    }

    // 내캐릭터일 경우
    const { userId: _, ...delUserId } = character;
    return res.status(200).json({ data: delUserId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

//캐릭터 삭제
router.delete("/character/:characterName", authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const { characterName } = req.params;

    const character = await prisma.character.findFirst({
      where: { userId, characterName: characterName },
    });
    if (!character) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다." });
    }

    await prisma.character.delete({
      where: { characterId: +character.characterId },
    });

    return res.status(200).json({ data: "캐릭터가 삭제되었습니다." });
  }
);

export default router;
