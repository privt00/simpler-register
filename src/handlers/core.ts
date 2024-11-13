import { PrismaClient } from '@prisma/client';
import { WebUntisSecretAuth } from 'webuntis';
import { authenticator as Authenticator } from 'otplib';

const prisma = new PrismaClient();

/**
 * Ermittelt den Wochentag eines angegebenen Datums.
 * 
 * @param {string} date - Das Datum im Format "YYYYMMDD".
 * @returns {'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag'} - Der Wochentag auf Deutsch.
 * @throws {Error} - Wirft einen Fehler, wenn das Datum auf ein Wochenende (Samstag oder Sonntag) fällt.
 */
function getWeekdayFromDate(date: string): 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' {
  const year = parseInt(date.slice(0, 4), 10);
  const month = parseInt(date.slice(4, 6), 10) - 1;
  const day = parseInt(date.slice(6, 8), 10);

  const dateObj = new Date(year, month, day);
  const weekdayIndex = dateObj.getDay();
  const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  if (weekdayIndex === 0 || weekdayIndex === 6) {
    throw new Error('Das Datum fällt auf ein Wochenende (Sonntag oder Samstag).');
  }

  return daysOfWeek[weekdayIndex] as 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag';
}

/**
 * Ruft einen Benutzer aus der Datenbank ab und erstellt eine WebUntis-Authentifizierungsinstanz.
 * 
 * @param {string} username - Der Benutzername des Benutzers.
 * @returns {Promise<WebUntisSecretAuth>} - Eine Instanz von WebUntisSecretAuth für die Authentifizierung des Benutzers.
 * @throws {Error} - Wirft einen Fehler, wenn der Benutzer nicht gefunden wird.
 */
async function getUser(username: string) {
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const untis = new WebUntisSecretAuth(
    user.school,
    user.username,
    user.secret,
    user.subdomain,
    'custom-identity',
    Authenticator
  );

  return untis;
}

export { getWeekdayFromDate, getUser };
