"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.googleCallback = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// TODO use gapi library
let users = [];
const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CALLBACK_URL = "http%3A//localhost:8000/google/callback";
const GOOGLE_OAUTH_STATE = process.env.GOOGLE_OAUTH_STATE;
const GOOGLE_OAUTH_SCOPES = [
    "https%3A//www.googleapis.com/auth/userinfo.email",
    "https%3A//www.googleapis.com/auth/userinfo.profile",
];
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;
//
// You must include the Google Platform Library on your web pages that integrate Google Sign-In.
// <script src="https://apis.google.com/js/platform.js" async defer></script>
// Add a Google Sign-In button
// <div class="g-signin2" data-onsuccess="onSignIn"></div>
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info("signup");
    // state should include the value of the anti-forgery unique session token,
    // as well as any other information needed to recover the context when the user returns to your application, e.g., the starting URL.
    const state = GOOGLE_OAUTH_STATE;
    // scope=openid%20email&
    // const scope = GOOGLE_OAUTH_SCOPES.join(" ");
    const scope = "openid%20email&20profile";
    const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scope}`;
    res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});
exports.signup = signup;
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info("googleCallback");
    console.log(req.query);
    const { code } = req.query;
    const data = {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost:8000/google/callback",
        grant_type: "authorization_code",
    };
    // Exchange authorization code for access token
    const response = yield fetch(String(GOOGLE_ACCESS_TOKEN_URL), {
        method: "POST",
        body: JSON.stringify(data),
    });
    // Extract ID token from the response, ID token verifies user identity
    const accessTokenData = yield response.json();
    const { idToken } = accessTokenData;
    // Verify and extract the information in the ID token
    const tokenInfoResponse = yield fetch(`${process.env.GOOGLE_TOKEN_INFO_URL}?idToken=${idToken}`);
    const tokenInfo = yield tokenInfoResponse.json();
    // get user or create user
    const { email, name } = tokenInfo;
    let user = users.includes(email);
    if (!user) {
        users.push(email);
        console.log("users email array: ", users);
    }
    try {
        const token = yield generateToken({ email, name });
        console.log("token: ", token);
        console.log("tokenInfoResponse.status", tokenInfoResponse.status);
        res.cookie("token", token, {
            httpOnly: true,
            // secure: true,
            sameSite: "lax",
        });
        res
            .status(tokenInfoResponse.status)
            .json({ message: `${email} successfully logged in` });
    }
    catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ message: "Failed to generate token" });
    }
});
exports.googleCallback = googleCallback;
const generateToken = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, name, }) {
    const options = {
        algorithm: "HS256",
        expiresIn: Number(process.env.JWT_LIFETIME),
        issuer: "AIHelper",
        audience: GOOGLE_CLIENT_ID,
    };
    console.log(options);
    const token = jsonwebtoken_1.default.sign({ id: email, username: name }, String(process.env.JWT_SECRET), options);
    return token;
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info("login\tauthing");
    res.send("hello logged in world");
});
exports.login = login;
