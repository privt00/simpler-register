import express, { Request, Response } from 'express';
import { getTimetable } from '../handlers/timeTable';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const info = {
  name: 'TimeTable Modul'
};

export const router = () => {
  const moduleRouter = express.Router();

  moduleRouter.get('/', async (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const user = await prisma.users.findUnique({
      where: {
        id: req.session.user.id
      }
    });
  
    if (!user) {
      return res.redirect('/login');
    }
  
    const timetable = await getTimetable(req.session.user.username);
  
    Object.keys(timetable).forEach(day => {
      timetable[day as keyof DayTimetable].sort((a, b) => a.startMinutes - b.startMinutes);
    });
  
    res.render('dashboard/index', { user, timetable });
  });

  return moduleRouter;
};

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
  });

export default {
  info,
  router,
};
