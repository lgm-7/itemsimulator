import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-item', async (req, res, next) => {
    const { itemName,itemStat,itemPrice } = req.body;
    const isExistitem = await prisma.items.findFirst({
        where: {
          itemName
        },
      });
      if (isExistitem) {
        return res.status(409).json({ message: '이미 존재하는 아이템입니다.' });
      }
    const item = await prisma.items.create({
        data: {
          itemName,
          itemStat,
          itemPrice  
        },
      });
  
    return res.status(201).json({ data: item });
  });


  router.put('/update-item/:itmeId', async (req, res) => {
    const { itmeId } = req.params;
    const { itemName, itemStat } = req.body;

    try {
        // 아이템이 존재하는지 확인
        const existItem = await prisma.items.findUnique({
            where: { itemId: +itmeId },
        });

        if (!existItem) {
            return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
        }

        // 아이템 업데이트
        const updatedItem = await prisma.items.update({
            where: { itemId: +itmeId },
            data: {
                itemName: itemName !== undefined ? itemName : existItem.itemName,
                itemStat: itemStat !== undefined ? itemStat : existItem.itemStat,
            },
        });

        return res.status(200).json({ data: updatedItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

router.get('/item', async (req, res, next) => {
    const item = await prisma.items.findMany({
      select: {
        itemId: true,
        itemName: true,
        itemPrice: true
      }
    });
  
    return res.status(200).json({ data: item });
  });

router.get('/item/:itemId', async (req, res, next) => {
    const { itemId } = req.params;
    const item = await prisma.items.findFirst({
      where: {
        itemId: +itemId,
      },
      select: {
        itemId: true,
        itemName: true,
        itemStat: true,
        itemPrice: true
      },
    });
  
    return res.status(200).json({ data: item });
  });

export default router;