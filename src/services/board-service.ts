import { Board, PersonalBoards } from "../types/board";
import { trelloApi as defaultTrelloApi } from "../api/trello-client";
import { setupLabels } from "./label-service";

export async function setupStaticData(
  boards: PersonalBoards,
  trelloApi: (endpoint: string, body?: any) => Promise<any> = defaultTrelloApi
): Promise<void> {
  await Promise.all(
    Object.keys(boards).map(async (name) => {
      const board = boards[name];
      await setupBoard(board, trelloApi);
    })
  );
}

async function setupBoard(
  board: Board,
  trelloApi: (endpoint: string, body?: any) => Promise<any>
): Promise<void> {
  // Get user ID
  board.userId = (await trelloApi(`members/${board.userName}`))?.id;
  if (!board.userId) {
    throw new Error(`No user ${board.userName} found`);
  }

  // Get board ID
  board.boardId = (await trelloApi("/members/me/boards")).filter(
    (b: { name: string }) => b.name === board.boardName
  )[0]?.id;
  if (!board.boardId) {
    throw new Error(`No board named ${board.boardName} found`);
  }

  // Get todo list ID
  board.todoListId = (await trelloApi(`boards/${board.boardId}/lists`)).filter(
    (list: { name: string }) => list.name.startsWith("To Do")
  )[0]?.id;
  if (!board.todoListId) {
    throw new Error(`No todo list found`);
  }

  // Get labels
  await setupLabels(board, trelloApi);
}
