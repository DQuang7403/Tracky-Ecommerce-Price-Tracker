function dateFormatter(timestamp: string) {
  let date = new Date(timestamp);

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default dateFormatter