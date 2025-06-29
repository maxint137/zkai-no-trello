import * as dotenv from "dotenv";
dotenv.config(); //https://trello.com/power-ups/ https://trello.com/1/authorize?expiration=never&

type StandardStepsType = { name: string; items: string[] }[];

type Assignment = {
  subject: string;
  count: number;
  rounds: number;
  labels: string[];
  steps: StandardStepsType;
};

type Board = {
  boardName: string;
  userName: string;
  assignmentsDefinition: Assignment[];
  drillsDefinition: Assignment[];

  boardId?: string;
  userId?: string;
  todoListId: string;
  labelIds: { [key: string]: string };
};

type Card = {
  subject: string;
  startDate: Date;
  dueDate: Date;
  prototype: Assignment;
};

type PersonalBoards = {
  [key: string]: Board;
};

const startDate = new Date(2025, 6, 1); // July 1st, 2025 (Month is 0-indexed)

const ClassSteps: StandardStepsType = [
  {
    name: "Student",
    items: ["Lecture", "Practice", "Review"],
  },
  {
    name: "Teacher",
    items: ["Sign off"],
  },
];
const DrillSteps: StandardStepsType = [
  {
    name: "Student",
    items: ["Solve", "Review"],
  },
  {
    name: "Teacher",
    items: ["Sign off"],
  },
];

// prettier-ignore
const data_test: PersonalBoards = {
    Adam: {
        boardName: `Test`,
        boardId: '67f1dc13ad790ade3570599c',
        // "name": "To Do",
        // "id": "67f1dc19f06cda1beff13b8a",
        // card: 67f1de69250d19943d4f2eff
        // checklist: 67f1de74c64e24c41f891a33
        // https://api.trello.com/1/checklists/{id}/checkItems?name={name}&key=APIKey&token=APIToken'

        userName: 'adamlevy74',
        assignmentsDefinition: [
            // { subject: 'Math 🧮', count: 2, rounds: 1, labels: ['Math', 'Class'], steps: ClassSteps },
            // { subject: 'Japanese 🇯🇵', count: 2, rounds: 1, labels: ['Jap', 'Class'], steps: ClassSteps },
            // { subject: 'Soc. St 🌐', count: 3, rounds: 1, labels: ['Soc', 'Class'], steps: ClassSteps },
            // { subject: 'Science 🔬', count: 3, rounds: 1, labels: ['Sci', 'Class'], steps: ClassSteps },
        ],

        drillsDefinition: [
            // { subject: '🏋️ Math', count: 1, rounds: 1, labels: ['Math', 'Drill'], steps: DrillSteps },
            // { subject: '🏋️ Jap.', count: 10, rounds: 1, labels: ['Jap', 'Drill'], steps: DrillSteps },
            { subject: 'English 🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: 2, rounds: 1, labels: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿'], steps: [] },
            { subject: 'Papa 🪆', count: 2, rounds: 1, labels: ['🍿'], steps: [] },
        ],
        todoListId:"",
        labelIds:{},
    }
};

// prettier-ignore
const data_real: PersonalBoards = {
    Adam: {
        boardName: `Adam's ZK`,
        userName: 'adamlevy74',

        assignmentsDefinition: [
            { subject: 'Math 🧮', count: 6+1, rounds: 1, labels: ['Math', 'Class'], steps: ClassSteps },
            { subject: 'Japanese 🇯🇵', count: 6+1, rounds: 1, labels: ['Jap', 'Class'], steps: ClassSteps },
            { subject: 'Soc. St 🌐', count: 2+1, rounds: 1, labels: ['Soc', 'Class'], steps: ClassSteps },
            { subject: 'Science 🔬', count: 2+1, rounds: 1, labels: ['Sci', 'Class'], steps: ClassSteps },
        ],

        drillsDefinition: [
            { subject: '🏋️ Math', count: 10, rounds: 1, labels: ['Math', 'Drill'], steps: DrillSteps },
            { subject: '🏋️ Jap.', count: 10, rounds: 1, labels: ['Jap', 'Drill'], steps: DrillSteps },
            { subject: 'English 🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: 30/3, rounds: 1, labels: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿'], steps: DrillSteps },
            { subject: 'Papa 🪆', count: 30/2, rounds: 1, labels: ['🍿'], steps: DrillSteps },
        ],
        todoListId:"",
        labelIds:{},
    },
    Ilya: {
        boardName: `Ilya's ZK`,
        userName: 'ilyalevy',

        assignmentsDefinition: [
            { subject: 'Math 🧮', count: 6, rounds: 2, labels: ['Math', 'Class'], steps: ClassSteps },
            { subject: 'Japanese 🇯🇵', count: 6, rounds: 2, labels: ['Jap', 'Class'], steps: ClassSteps },
            { subject: 'Soc. St 🌐', count: 4, rounds: 2, labels: ['Soc', 'Class'], steps: ClassSteps },
            { subject: 'Science 🔬', count: 4, rounds: 2, labels: ['Sci', 'Class'], steps: ClassSteps }
        ],

        drillsDefinition: [
            { subject: '🏋️ Math', count: 10, rounds: 1, labels: ['Math', 'Drill'], steps: DrillSteps },
            { subject: '🏋️ Jap.', count: 10, rounds: 1, labels: ['Jap', 'Drill'], steps: DrillSteps },
            { subject: 'English 🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: 30 / 3, rounds: 1, labels: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿'], steps: [] },
            { subject: 'Papa 🪆', count: 30 / 2, rounds: 1, labels: ['🍿'], steps: [] },
        ],
        todoListId:"",
        labelIds:{},
    },
}

async function setupStaticData(boards: PersonalBoards) {
  await Promise.all(
    Object.keys(boards).map(async (name) => {
      const board = boards[name];

      board.userId = (await trelloApi(`members/${board.userName}`))?.id;
      if (!board.userId) {
        throw new Error(`No user ${board.userName} found`);
      }

      board.boardId = (await trelloApi("/members/me/boards")).filter(
        (b: { name: string }) => b.name === board.boardName
      )[0]?.id;
      if (!board.boardId) {
        throw new Error(`No board named ${board.boardName} found`);
      }

      board.todoListId = (
        await trelloApi(`boards/${board.boardId}/lists`)
      ).filter((list: { name: string }) =>
        list.name.startsWith("To Do")
      )[0]?.id;
      if (!board.todoListId) {
        throw new Error(`No todo list found`);
      }

      const labels = (await trelloApi(`boards/${board.boardId}/labels`)).map(
        (l: { id: string; name: string }) => ({
          id: l.id,
          name: l.name,
        })
      );

      // collect all labels mentioned in the assignments and drills
      const allLabels = new Set<string>();
      [...board.assignmentsDefinition, ...board.drillsDefinition].forEach(
        (assignment) => {
          assignment.labels?.forEach((label) => allLabels.add(label));
        }
      );

      board.labelIds = Array.from(allLabels).reduce(
        (acc: { [key: string]: string }, label) => {
          const labelId = labels.filter(
            (l: { name: string }) => l.name === label
          )[0]?.id;

          if (!labelId) {
            throw new Error(`No labelId for ${label} found`);
          }

          acc[label] = labelId;
          return acc;
        },
        {}
      );
    })
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateTaskDates(
  startDate: Date,
  assignments: Assignment[],
  hasExam: boolean = false
): Card[] {
  const allTasks: Card[] = [];

  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    daysInMonth
  );
  const totalDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const spinTasks = (
    assignment: Assignment,
    currentDate: Date,
    daysPerAssignment: number,
    round: number
  ) => {
    const roundChars = ["", "⓵", "⓶"];
    const roundChar = 1 === assignment.rounds ? "" : roundChars[round];

    for (let i = 0; i < assignment.count; i++) {
      const startDate = new Date(currentDate);
      currentDate = new Date(
        startDate.getTime() + daysPerAssignment * (1000 * 60 * 60 * 24)
      );

      const index =
        hasExam && i == assignment.count - 1 ? "🧐" : toEmojiDigit(i + 1);

      allTasks.push({
        subject: `${assignment.subject}${roundChar}${index}`,
        startDate: startDate,
        dueDate: currentDate,
        prototype: assignment,
      });
    }

    return currentDate;
  };

  assignments.forEach((assignment) => {
    const daysPerAssignment = totalDays / assignment.count / assignment.rounds;

    let currentDate = new Date(startDate);

    currentDate = spinTasks(assignment, currentDate, daysPerAssignment, 1);

    if (2 === assignment.rounds) {
      spinTasks(assignment, currentDate, daysPerAssignment, 2);
    }
  });

  // Sort all assignments by due date
  allTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return allTasks;
}

// prettier-ignore
function toEmojiDigit(n: number | string): string {
    const digitEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    return n.toString().split('').map(d => digitEmojis[+d]).join('');
}

const queue: (() => void)[] = [];
let isProcessing = false;

async function processQueue(rateLimitMs: number) {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length) {
    const task = queue.shift();
    task && task(); // Run the request
    await delay(rateLimitMs); // Wait before next
  }

  isProcessing = false;
}

function enqueue<T>(fn: () => Promise<T>, rateLimitMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    processQueue(rateLimitMs);
  });
}

function trelloApi(endpoint: string, body: any = null) {
  return enqueue(() => _trelloApi(endpoint, body), 200); // 200ms between calls
}

// api is the endpoint to call, e.g. 'boards/boardId/cards'
async function _trelloApi(endpoint: string, body: any = null): Promise<any> {
  const url = `https://api.trello.com/1/${endpoint}?key=${process.env.APP_KEY}&token=${process.env.APP_TOKEN}`;

  const headers = new Headers();
  headers.append("content-type", "application/json");

  const init = {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `${url} got an HTTP error ${response.status}: ${errorText}`
      );
    }

    return await response.json();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// async function getTodoList(boardName: string): Promise<string> {

//     const boards = await trelloApi(`members/me/boards`);

//     const myBoards = boards.filter((board: { name: string }) => board.name === boardName);
//     if (myBoards.length === 0) {
//         throw new Error(`No board found with name ${boardName}`);
//     }

//     const lists = await trelloApi(`boards/${myBoards[0].id}/lists`);
//     const todoLists = lists.filter((list: { name: string }) => list.name.startsWith('To Do'));
//     if (todoLists.length === 0) {
//         throw new Error(`No To Do list found in ${lists}`);
//     }

//     return todoLists[0].id;
// }

async function trelloCardCreate(
  listId: string,
  card: Card
): Promise<{ id: string }> {
  console.log(
    `Creating card for ${
      card.subject
    } ${card.startDate.toLocaleDateString()} -> ${card.dueDate.toLocaleDateString()}`
  );

  return await trelloApi(`cards`, {
    name: card.subject,
    desc: "See the checklist for detailed steps",
    start: card.startDate,
    due: card.dueDate,
    idList: listId,
    pos: "bottom",
  });
}

async function trelloAddChecklist(
  cardId: string,
  steps: StandardStepsType
): Promise<void> {
  if (!steps) {
    return;
  }

  // create the checklists one by one to keep the order
  (async () => {
    for (const step of steps) {
      await trelloApi(`checklists`, {
        idCard: cardId,
        name: step.name,
      }).then((cl: { id: string }) => {
        // create the checklist items one by one to keep the order
        (async () => {
          for (const item of step.items) {
            await trelloApi(`checklists/${cl.id}/checkItems`, {
              name: item,
            });
          }
        })();
      });
    }
  })();
}
async function trelloAddLabels(
  cardId: string,
  labelIds: string[] | undefined
): Promise<void> {
  if (!labelIds) {
    return;
  }

  for (const labelId of labelIds) {
    await trelloApi(`cards/${cardId}/idLabels`, {
      value: labelId,
    });
  }
}

// const data = data_test;
const data = data_real;

// main
setupStaticData(data).then(() => {
  console.log("Setting up static data...", data);

  Object.keys(data).forEach((name) => {
    const {
      assignmentsDefinition,
      drillsDefinition,
      userId,
      todoListId,
      labelIds,
    } = data[name];

    // console.log(`Creating tasks for ${name} in ${boardName} board`);
    // console.log(calculateTaskDates(startDate, assignmentsDefinition, true));

    const tasksPostponed = [
      ...calculateTaskDates(startDate, assignmentsDefinition, true),
      ...calculateTaskDates(startDate, drillsDefinition),
    ].map((card, index) =>
      delay(index * 1000)
        .then(() => trelloCardCreate(todoListId!, card)) // create the card
        .then(
          (newCard) =>
            trelloApi(`cards/${newCard.id}/idMembers`, { value: userId }) // add the user
              .then(() => {
                trelloAddChecklist(newCard.id, card.prototype?.steps);
              }) // add the checklist
              .then(() => {
                trelloAddLabels(
                  newCard.id,
                  card.prototype?.labels?.map((label) => labelIds[label]) // add the labels
                );
              }) // add the labels
        )
    );

    Promise.all(tasksPostponed).then((results) => {
      console.log(results.length, "tasks created");
    });
  });
});
