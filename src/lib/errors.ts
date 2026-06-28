/** Server action errors — `code` is an i18n key (e.g. validation.weekClosed) */
export class ActionError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ActionError";
  }
}

export function isActionError(error: unknown): error is ActionError {
  return error instanceof ActionError;
}
