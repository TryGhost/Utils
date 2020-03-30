module.exports = SessionFromToken;

/**
 * Returns a connect middleware function which exchanges a token for a session
 *
 * @template Token
 * @template Lookup
 *
 * @param { object } deps
 * @param { (req: Req) => Promise<Token> } deps.getTokenFromRequest
 * @param { (token: Token) => Promise<Lookup> } deps.getLookupFromToken
 * @param { (lookup: Lookup) => Promise<User> } deps.findUserByLookup
 * @param { (req: Req, res: Res, user: User) => Promise<void> } deps.createSession
 *
 * @returns {ExpressMiddlewareFn}
 */
function SessionFromToken({
    getTokenFromRequest,
    getLookupFromToken,
    findUserByLookup,
    createSession
}) {
    return async function handler(req, res, next) {
        try {
            const token = await getTokenFromRequest(req);
            const email = await getLookupFromToken(token);
            const user = await findUserByLookup(email);
            await createSession(req, res, user);
            next();
        } catch (err) {
            next(err);
        }
    };
}
