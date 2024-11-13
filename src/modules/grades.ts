import express, { Request, Response } from 'express';
import { getUser } from '../handlers/core';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const info = {
  name: 'TimeTable Modul'
};

export const router = () => {
  const moduleRouter = express.Router();

  moduleRouter.get('/grades', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');
  
    const user = await prisma.users.findUnique({
      where: {
        id: req.session.user.id
      }
    });
  
    if (!user) {
      return res.redirect('/login');
    }
  
    const startDate = new Date('2024-09-01');
    const endDate = new Date('2025-06-30');
  
    try {
      const untis = await getUser(req.session.user.username);
      await untis.login();
  
      const exams = await untis.getExamsForRange(startDate, endDate, -1, true);
      const parseGrade = (grade: string | undefined): number | null => {
        const cleanGrade = (grade || '').replace(/[^0-9,.\/+]/g, '');
        if (!cleanGrade) return null;
        if (cleanGrade.includes('/')) {
          const parts = cleanGrade.split('/').map(Number);
          return parts.reduce((a, b) => a + b, 0) / parts.length;
        } else if (cleanGrade.includes(',')) {
          return parseFloat(cleanGrade.replace(',', '.'));
        } else if (cleanGrade.includes('+')) {
          return parseFloat(cleanGrade.replace('+', '')) + 0.25;
        }
        return parseFloat(cleanGrade);
      };
  
      const gradesBySubject: { [subject: string]: { exams: any[], average: string } } = {};
  
      exams.forEach(exam => {
        const parsedGrade = parseGrade(exam.grade);
        
        const examEntry = {
          date: new Date(exam.examDate),
          subject: exam.subject,
          grade: exam.grade || 'Keine Note vorhanden',
          parsedGrade: parsedGrade,
          type: exam.examType,
          text: exam.text,
          teacher: exam.teachers.join(', '),
          room: exam.rooms.join(', ')
        };
  
        if (!gradesBySubject[exam.subject]) {
          gradesBySubject[exam.subject] = { exams: [], average: 'Keine bewerteten Noten' };
        }
  
        gradesBySubject[exam.subject].exams.push(examEntry);
      });
  
      for (const subject in gradesBySubject) {
        const subjectGrades = gradesBySubject[subject].exams.map(e => e.parsedGrade).filter((g): g is number => g !== null);
        if (subjectGrades.length > 0) {
          const subjectAverage = subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length;
          gradesBySubject[subject].average = subjectAverage.toFixed(2);
        }
      }
  
      await untis.logout();
      res.render('dashboard/grades', { user, gradesBySubject });
    } catch (error) {
      console.error('Fehler beim Abrufen der Noten:', error);
      res.status(500).send('Fehler beim Abrufen der Noten');
    }
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
