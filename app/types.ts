import { RSVPStatus } from "@prisma/client";

export type PlayerInput = {
  name: string;
  jerseyNumber?: number | null;
  position?: string | null;
};

export type GoalieInput = {
  name: string;
  jerseyNumber?: number | null;
};

export type GameInput = {
  opponent: string;
  date: string;
  finalScore?: string | null;
  location?: string | null;
};

export type ScheduleInput = {
  date: string;
  opponent: string;
  location: string;
  isPractice: boolean;
  time: string;
  gameId?: number | null;
};

export type PlayerGameStatInput = {
  gameId: number;
  playerId: number;
  goals: number;
  assists: number;
  plusMinus: number;
  penaltyMinutes: number;
};

export type GoalieGameStatInput = {
  gameId: number;
  goalieId: number;
  shotsAgainst: number;
  saves: number;
  goalsAllowed: number;
  shutout: boolean;
  minutesPlayed: number;
};

export type RSVPInput = {
  eventId: number;
  name: string;
  status: RSVPStatus;
};
