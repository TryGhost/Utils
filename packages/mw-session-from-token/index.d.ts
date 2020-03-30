interface User {
    id: string;
}

type Req = import('express').Request;
type Res = import('express').Response;
type Next = import('express').NextFunction;

type ExpressMiddlewareFn = (
    req: Req,
    res: Res,
    next: Next
) => Promise<void>
