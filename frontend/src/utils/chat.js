export function buildRoomId(userId1, userId2) {
  const min = Math.min(Number(userId1), Number(userId2));
  const max = Math.max(Number(userId1), Number(userId2));
  return `${min}_${max}`;
}
