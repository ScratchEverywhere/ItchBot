export const splitMessage = (text: string, limit = 2000): string[] => {
  const room = limit - 8;
  const chunks: string[] = [];
  let current = "";
  let fence: string | null = null;

  const flush = () => {
    if (!current.trim()) return;
    chunks.push(fence ? `${current}\n\`\`\`` : current);
    current = fence ? `${fence}\n` : "";
  };

  for (let line of text.split("\n")) {
    while (line.length > room) {
      const take = Math.max(room - current.length, 1);
      current += line.slice(0, take);
      line = line.slice(take);
      flush();
    }
    if (current.length + line.length + 1 > room) flush();
    current += (current && !current.endsWith("\n") ? "\n" : "") + line;
    if (line.startsWith("```")) fence = fence ? null : line;
  }

  if (current.trim()) chunks.push(current);
  return chunks;
};
