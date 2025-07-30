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

// Mock email data - In a real app, this would come from your email provider API
const mockEmails: Email[] = [
  {
    id: "1",
    from: "john.doe@example.com",
    fromName: "John Doe",
    to: "user@example.com",
    subject: "Meeting Follow-up",
    content:
      "Hi there,\n\nI wanted to follow up on our meeting yesterday. Could we schedule a call for next week to discuss the project details?\n\nBest regards,\nJohn",
    receivedAt: "2024-01-15T10:30:00Z",
    isRead: false,
    isStarred: true,
    isArchived: false,
  },
  {
    id: "2",
    from: "support@company.com",
    fromName: "Company Support",
    to: "user@example.com",
    subject: "Your Order Confirmation #12345",
    content:
      "Dear Customer,\n\nThank you for your order! Your order #12345 has been confirmed and will be processed within 24 hours.\n\nOrder Details:\n- Product: Premium Package\n- Amount: $99.99\n- Delivery: 3-5 business days\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nSupport Team",
    receivedAt: "2024-01-14T14:20:00Z",
    isRead: true,
    isStarred: false,
    isArchived: false,
  },
  {
    id: "3",
    from: "newsletter@techblog.com",
    fromName: "Tech Blog",
    to: "user@example.com",
    subject: "Weekly Tech Newsletter - AI Trends",
    content:
      "Hello Tech Enthusiast!\n\nThis week's newsletter covers the latest trends in AI and machine learning:\n\n1. GPT-4 Updates and New Features\n2. AI in Healthcare: Recent Breakthroughs\n3. Machine Learning Best Practices\n\nRead more on our website.\n\nHappy coding!\nTech Blog Team",
    receivedAt: "2024-01-13T09:15:00Z",
    isRead: true,
    isStarred: false,
    isArchived: false,
  },
  {
    id: "4",
    from: "hr@mycompany.com",
    fromName: "HR Department",
    to: "user@example.com",
    subject: "Important: Policy Update",
    content:
      "Dear Team,\n\nWe're writing to inform you about an important update to our company policies, effective immediately.\n\nKey Changes:\n- Remote work policy updates\n- New vacation request process\n- Updated security guidelines\n\nPlease review the attached documents and confirm your understanding by replying to this email.\n\nThank you,\nHR Team",
    receivedAt: "2024-01-12T16:45:00Z",
    isRead: false,
    isStarred: false,
    isArchived: false,
  },
];

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

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
      }
    };
    loadUserData();
  }, [supabase]);

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
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isRead: true } : email,
      ),
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

  const selectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      markAsRead(email.id);
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
                  <div className="flex gap-2">
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
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                  {filteredEmails.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No emails found</p>
                    </div>
                  ) : (
                    filteredEmails.map((email) => (
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
                            <p className="text-xs text-gray-500 truncate">
                              {email.content.substring(0, 60)}...
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(email.receivedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
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
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                      {selectedEmail.content}
                    </pre>
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
