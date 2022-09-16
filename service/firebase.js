const firebaseAdmin = require('firebase-admin')
const authenticationService = require('./authentication')
module.exports = {
   async authorization(req, res, next) {
    try {
        if(req.url.indexOf("notification") !== -1 && req.method == "GET"){
        }
        else {
            if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
                throw 'Unauthorized'
            }
            const idToken = req.headers.authorization.split('Bearer ')[1];
            req.user = await firebaseAdmin.auth().verifyIdToken(idToken);
            if (req.url.indexOf("login") === -1){
                req.user = await authenticationService.get_user_by_google_id(req.user.user_id)
            }
        }
        next();
    } catch (error) {
        res.status(401)
        res.send('Unauthorized');
    }
   },
};
