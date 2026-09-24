export class HttpException extends Error {
    constructor(
        readonly status: number,
        readonly message: string,
        readonly details?: Record<string, unknown>
    ) {
        super(message)
        this.name = "HttpException";

    }
}