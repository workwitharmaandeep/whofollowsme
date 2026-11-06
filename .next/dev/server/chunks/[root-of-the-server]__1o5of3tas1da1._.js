module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/instagram/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(req) {
    try {
        const body = await req.json();
        // 1. If direct session cookie was provided (e.g., manual connect)
        if (body.sessionId) {
            let cleanSession = body.sessionId.trim();
            let cleanCsrf = body.csrfToken?.trim() || "";
            const cleanUser = body.username?.trim().toLowerCase().replace(/^@/, "") || "";
            // If user pasted a cookie header or string into sessionId
            if (cleanSession.includes("sessionid=")) {
                const sMatch = cleanSession.match(/sessionid=([^;\s]+)/i);
                const cMatch = cleanSession.match(/csrftoken=([^;\s]+)/i);
                if (sMatch) cleanSession = sMatch[1];
                if (cMatch && !cleanCsrf) cleanCsrf = cMatch[1];
            }
            if (!cleanSession) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "A valid sessionid cookie is required."
                }, {
                    status: 400
                });
            }
            // If csrftoken is missing, fetch one from Instagram or generate a 32-char token
            if (!cleanCsrf) {
                try {
                    const probe = await fetch("https://www.instagram.com/accounts/login/", {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                        }
                    });
                    const cookies = probe.headers.get("set-cookie") || "";
                    const match = cookies.match(/csrftoken=([^;]+)/);
                    if (match) cleanCsrf = match[1];
                } catch  {
                /* ignore */ }
                if (!cleanCsrf) {
                    cleanCsrf = Array.from({
                        length: 32
                    }, ()=>Math.floor(Math.random() * 16).toString(16)).join("");
                }
            }
            // Quick validation using desktop headers
            try {
                const checkRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser || "instagram"}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        "X-IG-App-ID": "936619743392459",
                        "X-CSRFToken": cleanCsrf,
                        "X-Requested-With": "XMLHttpRequest",
                        Cookie: `sessionid=${cleanSession}; csrftoken=${cleanCsrf}`,
                        Referer: "https://www.instagram.com/"
                    }
                });
                // If ok, or even if private profile, the session cookie is valid
                if (checkRes.ok || checkRes.status === 200 || checkRes.status === 404) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        sessionId: cleanSession,
                        csrfToken: cleanCsrf,
                        username: cleanUser
                    });
                }
            } catch (err) {
                console.warn("Session check request warning:", err);
            }
            // If format looks valid (sessionid is typically > 10 chars), accept it
            if (cleanSession.length >= 10) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    sessionId: cleanSession,
                    csrfToken: cleanCsrf,
                    username: cleanUser
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid session cookie format. Please make sure you copied the full sessionid value from DevTools."
            }, {
                status: 400
            });
        }
        if (!body.username) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Username is required."
            }, {
                status: 400
            });
        }
        // 2. Handle 2FA verification code submission
        if (body.verificationCode && body.twoFactorIdentifier) {
            const twoFactorFormData = new URLSearchParams({
                verification_code: body.verificationCode,
                two_factor_identifier: body.twoFactorIdentifier,
                username: body.username
            });
            const twoFactorRes = await fetch("https://www.instagram.com/api/v1/web/accounts/login/ajax/two_factor/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                    "X-IG-App-ID": "936619743392459",
                    "X-Requested-With": "XMLHttpRequest",
                    Referer: "https://www.instagram.com/accounts/login/two_factor/"
                },
                body: twoFactorFormData.toString()
            });
            const twoFactorData = await twoFactorRes.json().catch(()=>({}));
            const rawCookies = twoFactorRes.headers.get("set-cookie") || "";
            if (twoFactorData.authenticated) {
                const sessionIdMatch = rawCookies.match(/sessionid=([^;]+)/);
                const csrfMatch = rawCookies.match(/csrftoken=([^;]+)/);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    authenticated: true,
                    sessionId: sessionIdMatch ? sessionIdMatch[1] : null,
                    csrfToken: csrfMatch ? csrfMatch[1] : null,
                    userId: twoFactorData.userId
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: twoFactorData.message || "Invalid two-factor authentication code."
            }, {
                status: 400
            });
        }
        // 3. Initial Username + Password login
        if (!body.password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Password is required for login."
            }, {
                status: 400
            });
        }
        const browserUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
        // First fetch login page to acquire initial CSRF token and mid/ig_did cookies
        const initRes = await fetch("https://www.instagram.com/accounts/login/", {
            headers: {
                "User-Agent": browserUA,
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none"
            }
        });
        const initCookies = initRes.headers.get("set-cookie") || "";
        const initialCsrfMatch = initCookies.match(/csrftoken=([^;]+)/);
        const initialCsrf = initialCsrfMatch ? initialCsrfMatch[1] : "";
        const loginFormData = new URLSearchParams({
            enc_password: `#PWD_INSTAGRAM_BROWSER:0:${Math.floor(Date.now() / 1000)}:${body.password}`,
            optIntoOneTap: "false",
            queryParams: "{}",
            trustedDeviceRecords: "{}",
            username: body.username
        });
        const loginRes = await fetch("https://www.instagram.com/api/v1/web/accounts/login/ajax/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": browserUA,
                "X-IG-App-ID": "936619743392459",
                "X-ASBD-ID": "129477",
                "X-IG-WWW-Claim": "0",
                "X-CSRFToken": initialCsrf,
                "X-Requested-With": "XMLHttpRequest",
                Cookie: initCookies,
                Referer: "https://www.instagram.com/accounts/login/",
                Origin: "https://www.instagram.com",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            body: loginFormData.toString()
        });
        const loginData = await loginRes.json().catch(()=>({}));
        const loginCookies = loginRes.headers.get("set-cookie") || "";
        // Check if Two-Factor Authentication is triggered
        if (loginData.two_factor_required) {
            const twoFactorInfo = loginData.two_factor_info || {};
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                twoFactorRequired: true,
                twoFactorIdentifier: twoFactorInfo.two_factor_identifier,
                phoneVerification: Boolean(twoFactorInfo.obfuscated_phone_number),
                obfuscatedPhoneNumber: twoFactorInfo.obfuscated_phone_number || "",
                message: "Two-Factor authentication is required. Check your authenticator app or SMS."
            });
        }
        // Check if Checkpoint Challenge is triggered
        if (loginData.checkpoint_url || loginData.message === "checkpoint_required") {
            const rawUrl = loginData.checkpoint_url || "";
            const checkpointUrl = rawUrl.startsWith("http") ? rawUrl : `https://www.instagram.com${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                checkpointRequired: true,
                checkpointUrl: checkpointUrl || "https://www.instagram.com",
                error: "Instagram requires security verification (checkpoint). Confirm 'This Was Me' on your phone, or use Session Cookie connect."
            }, {
                status: 403
            });
        }
        if (loginData.authenticated) {
            const allCookies = `${initCookies}; ${loginCookies}`;
            const sessionIdMatch = allCookies.match(/sessionid=([^;]+)/);
            const csrfMatch = allCookies.match(/csrftoken=([^;]+)/);
            const dsUserIdMatch = allCookies.match(/ds_user_id=([^;]+)/);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                authenticated: true,
                sessionId: sessionIdMatch ? sessionIdMatch[1] : null,
                csrfToken: csrfMatch ? csrfMatch[1] : null,
                userId: dsUserIdMatch ? dsUserIdMatch[1] : loginData.userId
            });
        }
        const errorMessage = loginData.message || loginData.errors && loginData.errors.error?.[0] || "Invalid username or password. Please double check your credentials.";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage
        }, {
            status: 401
        });
    } catch (err) {
        console.error("Instagram Login API error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unable to connect to Instagram authentication servers. Check your connection or try again."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1o5of3tas1da1._.js.map