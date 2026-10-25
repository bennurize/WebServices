/** Text value of a form field, '' when absent */
export function textField(form: FormData, name: string): string {
  const value = form.get(name);

  return typeof value === 'string' ? value : '';
}

/** One entry per non empty line of a textarea */
export function linesField(form: FormData, name: string): string[] {
  return textField(form, name)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
