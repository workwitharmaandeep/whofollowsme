import { NextRequest, NextResponse } from "next/server";

interface ActionRequestBody {
  targetUsername: string;
  action: "follow" | "unfollow";
  sessionId?: string;
  csrfToken?: string;
  targetUserId?: string;
}

// In-memory cache for resolved user IDs during a session
const userIdCache: Record<string, string> = {};

async function resolveInstagramUserId(
  username: string,
  sessionId?: string,
  csrfToken?: string
): Promise<string | null> {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
  if (userIdCache[cleanUsername]) {
    return userIdCache[cleanUsername];
  }

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "X-IG-App-ID": "936619743392459",
  };

  if (sessionId && csrfToken) {
    headers["Cookie"] = `sessionid=${sessionId}; csrftoken=${csrfToken}`;
    headers["X-CSRFToken"] = csrfToken;
  }

  try {
    // Method 1: Web profile info
    const profileRes = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`,
      { headers }
    );

    if (profileRes.ok) {
      const data = await profileRes.json();
      const id = data?.data?.user?.id;
      if (id) {
        userIdCache[cleanUsername] = String(id);
        return String(id);
      }
    }

    // Method 2: Topsearch fallback
    const searchRes = await fetch(
      `https://www.instagram.com/web/search/topsearch/?context=blended&query=${cleanUsername}`,
      { headers }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      const users = data?.users || [];
      const match = users.find(
        (u: { user: { username: string; pk: string } }) =>
          u?.user?.username?.toLowerCase() === cleanUsername
      );
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

export async function POST(req: NextRequest) {
  try {
    const body: ActionRequestBody = await req.json();
    const { targetUsername, action = "unfollow", sessionId, csrfToken } = body;

    if (!targetUsername) {
      return NextResponse.json(
        { error: "Target username is required." },
        { status: 400 }
      );
    }

    if (!sessionId || !csrfToken) {
      return NextResponse.json(
        {
          error:
            "Missing active Instagram session. Please log in with your Instagram account or connect your session first.",
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    // Resolve numerical user ID
    let userId = body.targetUserId;
    if (!userId) {
      userId = (await resolveInstagramUserId(targetUsername, sessionId, csrfToken)) || undefined;
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: `Could not resolve Instagram user ID for @${targetUsername}. The account may be private or deactivated.`,
        },
        { status: 404 }
      );
    }

    const endpoint =
      action === "follow"
        ? `https://www.instagram.com/api/v1/friendships/create/${userId}/`
        : `https://www.instagram.com/api/v1/friendships/destroy/${userId}/`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "X-IG-App-ID": "936619743392459",
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest",
        Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken}`,
        Referer: `https://www.instagram.com/${targetUsername}/`,
      },
      body: new URLSearchParams({
        user_id: userId,
        radio_type: "wifi-none",
      }).toString(),
    });

    const resData = await response.json().catch(() => ({}));

    // Handle Rate Limit / Action Block
    if (resData.message === "feedback_required" || resData.spam) {
      return NextResponse.json(
        {
          error:
            "Instagram has placed a temporary rate-limit action block on this account. Please wait 24-48 hours before performing more automated actions.",
          actionBlocked: true,
        },
        { status: 429 }
      );
    }

    // Handle Checkpoint
    if (resData.message === "checkpoint_required") {
      return NextResponse.json(
        {
          error:
            "Instagram requires security verification (checkpoint). Please open the Instagram app once on your phone to complete verification.",
          checkpointRequired: true,
        },
        { status: 403 }
      );
    }

    if (resData.status === "ok") {
      return NextResponse.json({
        success: true,
        action,
        targetUsername,
        targetUserId: userId,
        friendshipStatus: resData.friendship_status,
      });
    }

    return NextResponse.json(
      {
        error:
          resData.message ||
          `Failed to ${action} @${targetUsername}. Instagram returned an error.`,
      },
      { status: response.status || 400 }
    );
  } catch (err) {
    console.error("Instagram Action API error:", err);
    return NextResponse.json(
      {
        error:
          "Internal error while attempting to communicate with Instagram. Please try again.",
      },
      { status: 500 }
    );
  }
}

