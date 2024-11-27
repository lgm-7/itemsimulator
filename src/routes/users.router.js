import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

//회원가입
router.post("/sign-up", async (req, res, next) => {
  try {
    const { id, password, passwordCheck } = req.body;

    if (!id || !password || !passwordCheck) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }
    const idRegex = /[a-z]+[0-9]/;
    if (!idRegex.test(id)) {
      return res
        .status(400)
        .json({
          message: "아이디는 영어 소문자 + 숫자 조합으로  구성되어야 합니다.",
        });
    }

    const isExistUser = await prisma.users.findFirst({
      where: {
        id,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }
    if (passwordCheck !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    // 사용자 비밀번호를 암호화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // MySQL과 연결된 Prisma 클라이언트를 통해 트랜잭션을 실행합니다.
    const [user] = await prisma.$transaction(async (tx) => {
      // 트랜잭션 내부에서 사용자를 생성합니다.
      const user = await tx.users.create({
        data: {
          id,
          password: hashedPassword, // 암호화된 비밀번호를 저장합니다.
        },
      });

      // 콜백 함수의 리턴값으로 사용자와 사용자 정보를 반환합니다.
      return [user];
    });
    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    next(err);
  }
});

//로그인
router.post("/sign-in", async (req, res, next) => {
  try {
    const { id, password } = req.body;
    const user = await prisma.users.findFirst({ where: { id } });

    if (!user)
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      "custom-secret-key",
      { expiresIn: '1h' }
    );

    res.header("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    next(err);
  }
});

export default router;
