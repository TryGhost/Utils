module.exports = AdminSSO;

/**
 * Returns a connect middleware function which exchanges a token for a session
 *
 * @param { object } deps
 * @param { (req: Req, res: Res, user: User) => Promise<void> } deps.createSession
 * @param { (email: EmailAddress) => Promise<User> } deps.findUserByEmail
 * @param { (req: Req) => Promise<Token> } deps.getTokenFromRequest
 * @param { (token: Token) => Promise<EmailAddress> } deps.getEmailFromToken
 *
 * @returns {ExpressMiddlewareFn}
 */
function AdminSSO({
    createSession,
    findUserByEmail,
    getTokenFromRequest,
    getEmailFromToken
}) {
    return async function handler(req, res, next) {
        try {
            const token = await getTokenFromRequest(req);
            const email = await getEmailFromToken(token);
            const user = await findUserByEmail(email);
            await createSession(req, res, user);
            next();
        } catch (err) {
            next(err);
        }
    };
}
