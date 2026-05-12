export function useDateFormat() {
  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function dayCount(start: string, end: string) {
    return Math.max(
      (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000 + 1,
      1
    );
  }

  return { formatDate, dayCount };
}
