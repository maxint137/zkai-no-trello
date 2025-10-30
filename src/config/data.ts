import { PersonalBoards } from "../types/board";

const ClassSteps = [
  {
    name: "Student",
    items: ["Lecture", "Practice", "Review"],
  },
  {
    name: "Teacher",
    items: ["Sign off"],
  },
];

const DrillSteps = [
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
export const testData: PersonalBoards = {
  Adam: {
    boardName: `Test`,
    boardId: "67f1dc13ad790ade3570599c",
    userName: "adamlevy74",
    assignmentsDefinition: [],
    drillsDefinition: [
      { subject: "English 🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 2, rounds: 1, labels: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿"], steps: [] },
      { subject: "Papa 🪆", count: 2, rounds: 1, labels: ["🍿"], steps: [] },
    ],
    todoListId: "",
    labelIds: {},
  },
};

export const prodData: PersonalBoards = {
  Adam: {
    boardName: `Adam's ZK`,
    userName: "adamlevy74",
    assignmentsDefinition: [
      {
        subject: "Math 🧮",
        count: 6 + 1,
        rounds: 1,
        labels: ["Math", "Class"],
        steps: ClassSteps,
      },
      {
        subject: "Japanese 🇯🇵",
        count: 6 + 1,
        rounds: 1,
        labels: ["Jap", "Class"],
        steps: ClassSteps,
      },
      {
        subject: "Soc. St 🌐",
        count: 2 + 1,
        rounds: 1,
        labels: ["Soc", "Class"],
        steps: ClassSteps,
      },
      {
        subject: "Science 🔬",
        count: 2 + 1,
        rounds: 1,
        labels: ["Sci", "Class"],
        steps: ClassSteps,
      },
    ],
    drillsDefinition: [
      {
        subject: "🏋️ Math",
        count: 10,
        rounds: 1,
        labels: ["Math", "Drill"],
        steps: DrillSteps,
      },
      {
        subject: "🏋️ Jap.",
        count: 10,
        rounds: 1,
        labels: ["Jap", "Drill"],
        steps: DrillSteps,
      },
      {
        subject: "English 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        count: 30 / 3,
        rounds: 1,
        labels: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
        steps: DrillSteps,
      },
      {
        subject: "Papa 🪆",
        count: 30 / 2,
        rounds: 1,
        labels: ["🍿"],
        steps: DrillSteps,
      },
    ],
    todoListId: "",
    labelIds: {},
  },
  Ilya: {
    boardName: `Ilya's ZK`,
    userName: "ilyalevy",
    // prettier-ignore
    assignmentsDefinition: [
        //   { subject: 'Japanese 🇯🇵', count: 6, rounds: 2, labels: ['Jap', 'Class'], steps: ClassSteps },
        // { subject: 'Soc. St 🌐', count: 4, rounds: 2, labels: ['Soc', 'Class'], steps: ClassSteps },
        // { subject: 'Science 🔬', count: 4, rounds: 2, labels: ['Sci', 'Class'], steps: ClassSteps },
        { subject: '🐧 Class', count: 5, rounds: 1, labels: ['Math', 'Class'], steps: ClassSteps },
        // { subject: '🐊 Class', count: 5, rounds: 1, labels: ['Sci', 'Class'], steps: ClassSteps },
        // { subject: '🦅 Class', count: 5, rounds: 1, labels: ['Soc', 'Class'], steps: ClassSteps },
    ],

    // prettier-ignore
    drillsDefinition: [
        // { subject: '🐊 Ex', count: 4, rounds: 5, labels: ['Sci', 'Ex'], steps: DrillSteps },
        // { subject: '🦅 Ex', count: 3, rounds: 5, labels: ['Soc', 'Ex'], steps: DrillSteps },
        // { subject: '🐧 Ex', count: 4, rounds: 5, labels: ['Math', 'Ex'], steps: DrillSteps },
        // { subject: '🐧 Drill', count: 7, rounds: 5, labels: ['Math', 'Drill'], steps: DrillSteps },
    ],
    todoListId: "",
    labelIds: {},
  },
};
