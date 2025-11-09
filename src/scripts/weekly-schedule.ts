import { TrelloService, createTrelloService } from "../api/trello-service";
import { Card, StandardStepsType } from "../types/board";
import { toEmojiDigit } from "../utils/emoji";
import {
  getDateRangeFromISOWeek,
  getISOWeek,
} from "../utils/iso_week_calculator";

interface WeeklyTask {
  name: string;
  dayOffset: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  labels: string[]; // Array of label names or IDs
  steps?: StandardStepsType;
  estimatedHours: number;
}

const ProblemSteps: StandardStepsType = [
  {
    name: "Student",
    items: ["Solve", "Review"],
  },
  {
    name: "Teacher",
    items: ["Review", "Discuss Mistakes"],
  },
];

type WeeklyTaskList = WeeklyTask[];
type TasksTranche = WeeklyTaskList[];

// the initial parameters
const kickOffDate = new Date(2025, 11 - 1, 9); // month is 0-indexed
const startingClassNumber = 11;
const dryRun = true; // Set to false to run against real Trello API

// prettier-ignore
const MATH_WEEKLY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐧? 第回1", dayOffset: 0, labels: ["Math", "Class"], estimatedHours: 2 },
  { name: "🐧? 基本問題2", dayOffset: 1, labels: ["Math", "Class"], steps: ProblemSteps, estimatedHours: 1 },
  { name: "🐧? 練習問題3", dayOffset: 2, labels: ["Math", "Class"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: "🐧? 反復問題(基本)4", dayOffset: 3, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 1 },
  { name: "🐧? 反復問題(練習)5", dayOffset: 4, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 2 },
  { name: "🐧? トレーニング6", dayOffset: 5, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: "🐧? 実戦演習7", dayOffset: 6, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
];

// prettier-ignore
const MATH_SUMMARY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐧? 基本問題1", dayOffset: 0, labels: ["Math", "Class"], steps: ProblemSteps, estimatedHours: 2 },
  { name: "🐧? 練習問題2", dayOffset: 1, labels: ["Math", "Class"], steps: ProblemSteps, estimatedHours: 1 },
  { name: "🐧? ステップ🏃‍♂️", dayOffset: 2, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: "🐧? ステップ🙇‍♂️", dayOffset: 3, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 1 },
  { name: "🐧? 反ステップ🧗‍♂️", dayOffset: 4, labels: ["Math", "Ex"], steps: ProblemSteps, estimatedHours: 2 },
];

// prettier-ignore
const make_weekly_tasks = (
  subject_emoji: string,
  subject_code: string
): WeeklyTaskList => {
  return [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    { name: `${subject_emoji}? 第回1`, dayOffset: 0, labels: [subject_code, "Class"], estimatedHours: 2, },
    { name: `${subject_emoji}? 要点チェック2`, dayOffset: 1, labels: [subject_code, "Class"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${subject_emoji}? まとめてみよう3`, dayOffset: 2, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 1.5, },
    { name: `${subject_emoji}? 基本問題4`, dayOffset: 3, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${subject_emoji}? 練習問題5`, dayOffset: 4, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
    { name: `${subject_emoji}? 発展問題6`, dayOffset: 5, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
  ];
};

// prettier-ignore
const make_summary_tasks = (
  subject_emoji: string,
  subject_code: string
): WeeklyTaskList => {
  return [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    { name: `${subject_emoji}? 要点チェック1`, dayOffset: 0, labels: [subject_code, "Class"], estimatedHours: 2, },
    { name: `${subject_emoji}? 練習問題2`, dayOffset: 1, labels: [subject_code, "Class"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${subject_emoji}? 練習問題3`, dayOffset: 2, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 1.5, },
    { name: `${subject_emoji}? 応用問題4`, dayOffset: 3, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${subject_emoji}? チャレンジ問題5`, dayOffset: 4, labels: [subject_code, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
  ];
};

const SCIENCE_WEEKLY_TASKS: WeeklyTaskList = make_weekly_tasks("🐊", "Sci");
const SCIENCE_SUMMARY_TASKS: WeeklyTaskList = make_summary_tasks("🐊", "Sci");

const SOCIAL_WEEKLY_TASKS: WeeklyTaskList = make_weekly_tasks("🦅", "Soc");
const SOCIAL_SUMMARY_TASKS: WeeklyTaskList = make_summary_tasks("🦅", "Soc");

function generateTrancheSchedule({
  firstSaturday,
  classNumber,
  trancheLen,
}: {
  firstSaturday: Date;
  classNumber: number;
  trancheLen: number;
}): { dates: Date[]; classNumbers: number[] } {
  // Generate N weeks of dates starting from first Sunday
  const dates: Date[] = [];
  const classNumbers: number[] = [];

  for (let w = 0; w < trancheLen; w++) {
    const workStart = new Date(firstSaturday);
    workStart.setDate(firstSaturday.getDate() + w * 7);
    dates.push(
      ...Array.from({ length: 7 }, (_, j) => {
        const date = new Date(workStart);
        date.setDate(workStart.getDate() + j);
        return date;
      })
    );
    classNumbers.push(classNumber + w);
  }

  return { dates, classNumbers };
}

async function createTrancheSchedule(
  userName: string,
  tasksTranche: TasksTranche,
  startingClassNumber: number,
  year: number,
  startingWeekNumber: number,
  trelloService: TrelloService,
  boardId: string,
  listId: string
) {
  const trancheLen = tasksTranche.length;

  const firstWeek = getDateRangeFromISOWeek(year, startingWeekNumber);

  const { dates, classNumbers } = generateTrancheSchedule({
    firstSaturday: firstWeek.weekEnd,
    classNumber: startingClassNumber,
    trancheLen: trancheLen,
  });
  const labelMap = new Map<string, string>();

  // Get userId
  const userId = (await trelloService.api(`members/${userName}`))?.id;

  // Get all labels from the board
  const labels = await trelloService.api(`boards/${boardId}/labels`);
  labels.forEach((label: { name: string; id: string }) => {
    labelMap.set(label.name, label.id);
  });

  // Create cards for each week
  for (let week = 0; week < trancheLen; week++) {
    const weekDates = dates.slice(week * 7, (week + 1) * 7);
    const classNumber = classNumbers[week];

    // Create cards for each task this week
    for (const task of tasksTranche[week]) {
      const dueDate = new Date(weekDates[task.dayOffset]);
      dueDate.setHours(18, 0, 0, 0); // Set due time to 6 PM

      const startDate = new Date(dueDate);
      startDate.setHours(startDate.getHours() - task.estimatedHours);

      const labelIds = task.labels
        .map((labelName) => {
          const labelId = labelMap.get(labelName);
          if (!labelId) {
            console.warn(`Label "${labelName}" not found on board`);
          }
          return labelId;
        })
        .filter((id): id is string => id !== undefined);

      if (labelIds.length === 0) {
        console.warn(`No valid labels found for task "${task.name}"`);
        continue;
      }

      const card: Card = {
        subject: `${task.name.replace("?", toEmojiDigit(classNumber))}`,
        startDate: startDate,
        dueDate: dueDate,
        prototype: {
          subject: task.name,
          count: classNumber,
          rounds: 1,
          labels: task.labels,
          steps: [],
        },
      };

      const createdCard = await trelloService.createCard(listId, card);
      await trelloService.addChecklist(createdCard.id, task.steps || []);
      await trelloService.addLabels(createdCard.id, labelIds);

      await trelloService.addMemberToCard(createdCard.id, userId);
    }
  }
}

async function findBoardId(
  trelloService: TrelloService,
  boardName: string
): Promise<string> {
  const boards = await trelloService.api("members/me/boards");
  const board = boards.find(
    (b: { name: string; id: string }) =>
      b.name.toLowerCase() === boardName.toLowerCase()
  );

  if (!board) {
    throw new Error(`Could not find board "${boardName}"`);
  }

  return board.id;
}

async function findListId(
  trelloService: TrelloService,
  boardId: string,
  listName: string
): Promise<string> {
  const lists = await trelloService.api(`boards/${boardId}/lists`);
  const list = lists.find(
    (l: { name: string; id: string }) =>
      l.name.toLowerCase() === listName.toLowerCase()
  );

  if (!list) {
    throw new Error(`Could not find list "${listName}" on board`);
  }

  return list.id;
}

async function main() {
  const trelloService = createTrelloService(dryRun);

  // Look up board and list IDs by name
  const boardId = await findBoardId(trelloService, "Ilya's ZK");
  const listId = await findListId(trelloService, boardId, "To Do");

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();

  // Create arrays by repeating weekly tasks (similar to Python's list * n)

  try {
    for (const tranche of [
      [...Array(4).fill(MATH_WEEKLY_TASKS), MATH_SUMMARY_TASKS],
      [...Array(4).fill(SCIENCE_WEEKLY_TASKS), SCIENCE_SUMMARY_TASKS],
      [...Array(4).fill(SOCIAL_WEEKLY_TASKS), SOCIAL_SUMMARY_TASKS],
    ]) {
      await createTrancheSchedule(
        "ilyalevy",
        tranche,
        startingClassNumber,
        currentYear,
        getISOWeek(kickOffDate).week,
        trelloService,
        boardId,
        listId
      );
      console.log(
        tranche[0][0].name + "Monthly schedule created successfully "
      );
    }
  } catch (error) {
    console.error("Error creating monthly schedule:", error);
  }
}

if (require.main === module) {
  main();
}

export { createTrancheSchedule, WeeklyTask };
