import { db } from "./schema";
import type { Meeting } from "@/types/meeting";

export async function saveMeeting(meeting: Meeting): Promise<void> {
  await db.meetings.put(meeting);
}

export async function getMeeting(id: string): Promise<Meeting | undefined> {
  return db.meetings.get(id);
}

export async function getAllMeetings(): Promise<Meeting[]> {
  return db.meetings.orderBy("createdAt").reverse().toArray();
}

export async function deleteMeeting(id: string): Promise<void> {
  await db.meetings.delete(id);
}
