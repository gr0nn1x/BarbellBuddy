export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }
  
  export interface Workout {
    name: string;
    exercises: Exercise[];
  }
  
  export interface Program {
    id: string;
    name: string;
    workouts: Workout[];
    isPrivate: boolean;
  }
  
  