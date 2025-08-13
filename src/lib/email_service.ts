export async function sendEmailRequest(prompt: string): Promise<string> {
    const response = await fetch("http://localhost:8000/generate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: prompt }),
    });
    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status}`);
    }
    const data = await response.json();
    return data.email;
}

/**
 * Fetch raw Gmail messages for a given app user id from the EmailRAG backend
 */
export async function fetchGoogleMessages(
  userId: number,
  maxResults: number = 20,
  baseUrl?: string,
): Promise<any[]> {
  const base =
    baseUrl || process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1";
  const url = `${base}/emails?user_id=${encodeURIComponent(userId)}&max_results=${encodeURIComponent(maxResults)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch messages (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data?.messages || [];
}

export async function markEmailAsRead(emailId: string, userId: number, baseUrl?: string): Promise<boolean> {
  const base =
    baseUrl || process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1";
  const url = `${base}/emails/${emailId}?user_id=${userId}`;
  const res = await fetch(url, { method: "PUT" });
  return res.ok;
}

export async function resolveBackendUserIdByEmail(
  email: string,
  baseUrl?: string,
): Promise<number | null> {
  const base =
    baseUrl || process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1";
  const url = `${base}/auth/user/by-email?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data?.id === "number" ? data.id : null;
}

export interface GmailPageResult {
  messages: any[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export async function fetchGoogleMessagesPage(
  userId: number,
  options?: {
    maxResults?: number;
    pageToken?: string | null;
    q?: string | null;
    labelIds?: string[] | null;
    baseUrl?: string;
  },
): Promise<GmailPageResult> {
  const base =
    options?.baseUrl || process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1";
  const params: string[] = [];
  params.push(`max_results=${encodeURIComponent(options?.maxResults ?? 20)}`);
  if (options?.pageToken) params.push(`page_token=${encodeURIComponent(options.pageToken)}`);
  if (options?.q) params.push(`q=${encodeURIComponent(options.q)}`);
  if (options?.labelIds?.length) {
    params.push(`label_ids=${encodeURIComponent(options.labelIds.join(","))}`);
  }
  const url = `${base}/emails/google/${encodeURIComponent(userId)}?${params.join("&")}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch messages page (${res.status}): ${text}`);
  }
  const data = await res.json();
  return {
    messages: data?.messages || [],
    nextPageToken: data?.nextPageToken,
    resultSizeEstimate: data?.resultSizeEstimate,
  };
}

export async function fetchGoogleMessageFull(
  userId: number,
  messageId: string,
  baseUrl?: string,
) {
  const base = baseUrl || process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1";
  const url = `${base}/emails/google/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch message (${res.status}): ${text}`);
  }
  return res.json();
}