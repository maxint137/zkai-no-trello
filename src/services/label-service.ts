import { Board } from "../types/board";

export async function setupLabels(
  board: Board,
  trelloApi: (endpoint: string, body?: any) => Promise<any>
): Promise<void> {
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
        throw new Error(
          `No labelId for ${label} found in ${labels.map(
            (l: { name: string }) => l.name
          )}`
        );
      }

      acc[label] = labelId;
      return acc;
    },
    {}
  );
}
