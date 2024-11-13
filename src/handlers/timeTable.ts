import { startOfWeek, endOfWeek } from 'date-fns';
import { getUser, getWeekdayFromDate } from './core';

/**
 * Holt den Stundenplan eines Benutzers für die aktuelle Woche und strukturiert ihn nach Wochentagen.
 * 
 * @param {string} username - Der Benutzername des Benutzers, für den der Stundenplan abgerufen wird.
 * @returns {Promise<Record<'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag', any[]>>} - Ein Objekt, das den Stundenplan nach Wochentagen aufgeteilt enthält.
 * @throws {Error} - Wirft einen Fehler, wenn der Stundenplan nicht abgerufen werden kann oder ein anderer Fehler auftritt.
 */
async function getTimetable(username: string) {
  try {
    const untis = await getUser(username);
    await untis.login();

    const timetable = await untis.getOwnClassTimetableForRange(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
      endOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const startOfDay = 7 * 60 + 50; // implementing a way to change those values comming with an admin dashboard update soon

    timetable.sort((a, b) => a.startTime - b.startTime);

    const weekDays: Record<'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag', any[]> = {
      Montag: [],
      Dienstag: [],
      Mittwoch: [],
      Donnerstag: [],
      Freitag: []
    };

    timetable.forEach((classItem) => {
      const startMinutes = Math.floor(classItem.startTime / 100) * 60 + (classItem.startTime % 100);
      const endMinutes = Math.floor(classItem.endTime / 100) * 60 + (classItem.endTime % 100);
      const hourIndex = Math.floor((startMinutes - startOfDay) / 45) + 1;

      try {
        const dayOfWeek = getWeekdayFromDate(classItem.date.toString()) as 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag';

        weekDays[dayOfWeek].push({
          ...classItem,
          startMinutes,
          endMinutes,
          hourIndex,
        });
      } catch (error) {
        console.warn(`Eintrag am Wochenende gefunden: ${classItem.date}`); // implementing handling for weekdays soon
      }
    });

    return weekDays;
  } catch (error) {
    console.error('Fehler beim Abrufen des Stundenplans:', error);
    throw error;
  }
}

export { getTimetable };
