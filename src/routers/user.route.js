import {Router} from 'express';
import { verifyjwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {  loggedinuser, registeruser } from '../controllers/user.controller.js';

const router = Router();

router.route("/signup").post(
    upload.single("avatar"),
    registeruser
)


router.route("/loggedin").post(
    loggedinuser
)

export default router