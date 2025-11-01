import { TrelloService, createTrelloService } from "../api/trello-service";
import { Card } from "../types/board";
import { toEmojiDigit } from "../utils/emoji";

interface WeeklyTask {
  name: string;
  dayOffset: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  labels: string[]; // Array of label names or IDs
  estimatedHours: number;
}

type WeeklyTaskList = WeeklyTask[];
type MonthlyTasks = WeeklyTaskList[];

// prettier-ignore
const MATH_WEEKLY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐧? 第回1", dayOffset: 0, labels: ["Math", "Class"], estimatedHours: 2 },
  { name: "🐧? 基本問題2", dayOffset: 1, labels: ["Math", "Class"], estimatedHours: 1 },
  { name: "🐧? 練習問題3", dayOffset: 2, labels: ["Math", "Ex"], estimatedHours: 1.5 },
  { name: "🐧? 反復問題(基本)4", dayOffset: 3, labels: ["Math", "Ex"], estimatedHours: 1 },
  { name: "🐧? 反復問題(練習)5", dayOffset: 4, labels: ["Math", "Ex"], estimatedHours: 2 },
  { name: "🐧? トレーニング6", dayOffset: 5, labels: ["Math", "Ex"], estimatedHours: 1.5 },
  { name: "🐧? 実戦演習7", dayOffset: 6, labels: ["Math", "Ex"], estimatedHours: 1.5 },
];

// prettier-ignore
const MATH_SUMMARY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐧? 基本問題1", dayOffset: 0, labels: ["Math", "Class"], estimatedHours: 2 },
  { name: "🐧? 練習問題2", dayOffset: 1, labels: ["Math", "Class"], estimatedHours: 1 },
  { name: "🐧? ステップ🏃‍♂️", dayOffset: 2, labels: ["Math", "Ex"], estimatedHours: 1.5 },
  { name: "🐧? ステップ🙇‍♂️", dayOffset: 3, labels: ["Math", "Ex"], estimatedHours: 1 },
  { name: "🐧? 反ステップ🧗‍♂️", dayOffset: 4, labels: ["Math", "Ex"], estimatedHours: 2 },
];

// prettier-ignore
const SCIENCE_WEEKLY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐊? 第回1", dayOffset: 0, labels: ["Sci", "Class"], estimatedHours: 2 },
  { name: "🐊? 要点チェック2", dayOffset: 1, labels: ["Sci", "Class"], estimatedHours: 1 },
  { name: "🐊? まとめてみよう3", dayOffset: 2, labels: ["Sci", "Ex"], estimatedHours: 1.5 },
  { name: "🐊? 基本問題4", dayOffset: 3, labels: ["Sci", "Ex"], estimatedHours: 1 },
  { name: "🐊? 練習問題5", dayOffset: 4, labels: ["Sci", "Ex"], estimatedHours: 2 },
  { name: "🐊? 発展問題6", dayOffset: 5, labels: ["Sci", "Ex"], estimatedHours: 2 },
];

// prettier-ignore
const SCIENCE_SUMMARY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🐊? 要点チェック1", dayOffset: 0, labels: ["Sci", "Class"], estimatedHours: 2 },
  { name: "🐊? 練習問題2", dayOffset: 1, labels: ["Sci", "Class"], estimatedHours: 1 },
  { name: "🐊? 練習問題3", dayOffset: 2, labels: ["Sci", "Ex"], estimatedHours: 1.5 },
  { name: "🐊? 応用問題4", dayOffset: 3, labels: ["Sci", "Ex"], estimatedHours: 1 },
  { name: "🐊? チャレンジ問題5", dayOffset: 4, labels: ["Sci", "Ex"], estimatedHours: 2 },
];

// prettier-ignore
const SOCIAL_WEEKLY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🦅? 第回1", dayOffset: 0, labels: ["Soc", "Class"], estimatedHours: 2 },
  { name: "🦅? 要点チェック2", dayOffset: 1, labels: ["Soc", "Class"], estimatedHours: 1 },
  { name: "🦅? まとめてみよう3", dayOffset: 2, labels: ["Soc", "Ex"], estimatedHours: 1.5 },
  { name: "🦅? 基本問題4", dayOffset: 3, labels: ["Soc", "Ex"], estimatedHours: 1 },
  { name: "🦅? 練習問題5", dayOffset: 4, labels: ["Soc", "Ex"], estimatedHours: 2 },
  { name: "🦅? 発展問題6", dayOffset: 5, labels: ["Soc", "Ex"], estimatedHours: 2 },
];

// prettier-ignore
const SOCIAL_SUMMARY_TASKS: WeeklyTaskList = [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: "🦅? 要点チェック1", dayOffset: 0, labels: ["Soc", "Class"], estimatedHours: 2 },
  { name: "🦅? 練習問題2", dayOffset: 1, labels: ["Soc", "Class"], estimatedHours: 1 },
  { name: "🦅? 練習問題3", dayOffset: 2, labels: ["Soc", "Ex"], estimatedHours: 1.5 },
  { name: "🦅? 応用問題4", dayOffset: 3, labels: ["Soc", "Ex"], estimatedHours: 1 },
  { name: "🦅? チャレンジ問題5", dayOffset: 4, labels: ["Soc", "Ex"], estimatedHours: 2 },
];

function getNextWeekDates(startDate: Date = new Date()): Date[] {
  // Find next Sunday
  const sunday = new Date(startDate);
  const daysUntilSunday = (7 - sunday.getDay()) % 7;
  sunday.setDate(sunday.getDate() + daysUntilSunday);

  // Generate dates for the week
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });
}

function getCurrentWeekNumber(date: Date = new Date()): number {
  // Get the first day of the year
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  // Get the first Sunday of the year
  while (firstDayOfYear.getDay() !== 0) {
    firstDayOfYear.setDate(firstDayOfYear.getDate() + 1);
  }

  const diff = date.getTime() - firstDayOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek) + 1;
}

function getFirstSundayOfMonth(year: number, month: number): Date {
  // Create date for the first of the month
  const date = new Date(year, month - 1, 1);
  // Find the first Sunday
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function generateMonthlySchedule({
  year,
  month,
  classNumber,
  weeksCount,
}: {
  year: number;
  month: number;
  classNumber: number;
  weeksCount: number;
}): { dates: Date[]; classNumbers: number[] } {
  const firstSunday = getFirstSundayOfMonth(year, month);
  // Generate N weeks of dates starting from first Sunday
  const dates: Date[] = [];
  const classNumbers: number[] = [];

  for (let w = 0; w < weeksCount; w++) {
    const weekStart = new Date(firstSunday);
    weekStart.setDate(firstSunday.getDate() + w * 7);
    dates.push(
      ...Array.from({ length: 7 }, (_, j) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + j);
        return date;
      })
    );
    classNumbers.push(classNumber + w);
  }

  return { dates, classNumbers };
}

async function createMonthlySchedule(
  userName: string,
  monthlyTasks: MonthlyTasks,
  startingClassNumber: number,
  year: number,
  month: number,
  trelloService: TrelloService,
  boardId: string,
  listId: string
) {
  const weeksCount = monthlyTasks.length;
  const { dates, classNumbers } = generateMonthlySchedule({
    year: year,
    month: month,
    classNumber: startingClassNumber,
    weeksCount: weeksCount,
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
  for (let week = 0; week < weeksCount; week++) {
    const weekDates = dates.slice(week * 7, (week + 1) * 7);
    const classNumber = classNumbers[week];

    // Create cards for each task this week
    for (const task of monthlyTasks[week]) {
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
      await trelloService.addLabels(createdCard.id, labelIds);
      await trelloService.addMemberToCard(createdCard.id, userId);
    }
  }
}

async function createWeeklySchedule(
  userName: string,
  tasks: WeeklyTaskList,
  trelloService: TrelloService,
  boardId: string,
  listId: string,
  weekStartDate: Date
) {
  const weekDates = getNextWeekDates(weekStartDate);
  const labelMap = new Map<string, string>();

  // Get userId
  const userId = (await trelloService.api(`members/${userName}`))?.id;

  // Get all labels from the board
  const labels = await trelloService.api(`boards/${boardId}/labels`);
  labels.forEach((label: { name: string; id: string }) => {
    labelMap.set(label.name, label.id);
  });

  // Create cards for each task
  for (const task of tasks) {
    const dueDate = weekDates[task.dayOffset];
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

    const weekNumber = getCurrentWeekNumber(dueDate);
    const card: Card = {
      subject: `Week ${weekNumber} - ${task.name}`,
      startDate: startDate,
      dueDate: dueDate,
      prototype: {
        subject: task.name,
        count: weekNumber, // Use week number as count
        rounds: 1,
        labels: task.labels,
        steps: [],
      },
    };

    const createdCard = await trelloService.createCard(listId, card);
    await trelloService.addLabels(createdCard.id, labelIds);
    await trelloService.addMemberToCard(createdCard.id, userId);
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
  const dryRun = false; // Set to false to run against real Trello API
  const trelloService = createTrelloService(dryRun);

  // Look up board and list IDs by name
  const boardId = await findBoardId(trelloService, "Ilya's ZK");
  const listId = await findListId(trelloService, boardId, "To Do");

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based

  const startingClassNumber = 6; // Adjust this based on your needs

  // Create arrays by repeating weekly tasks (similar to Python's list * n)

  try {
    for (const tasks of [
      [...Array(4).fill(MATH_WEEKLY_TASKS), MATH_SUMMARY_TASKS],
      [...Array(4).fill(SCIENCE_WEEKLY_TASKS), SCIENCE_SUMMARY_TASKS],
      [...Array(4).fill(SOCIAL_WEEKLY_TASKS), SOCIAL_SUMMARY_TASKS],
    ]) {
      await createMonthlySchedule(
        "ilyalevy",
        tasks,
        startingClassNumber,
        currentYear,
        currentMonth,
        trelloService,
        boardId,
        listId
      );
      console.log(tasks[0].name + "Monthly schedule created successfully ");
    }
  } catch (error) {
    console.error("Error creating monthly schedule:", error);
  }
}

if (require.main === module) {
  main();
}

export { createWeeklySchedule, createMonthlySchedule, WeeklyTask };
