export type StandardStepsType = { name: string; items: string[] }[];

export interface Assignment {
  subject: string;
  count: number;
  rounds: number;
  labels: string[];
  steps: StandardStepsType;
}

export interface Board {
  boardName: string;
  userName: string;
  assignmentsDefinition: Assignment[];
  drillsDefinition: Assignment[];

  boardId?: string;
  userId?: string;
  todoListId: string;
  labelIds: { [key: string]: string };
}

export interface Card {
  subject: string;
  startDate: Date;
  dueDate: Date;
  prototype: Assignment;
}

export interface PersonalBoards {
  [key: string]: Board;
}
