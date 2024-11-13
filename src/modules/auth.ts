import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const info = {
  name: 'Auth Modul'
};

export const router = () => {
  const moduleRouter = express.Router();

  moduleRouter.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).send('Benutzer nicht gefunden')
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).send('Passwort ist ungültig')
      return;
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      school: user.school,
    };

    res.redirect('/');
  });

  moduleRouter.post('/register', async (req: Request, res: Response) => {
    const { username, password, school, secret, subdomain } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(409).send('Benutzername existiert bereits')
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        school,
        secret,
        subdomain,
      },
    });

    req.session.user = {
      id: user.id,
      username: user.username,
      school: user.school,
    };

    res.redirect('/');
  });

  moduleRouter.get('/login', (req: Request, res: Response) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    res.render('auth/login');
  });

  moduleRouter.get('/register', (req: Request, res: Response) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    res.render('auth/register');
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
