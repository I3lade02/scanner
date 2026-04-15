export function formatRelativeDate(value?: string | null): string {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  const now = Date.now();
  const delta = Math.round((now - date.getTime()) / (1000 * 60 * 60 * 24));

  if (delta <= 0) {
    return 'Today';
  }

  if (delta === 1) {
    return 'Yesterday';
  }

  if (delta < 7) {
    return `${delta}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
