import { Card } from "../types/board";
import { StandardStepsType } from "../types/board";
import {
  createCard as createCardOriginal,
  addChecklist as addChecklistOriginal,
  addLabels as addLabelsOriginal,
  addMemberToCard as addMemberOriginal,
  trelloApi as trelloApiOriginal,
} from "./trello-client";
import { createDryRunApi } from "./trello-client-dry";

export interface TrelloService {
  createCard(listId: string, card: Card): Promise<{ id: string }>;
  addChecklist(cardId: string, steps: StandardStepsType): Promise<void>;
  addLabels(cardId: string, labelIds: string[] | undefined): Promise<void>;
  addMemberToCard(cardId: string, userId: string): Promise<void>;
  api(endpoint: string, body?: any): Promise<any>;
}

export function createTrelloService(isDryRun: boolean = false): TrelloService {
  if (isDryRun) {
    const trelloApiImpl = createDryRunApi(true);
    return {
      createCard: (listId: string, card: Card) =>
        trelloApiImpl!("cards", {
          name: card.subject,
          desc: "See the checklist for detailed steps",
          start: card.startDate,
          due: card.dueDate,
          idList: listId,
          pos: "bottom",
        }),

      addChecklist: (cardId: string, steps: StandardStepsType) =>
        trelloApiImpl!("checklists", { idCard: cardId, steps: steps }),

      addLabels: (cardId: string, labelIds: string[] | undefined) =>
        labelIds
          ? trelloApiImpl!(`cards/${cardId}/idLabels`, { value: labelIds[0] })
          : Promise.resolve(),

      addMemberToCard: (cardId: string, userId: string) =>
        trelloApiImpl!(`cards/${cardId}/idMembers`, { value: userId }),

      api: trelloApiImpl!,
    };
  }

  return {
    createCard: createCardOriginal,
    addChecklist: addChecklistOriginal,
    addLabels: addLabelsOriginal,
    addMemberToCard: addMemberOriginal,
    api: (endpoint: string, body?: any) => {
      return trelloApiOriginal(endpoint, body);
    },
  };
}
