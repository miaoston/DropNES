import { DB } from "./db";

export interface RecentGame {
  name: string;
  data: string;
  lastPlayed: number;
  thumbnail?: string; // Base64 data URL
}

export const RecentGamesManager = {
  /**
   * Migrate data from LocalStorage to IndexedDB if it exists.
   */
  async migrateFromLocalStorage() {
    try {
      const oldData = localStorage.getItem("dropnes_recent");
      if (oldData) {
        const games: RecentGame[] = JSON.parse(oldData);
        for (const game of games) {
          await DB.set(game);
        }
        localStorage.removeItem("dropnes_recent");
        console.log("Migration to IndexedDB complete.");
      }
    } catch (e) {
      console.warn("Migration failed", e);
    }
  },

  async saveGame(name: string, data: string) {
    try {
      // Preserve existing thumbnail if present
      const existing = await DB.get(name);
      const thumbnail = existing?.thumbnail;

      const game: RecentGame = {
        name,
        data,
        lastPlayed: Date.now(),
        thumbnail,
      };

      await DB.set(game);

      // Cleanup: Keep only top 20 to avoid massive DB bloat (though IDB can handle it)
      const all = await this.getGames();
      if (all.length > 20) {
        const toDelete = all.slice(20);
        for (const item of toDelete) {
          await DB.delete(item.name);
        }
      }
    } catch (e) {
      console.error("Failed to save game to IndexedDB", e);
    }
  },

  async deleteGame(name: string) {
    try {
      await DB.delete(name);
    } catch (e) {
      console.error("Failed to delete game from IndexedDB", e);
    }
  },

  async updateThumbnail(name: string, thumbnail: string) {
    try {
      const game = await DB.get(name);
      if (game) {
        game.thumbnail = thumbnail;
        await DB.set(game);
      }
    } catch (e) {
      console.warn("Failed to save thumbnail.", e);
    }
  },

  async getGames(): Promise<RecentGame[]> {
    try {
      const games = await DB.getAll();
      // Sort by lastPlayed descending
      return games.sort((a, b) => b.lastPlayed - a.lastPlayed);
    } catch {
      return [];
    }
  },

  async clear() {
    await DB.clear();
  },
};
