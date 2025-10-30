import * as dotenv from "dotenv";
import { TrelloCardResponse, TrelloChecklistResponse } from "../types/trello";
import { Card, StandardStepsType } from "../types/board";
import { enqueue } from "./queue";

dotenv.config();

const RATE_LIMIT_MS = 200;

export function trelloApi(endpoint: string, body: any = null) {
  return enqueue(() => _trelloApi(endpoint, body), RATE_LIMIT_MS);
}

async function _trelloApi(endpoint: string, body: any = null): Promise<any> {
  const url = `https://api.trello.com/1/${endpoint}?key=${process.env.APP_KEY}&token=${process.env.APP_TOKEN}`;

  if (!process.env.APP_KEY || !process.env.APP_TOKEN) {
    throw new Error("Missing Trello API credentials in environment variables");
  }

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
    throw err; // Re-throw the error to be handled by the caller
  }
}

export async function createCard(
  listId: string,
  card: Card
): Promise<TrelloCardResponse> {
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

export async function addChecklist(
  cardId: string,
  steps: StandardStepsType
): Promise<void> {
  if (!steps) {
    return;
  }

  for (const step of steps) {
    const cl: TrelloChecklistResponse = await trelloApi(`checklists`, {
      idCard: cardId,
      name: step.name,
    });

    for (const item of step.items) {
      await trelloApi(`checklists/${cl.id}/checkItems`, {
        name: item,
      });
    }
  }
}

export async function addLabels(
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

export async function addMemberToCard(
  cardId: string,
  userId: string
): Promise<void> {
  await trelloApi(`cards/${cardId}/idMembers`, { value: userId });
}
