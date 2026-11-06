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
"[project]/src/app/api/instagram/action/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// In-memory cache for resolved user IDs during a session
const userIdCache = {};
async function resolveInstagramUserId(username, sessionId, csrfToken) {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
    if (userIdCache[cleanUsername]) {
        return userIdCache[cleanUsername];
    }
    const headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "X-IG-App-ID": "936619743392459"
    };
    if (sessionId && csrfToken) {
        headers["Cookie"] = `sessionid=${sessionId}; csrftoken=${csrfToken}`;
        headers["X-CSRFToken"] = csrfToken;
    }
    try {
        // Method 1: Web profile info
        const profileRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`, {
            headers
        });
        if (profileRes.ok) {
            const data = await profileRes.json();
            const id = data?.data?.user?.id;
            if (id) {
                userIdCache[cleanUsername] = String(id);
                return String(id);
            }
        }
        // Method 2: Topsearch fallback
        const searchRes = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${cleanUsername}`, {
            headers
        });
        if (searchRes.ok) {
            const data = await searchRes.json();
            const users = data?.users || [];
            const match = users.find((u)=>u?.user?.username?.toLowerCase() === cleanUsername);
            if (match?.user?.pk) {
                const id = String(match.user.pk);
                userIdCache[cleanUsername] = id;
                return id;
            }
        }
    } catch (err) {
        console.warn(`Failed to resolve user ID for ${username}:`, err);
    }
    return null;
}
async function POST(req) {
    try {
        const body = await req.json();
        const { targetUsername, action = "unfollow", sessionId, csrfToken } = body;
        if (!targetUsername) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Target username is required."
            }, {
                status: 400
            });
        }
        if (!sessionId || !csrfToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing active Instagram session. Please log in with your Instagram account or connect your session first.",
                needsAuth: true
            }, {
                status: 401
            });
        }
        // Resolve numerical user ID
        let userId = body.targetUserId;
        if (!userId) {
            userId = await resolveInstagramUserId(targetUsername, sessionId, csrfToken) || undefined;
        }
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Could not resolve Instagram user ID for @${targetUsername}. The account may be private or deactivated.`
            }, {
                status: 404
            });
        }
        const endpoint = action === "follow" ? `https://www.instagram.com/api/v1/friendships/create/${userId}/` : `https://www.instagram.com/api/v1/friendships/destroy/${userId}/`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                "X-IG-App-ID": "936619743392459",
                "X-CSRFToken": csrfToken,
                "X-Requested-With": "XMLHttpRequest",
                Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken}`,
                Referer: `https://www.instagram.com/${targetUsername}/`
            },
            body: new URLSearchParams({
                user_id: userId,
                radio_type: "wifi-none"
            }).toString()
        });
        const resData = await response.json().catch(()=>({}));
        // Handle Rate Limit / Action Block
        if (resData.message === "feedback_required" || resData.spam) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Instagram has placed a temporary rate-limit action block on this account. Please wait 24-48 hours before performing more automated actions.",
                actionBlocked: true
            }, {
                status: 429
            });
        }
        // Handle Checkpoint
        if (resData.message === "checkpoint_required") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Instagram requires security verification (checkpoint). Please open the Instagram app once on your phone to complete verification.",
                checkpointRequired: true
            }, {
                status: 403
            });
        }
        if (resData.status === "ok") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                action,
                targetUsername,
                targetUserId: userId,
                friendshipStatus: resData.friendship_status
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: resData.message || `Failed to ${action} @${targetUsername}. Instagram returned an error.`
        }, {
            status: response.status || 400
        });
    } catch (err) {
        console.error("Instagram Action API error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal error while attempting to communicate with Instagram. Please try again."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0gqpgj69ghn16._.js.map