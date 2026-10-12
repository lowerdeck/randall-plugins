/**
 * A resource or query that failed, with the HTTP status to respond with. The message is shown to users, so it must
 * not contain credentials.
 */
export class WidgetRequestError extends Error {

  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }

}
