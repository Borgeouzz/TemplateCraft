"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  Reply,
  Archive,
  Trash2,
  Star,
  Clock,
  User,
  Send,
  RefreshCw,
  ArrowLeft,
  Inbox as InboxIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/client";
import { sendEmailAction } from "../actions";
import { fetchGoogleMessages, fetchGoogleMessagesPage, fetchGoogleMessageFull, markEmailAsRead, resolveBackendUserIdByEmail } from "@/lib/email_service";
import { useSearchParams } from "next/navigation";

interface Email {
  id: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  content: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [selectedEmailHtml, setSelectedEmailHtml] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [backendUserId, setBackendUserId] = useState<number | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [emailsError, setEmailsError] = useState<string>("");
  const { toast } = useToast();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        // Try to get user name from user metadata or database
        const { data: userData } = await supabase
          .from("users")
          .select("name, full_name")
          .eq("user_id", user.id)
          .single();

        setUserName(userData?.name || userData?.full_name || "User");

        // If we don't already have a backend user id, try resolving it automatically by email
        const existingCookieUserId = getCookie("emailrag_user_id");
        const existingLocalUserId = typeof window !== 'undefined' ? localStorage.getItem("emailrag_user_id") : null;
        if (!existingCookieUserId && !existingLocalUserId) {
          const resolved = await resolveBackendUserIdByEmail(user.email);
          if (resolved) {
            try { document.cookie = `emailrag_user_id=${resolved}; path=/; samesite=lax`; } catch {}
            try { localStorage.setItem("emailrag_user_id", String(resolved)); } catch {}
            setBackendUserId(resolved);
            void fetchAndSetEmails(resolved);
          }
        }
      }
    };
    loadUserData();
  }, [supabase]);

  // Helpers
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
  };

  const getEmailRagBaseUrl = (): string => {
    return (
      process.env.NEXT_PUBLIC_EMAILRAG_API_URL || "http://localhost:8000/api/v1"
    );
  };

  // Optional: infinite scroll via IntersectionObserver
  useEffect(() => {
    const container = document.getElementById("email-scroll-container");
    if (!container) return;
    const onScroll = () => {
      const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 200;
      if (nearBottom && nextPageToken && !isLoadingMore) {
        void loadMoreEmails();
      }
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [nextPageToken, isLoadingMore, backendUserId]);

  const startGmailConnect = () => {
    try {
      const base = getEmailRagBaseUrl().replace(/\/api\/v1$/, "");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const callback = `${origin}/auth/callback?redirect_to=/inbox`;
      const url = `${base}/api/v1/auth/gmail/login?return_url=${encodeURIComponent(
        callback,
      )}`;
      window.location.href = url;
    } catch (e) {
      toast({ title: "Unable to start Google login", variant: "destructive" });
    }
  };

  // Load backend user id from cookie, then query string, then localStorage; then fetch Gmail emails
  useEffect(() => {
    let resolvedUserId: number | null = null;
    // 1) Cookie set by auth callback
    const cookieUserId = getCookie("emailrag_user_id");
    if (cookieUserId && !Number.isNaN(Number(cookieUserId))) {
      resolvedUserId = Number(cookieUserId);
      try { localStorage.setItem("emailrag_user_id", String(resolvedUserId)); } catch {}
    }
    // 2) Query param fallback
    if (!resolvedUserId) {
      const maybeUserIdParam = searchParams?.get("user_id");
      if (maybeUserIdParam && !Number.isNaN(Number(maybeUserIdParam))) {
        resolvedUserId = Number(maybeUserIdParam);
        try { localStorage.setItem("emailrag_user_id", String(resolvedUserId)); } catch {}
      }
    }
    // 3) LocalStorage fallback
    if (!resolvedUserId) {
      try {
        const fromStorage = localStorage.getItem("emailrag_user_id");
        if (fromStorage && !Number.isNaN(Number(fromStorage))) {
          resolvedUserId = Number(fromStorage);
        }
      } catch {}
    }

    if (resolvedUserId) {
      setBackendUserId(resolvedUserId);
      void fetchAndSetEmails(resolvedUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchAndSetEmails = async (userId: number) => {
    setIsLoadingEmails(true);
    setEmailsError("");
    try {
      const page = await fetchGoogleMessagesPage(userId, { maxResults: 20, q: "label:INBOX" });
      const mapped: Email[] = page.messages
        .map(transformGmailMessageToEmail)
        .filter(Boolean) as Email[];
      setEmails(mapped);
      setNextPageToken(page.nextPageToken || null);
      setSelectedEmail((prev) =>
        prev ? mapped.find((e) => e.id === prev.id) || null : null,
      );
    } catch (e: any) {
      setEmailsError(e?.message || "Failed to load emails");
      // Fallback: keep current emails (possibly mocks)
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadMoreEmails = async () => {
    if (!backendUserId || !nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchGoogleMessagesPage(backendUserId, { maxResults: 20, pageToken: nextPageToken, q: "label:INBOX" });
      const mapped: Email[] = page.messages
        .map(transformGmailMessageToEmail)
        .filter(Boolean) as Email[];
      setEmails((prev) => [...prev, ...mapped]);
      setNextPageToken(page.nextPageToken || null);
    } catch (e: any) {
      setEmailsError(e?.message || "Failed to load more emails");
    } finally {
      setIsLoadingMore(false);
    }
  };

  function transformGmailMessageToEmail(msg: any): Email | null {
    if (!msg) return null;

    const headers: Array<{ name: string; value: string }> =
      msg?.payload?.headers || [];
    const getHeader = (name: string): string => {
      const h = headers.find(
        (x) => x.name?.toLowerCase() === name.toLowerCase(),
      );
      return h?.value || "";
    };
    const fromHeader = msg.from || getHeader("From");
    const toHeader = msg.to || getHeader("To");
    const subjectHeader = (msg.subject || getHeader("Subject") || "(no subject)");
    const dateMs = Number(msg.internalDate || 0);
    const labelIds: string[] = msg.labelIds || [];

    // Extract name and email from From header if available: "Name <email@x>"
    let fromName: string | undefined = undefined;
    let fromEmail: string = fromHeader || "";
    const match = fromHeader.match(/^(.*)\s*<([^>]+)>$/);
    if (match) {
      fromName = match[1].replace(/"/g, "").trim();
      fromEmail = match[2].trim();
    }

    const decodeBase64UrlToUtf8 = (data?: string): string => {
      if (!data) return "";
      try {
        let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
        const padding = base64.length % 4;
        if (padding) base64 += "=".repeat(4 - padding);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder("utf-8").decode(bytes);
      } catch {
        return "";
      }
    };

    const flattenParts = (part: any): any[] => {
      if (!part) return [];
      if (part.parts && Array.isArray(part.parts)) {
        return part.parts.flatMap((p: any) => flattenParts(p));
      }
      return [part];
    };

    const payload = msg.payload || {};
    const leafParts = flattenParts(payload);
    let bodyData: string | undefined;
    const htmlPart = leafParts.find((p) => p.mimeType === "text/html");
    const textPart = leafParts.find((p) => p.mimeType === "text/plain");
    if (htmlPart?.body?.data) bodyData = htmlPart.body.data;
    else if (textPart?.body?.data) bodyData = textPart.body.data;
    else if (payload?.body?.data) bodyData = payload.body.data;

    // Prefer HTML; if only text, wrap as preformatted HTML
    let decodedBody = decodeBase64UrlToUtf8(bodyData);
    if (!decodedBody && msg.snippet) decodedBody = msg.snippet;
    if (!htmlPart && decodedBody) {
      decodedBody = `<pre style="white-space:pre-wrap;font-family:inherit">${decodedBody
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`;
    }

    const email: Email = {
      id: msg.id,
      from: fromEmail || fromHeader || "",
      fromName,
      to: toHeader || "",
      subject: subjectHeader,
      content: decodedBody,
      receivedAt: dateMs
        ? new Date(dateMs).toISOString()
        : new Date().toISOString(),
      isRead: !labelIds.includes("UNREAD"),
      isStarred: labelIds.includes("STARRED"),
      isArchived: false,
    };
    return email;
  }

  // Filter emails based on search and filter criteria
  useEffect(() => {
    let filtered = emails;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    switch (filter) {
      case "unread":
        filtered = filtered.filter((email) => !email.isRead);
        break;
      case "starred":
        filtered = filtered.filter((email) => email.isStarred);
        break;
      default:
        // Show all non-archived emails
        filtered = filtered.filter((email) => !email.isArchived);
    }

    // Sort by received date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );

    setFilteredEmails(filtered);
  }, [emails, searchTerm, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const markAsRead = (emailId: string) => {
    if (backendUserId) {
      void markEmailAsRead(emailId, backendUserId);
    }
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  };

  const toggleStar = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId
          ? { ...email, isStarred: !email.isStarred }
          : email,
      ),
    );
  };

  const archiveEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isArchived: true } : email,
      ),
    );
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    toast({
      title: "Email Archived",
      description: "The email has been moved to archive.",
    });
  };

  const deleteEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    toast({
      title: "Email Deleted",
      description: "The email has been permanently deleted.",
    });
  };

  const openReplyDialog = (email: Email) => {
    setReplySubject(`Re: ${email.subject}`);
    setReplyContent(
      `\n\n---\nOn ${new Date(email.receivedAt).toLocaleDateString()} at ${new Date(email.receivedAt).toLocaleTimeString()}, ${email.fromName || email.from} wrote:\n\n${email.content
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}`,
    );
    setIsReplyDialogOpen(true);
  };

  const sendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReply(true);
    try {
      const formData = new FormData();
      formData.append("toEmail", selectedEmail.from);
      formData.append("fromEmail", userEmail);
      formData.append("fromName", userName);
      formData.append("subject", replySubject);
      formData.append("emailContent", replyContent);
      formData.append("attachmentCount", "0");

      const result = await sendEmailAction(formData);

      if (result.success) {
        toast({
          title: "Reply Sent!",
          description: "Your reply has been sent successfully.",
        });
        setIsReplyDialogOpen(false);
        setReplyContent("");
        setReplySubject("");
      } else {
        toast({
          title: "Send Failed",
          description: result.error || "Failed to send reply.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const selectEmail = async (email: Email) => {
    setSelectedEmail(email);
    setIsLoadingContent(true);
    setSelectedEmailHtml("");
    if (!email.isRead) {
      markAsRead(email.id);
    }
    // Fetch full message to ensure subject/body are accurate
    if (backendUserId) {
      try {
        const full = await fetchGoogleMessageFull(backendUserId, email.id);
        const detailed = transformGmailMessageToEmail(full);
        if (detailed) {
          setSelectedEmail((prev) => (prev && prev.id === email.id ? { ...prev, ...detailed } : prev));
          setSelectedEmailHtml(detailed.content || email.content || "");
        } else {
          setSelectedEmailHtml(email.content || "");
        }
      } catch {
        setSelectedEmailHtml(email.content || "");
      } finally {
        setIsLoadingContent(false);
      }
    } else {
      setSelectedEmailHtml(email.content || "");
      setIsLoadingContent(false);
    }
  };

  const unreadCount = emails.filter(
    (email) => !email.isRead && !email.isArchived,
  ).length;
  const starredCount = emails.filter(
    (email) => email.isStarred && !email.isArchived,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardNavbar />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <InboxIcon className="w-8 h-8 text-blue-600" />
                Inbox
              </h1>
              <p className="text-gray-600">
                Manage your emails and reply directly from your dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {unreadCount} unread
              </Badge>
              <Badge variant="outline" className="text-sm">
                {starredCount} starred
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Email List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (backendUserId) {
                          void fetchAndSetEmails(backendUserId);
                        }
                      }}
                      className="items-center gap-1"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    <Button
                      variant={filter === "all" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === "unread" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("unread")}
                    >
                      Unread
                    </Button>
                    <Button
                      variant={filter === "starred" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("starred")}
                    >
                      Starred
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto" id="email-scroll-container">
                  {!backendUserId ? (
                    <div className="p-6 text-center text-gray-700">
                      <p className="mb-3">Collega il tuo account Gmail per visualizzare i messaggi.</p>
                      <Button onClick={startGmailConnect}>Collega Google</Button>
                    </div>
                  ) : emailsError ? (
                    <div className="p-6 text-center text-red-600 text-sm">{emailsError}</div>
                  ) : isLoadingEmails ? (
                    <div className="p-6 text-center text-gray-500 text-sm">Loading emails...</div>
                  ) : filteredEmails.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No emails found</p>
                    </div>
                  ) : (
                    <>
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => selectEmail(email)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedEmail?.id === email.id
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        } ${!email.isRead ? "bg-blue-25" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`text-sm truncate ${
                                  !email.isRead
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {email.fromName || email.from}
                              </p>
                              {email.isStarred && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                              {!email.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <p
                              className={`text-sm truncate mb-1 ${
                                !email.isRead
                                  ? "font-medium text-gray-900"
                                  : "text-gray-600"
                              }`}
                            >
                              {email.subject}
                            </p>
                            
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(email.receivedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {nextPageToken && (
                      <div className="p-4 flex justify-center">
                        <Button variant="outline" size="sm" onClick={loadMoreEmails} disabled={isLoadingMore} className="items-center gap-2">
                          {isLoadingMore && <RefreshCw className="w-4 h-4 animate-spin" />}
                          Load more
                        </Button>
                      </div>
                    )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-full">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedEmail.subject}
                        </h2>
                        {selectedEmail.isStarred && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {selectedEmail.fromName || selectedEmail.from}
                          </span>
                          <span className="text-gray-400">
                            &lt;{selectedEmail.from}&gt;
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(
                              selectedEmail.receivedAt,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(selectedEmail.id)}
                        className="text-gray-500 hover:text-yellow-600"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            selectedEmail.isStarred
                              ? "fill-current text-yellow-500"
                              : ""
                          }`}
                        />
                      </Button>
                      <Dialog
                        open={isReplyDialogOpen}
                        onOpenChange={setIsReplyDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReplyDialog(selectedEmail)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Reply to{" "}
                              {selectedEmail.fromName || selectedEmail.from}
                            </DialogTitle>
                            <DialogDescription>
                              Compose your reply message
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reply-subject">Subject</Label>
                              <Input
                                id="reply-subject"
                                value={replySubject}
                                onChange={(e) =>
                                  setReplySubject(e.target.value)
                                }
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reply-content">Message</Label>
                              <Textarea
                                id="reply-content"
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                className="min-h-[300px] bg-white"
                                placeholder="Type your reply here..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsReplyDialogOpen(false);
                                setReplyContent("");
                                setReplySubject("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={sendReply}
                              disabled={isSendingReply}
                              className="flex items-center gap-2"
                            >
                              {isSendingReply ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              {isSendingReply ? "Sending..." : "Send Reply"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveEmail(selectedEmail.id)}
                        className="text-gray-500 hover:text-green-600"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEmail(selectedEmail.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    {isLoadingContent ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-4/5" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    ) : (
                      <iframe
                        title="email-content"
                        sandbox=""
                        referrerPolicy="no-referrer"
                        srcDoc={`<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; color:#111827; line-height:1.5; padding:16px;} img{max-width:100%; height:auto;} table{max-width:100%;} pre{white-space:pre-wrap;} a{color:#2563eb;}</style></head><body>${selectedEmailHtml}</body></html>`}
                        style={{ width: '100%', height: '70vh', border: 'none', background: 'white' }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      Select an Email
                    </h3>
                    <p className="text-gray-500">
                      Choose an email from the list to view its content and
                      reply
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
