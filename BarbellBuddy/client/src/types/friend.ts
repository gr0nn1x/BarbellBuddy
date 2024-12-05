export interface Lift {
  type: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendUsername: string;
  lastLift: Lift;
  maxLifts: { [key: string]: number };
  registrationDate: string;
}

