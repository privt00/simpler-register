import express from 'express';
import fs from 'fs';
import path from 'path';

/**
 * Lädt und registriert alle Module rekursiv aus dem Verzeichnis "modules".
 * 
 * @param {express.Express} app - Die Express-App-Instanz, in die die Module geladen werden sollen.
 */
export const loadModules = async (
  app: express.Express,
) => {
  const modulesDir = path.join(__dirname, '../modules');

  /**
   * Durchsucht ein Verzeichnis rekursiv und gibt eine Liste der gefundenen .js- und .ts-Dateien zurück.
   * 
   * @param {string} dir - Das Verzeichnis, das durchsucht werden soll.
   * @returns {string[]} - Eine Liste der vollständigen Pfade zu allen .js- und .ts-Dateien.
   */
  const getFilesRecursively = (dir: string): string[] => {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.flatMap((dirent) => {
      const fullPath = path.join(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursively(fullPath) : fullPath;
    });
    return files.filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
  };

  const files = getFilesRecursively(modulesDir);

  for (const file of files) {
    try {
      const { default: module } = await import(file);

      if (module && module.info && typeof module.router === 'function') {
        const { info, router } = module;
        console.log(`Lade Modul: ${info.name}`);
        app.use(router());
      } else {
        console.warn(
          `dem Modul ${file} fehlen notwendige Exports (info und router).`,
        );
      }
    } catch (error) {
      console.error(`Fehler beim Laden des Moduls ${file}:`, error);
    }
  }
};
