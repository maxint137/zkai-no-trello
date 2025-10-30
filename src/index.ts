import { Card } from "./types/board";
import { prodData } from "./config/data";
import { setupStaticData } from "./services/board-service";
import { calculateTaskDates } from "./utils/date";
import {
  createCard as createCardOriginal,
  addChecklist as addChecklistOriginal,
  addLabels as addLabelsOriginal,
  addMemberToCard as addMemberOriginal,
} from "./api/trello-client";
import { delay } from "./api/queue";
import { createDryRunApi } from "./api/trello-client-dry";

const month = 10; // October

const startDate = new Date(2025, month - 1, 1); // Month's 1st, 2025 (Months are 0-indexed)

// move to first Sunday
startDate.setDate(startDate.getDate() + ((7 - startDate.getDay()) % 7));

// or testData for testing
const data = Object.fromEntries(
  Object.entries(prodData).filter(([key, _]) => key === "Ilya")
);

// Use dry run mode if environment variable is set
const isDryRun = true; //process.env.DRY_RUN === "true";
const trelloApiImpl = isDryRun ? createDryRunApi(true) : undefined;

// Create API-dependent functions
const createCard = isDryRun
  ? (listId: string, card: Card) =>
      trelloApiImpl!("cards", {
        name: card.subject,
        desc: "See the checklist for detailed steps",
        start: card.startDate,
        due: card.dueDate,
        idList: listId,
        pos: "bottom",
      })
  : createCardOriginal;

const addChecklist = isDryRun
  ? (cardId: string, steps: any) =>
      trelloApiImpl!("checklists", { idCard: cardId, name: steps?.name })
  : addChecklistOriginal;

const addLabels = isDryRun
  ? (cardId: string, labelIds: string[] | undefined) =>
      labelIds
        ? trelloApiImpl!(`cards/${cardId}/idLabels`, { value: labelIds[0] })
        : Promise.resolve()
  : addLabelsOriginal;

const addMemberToCard = isDryRun
  ? (cardId: string, userId: string) =>
      trelloApiImpl!(`cards/${cardId}/idMembers`, { value: userId })
  : addMemberOriginal;

// main
async function main() {
  await setupStaticData(data, trelloApiImpl);
  console.log("Setting up static data...", data);

  Object.keys(data).forEach((name) => {
    const {
      assignmentsDefinition,
      drillsDefinition,
      userId,
      todoListId,
      labelIds,
    } = data[name];

    const tasks = [
      ...calculateTaskDates(startDate, assignmentsDefinition, true),
      ...calculateTaskDates(startDate, drillsDefinition),
    ];

    const tasksPostponed = tasks.map((card: Card, index: number) =>
      delay(index * 1000)
        .then(() => createCard(todoListId!, card))
        .then(async (newCard) => {
          await addMemberToCard(newCard.id, userId!);
          await addChecklist(newCard.id, card.prototype?.steps);
          await addLabels(
            newCard.id,
            card.prototype?.labels?.map((label) => labelIds[label])
          );
          return newCard;
        })
    );

    Promise.all(tasksPostponed).then((results) => {
      console.log(results.length, "tasks created");
    });
  });
}

main().catch(console.error);
