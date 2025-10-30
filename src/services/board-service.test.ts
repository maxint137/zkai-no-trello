import { setupStaticData } from "./board-service";
import { PersonalBoards } from "../types/board";

describe("setupStaticData", () => {
  it("should populate board fields using injected API", async () => {
    const boards: PersonalBoards = {
      TestUser: {
        boardName: "Test Board",
        userName: "testUser",
        assignmentsDefinition: [],
        drillsDefinition: [],
        todoListId: "",
        labelIds: {},
      },
    };

    // Mock API implementation
    const mockApi = jest
      .fn()
      // 1. members/testUser
      .mockResolvedValueOnce({ id: "user-123" })
      // 2. /members/me/boards
      .mockResolvedValueOnce([{ name: "Test Board", id: "board-456" }])
      // 3. boards/board-456/lists
      .mockResolvedValueOnce([{ name: "To Do", id: "list-789" }])
      // 4. boards/board-456/labels
      .mockResolvedValueOnce([{ name: "Label1", id: "label-1" }]);

    await setupStaticData(boards, mockApi);

    expect(boards.TestUser.userId).toBe("user-123");
    expect(boards.TestUser.boardId).toBe("board-456");
    expect(boards.TestUser.todoListId).toBe("list-789");
    expect(boards.TestUser.labelIds).toEqual({});
    expect(mockApi).toHaveBeenCalledTimes(4);
  });
});
