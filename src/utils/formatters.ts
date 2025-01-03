export function formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }