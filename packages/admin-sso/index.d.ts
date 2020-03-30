interface User {
    id: string;
}

type Token = string;
type EmailAddress = string;

type Req = import('express').Request;
type Res = import('express').Response;
type Next = import('express').NextFunction;

type ExpressMiddlewareFn = (
    req: Req,
    res: Res,
    next: Next
) => Promise<void>
