export function createLogger(limit = 120) {
  const lines = [];
  return {
    push(message) {
      lines.unshift(message);
      if (lines.length > limit) lines.length = limit;
    },
    text() {
      return lines.join('\n');
    }
  };
}
