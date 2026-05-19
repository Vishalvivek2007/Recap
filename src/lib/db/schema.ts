import Dexie, { type EntityTable } from "dexie";
import type { Meeting } from "@/types/meeting";

/**
 * IndexedDB schema for Notely.
 * All meeting data lives entirely client-side — no backend, no privacy concerns.
 */

class NotelyDB extends Dexie {
  meetings!: EntityTable<Meeting, "id">;

  constructor() {
    super("notely");
    this.version(1).stores({
      // 'id' is primary key; 'createdAt' indexed for sorting
      meetings: "id, createdAt, title",
    });
  }
}

export const db = new NotelyDB();