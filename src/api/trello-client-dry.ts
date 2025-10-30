import {
  TrelloBoard,
  TrelloCardResponse,
  TrelloChecklistResponse,
  TrelloLabel,
  TrelloList,
  TrelloMember,
} from "../types/trello";

export function createDryRunApi(debugLog: boolean = true) {
  const mockData = {
    users: new Map<string, TrelloMember>(),
    boards: new Map<string, TrelloBoard>(),
    lists: new Map<string, TrelloList>(),
    labels: new Map<string, TrelloLabel>(),
    cards: new Map<string, TrelloCardResponse>(),
    checklists: new Map<string, TrelloChecklistResponse>(),
    idCounter: 0,
  };

  function generateId(prefix: string): string {
    mockData.idCounter++;
    return `${prefix}_${mockData.idCounter}`;
  }

  return async function trelloApiDryRun(
    endpoint: string,
    body: any = null
  ): Promise<any> {
    const log = debugLog ? console.log : () => {};
    log(
      `🔸 DryRun API Call: ${endpoint}`,
      body ? `\nBody: ${JSON.stringify(body, null, 2)}` : ""
    );

    //  to noSimulate network delay
    // await new Promise((resolve) => setTimeout(resolve, 100));

    // Handle different endpoints
    if (endpoint.startsWith("members/")) {
      const userName = endpoint.split("/")[1];
      if (userName === "me") {
        return [{ id: "me_1", name: "Ilya" }];
      }

      let user = mockData.users.get(userName);
      if (!user) {
        user = { id: generateId("user") };
        mockData.users.set(userName, user);
      }
      return user;
    }

    if (endpoint === "/members/me/boards") {
      // Pre-populate boards if empty
      if (mockData.boards.size === 0) {
        mockData.boards.set("adams_board", {
          id: generateId("board"),
          name: "Adam's ZK",
        });
        mockData.boards.set("test_board", {
          id: generateId("board"),
          name: "Test",
        });
        mockData.boards.set("ilyas_board", {
          id: generateId("board"),
          name: "Ilya's ZK",
        });
      }
      return Array.from(mockData.boards.values());
    }
    if (endpoint.startsWith("boards/") && endpoint.endsWith("/lists")) {
      const boardId = endpoint.split("/")[1];
      return [
        { id: generateId("list"), name: "To Do" },
        { id: generateId("list"), name: "Doing" },
        { id: generateId("list"), name: "Done" },
      ];
    }

    if (endpoint.startsWith("boards/") && endpoint.endsWith("/labels")) {
      return [
        { id: generateId("label"), name: "Math" },
        { id: generateId("label"), name: "Jap" },
        { id: generateId("label"), name: "Soc" },
        { id: generateId("label"), name: "Sci" },
        { id: generateId("label"), name: "Class" },
        { id: generateId("label"), name: "Drill" },
        { id: generateId("label"), name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
        { id: generateId("label"), name: "🍿" },
        { id: generateId("label"), name: "Ex" },
      ];
    }

    if (endpoint === "cards") {
      const cardId = generateId("card");
      const card: TrelloCardResponse & {
        name: string;
        desc: string;
        start: Date;
        due: Date;
        idList: string;
        pos: string;
      } = {
        id: cardId,
        name: body.name,
        desc: body.desc,
        start: body.start,
        due: body.due,
        idList: body.idList,
        pos: body.pos,
      };
      mockData.cards.set(cardId, card);
      log(`📝 Created card: ${JSON.stringify(card, null, 2)}`);
      return card;
    }

    if (endpoint === "checklists") {
      const checklistId = generateId("checklist");
      const checklist: TrelloChecklistResponse = { id: checklistId };
      mockData.checklists.set(checklistId, checklist);
      return checklist;
    }

    if (
      endpoint.startsWith("checklists/") &&
      endpoint.endsWith("/checkItems")
    ) {
      return { id: generateId("checkitem") };
    }

    if (endpoint.startsWith("cards/") && endpoint.endsWith("/idMembers")) {
      return { id: generateId("member_assignment") };
    }

    if (endpoint.startsWith("cards/") && endpoint.endsWith("/idLabels")) {
      return { id: generateId("label_assignment") };
    }

    log(`⚠️ Unhandled endpoint in dry run: ${endpoint}`);
    return { id: generateId("unknown") };
  };
}
