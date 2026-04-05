import jsnes from "jsnes";

export interface SaveState {
  version: string;
  romName: string;
  timestamp: number;
  nesState: any; // jsnes.NES.toJSON() returns an object
}

export const SaveSystem = {
  /**
   * Generates a save state from the current NES instance
   */
  createSaveState(nes: jsnes.NES, romName: string): SaveState {
    return {
      version: "0.1.0",
      romName,
      timestamp: Date.now(),
      nesState: nes.toJSON(),
    };
  },

  /**
   * Downloads the save state as a .dnes file
   */
  exportToFile(state: SaveState) {
    const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.romName}_${new Date().toISOString().slice(0, 10)}.dnes`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Loads a save state from a string (file content)
   */
  importFromFile(jsonContent: string): SaveState | null {
    try {
      const state = JSON.parse(jsonContent) as SaveState;
      if (state.version && state.nesState) {
        return state;
      }
      return null;
    } catch (e) {
      console.error("FAILED_TO_PARSE_SAVE_FILE", e);
      return null;
    }
  },

  /**
   * Quick save to local storage
   */
  quickSave(state: SaveState) {
    localStorage.setItem(`save_${state.romName}`, JSON.stringify(state));
  },

  /**
   * Quick load from local storage
   */
  quickLoad(romName: string): SaveState | null {
    const data = localStorage.getItem(`save_${romName}`);
    return data ? this.importFromFile(data) : null;
  },
};
