"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  Mail,
  Eye,
  Copy,
  Download,
  ArrowLeft,
  Filter,
  Trash2,
  Star,
  Clock,
  Wand2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GeneratedEmail {
  id: string;
  subject: string;
  content: string;
  prompt: string;
  createdAt: string;
  category: string;
  isFavorite: boolean;
  wordCount: number;
}

// Mock data - In a real app, this would come from your database
const mockEmails: GeneratedEmail[] = [
  {
    id: "1",
    subject: "Follow-up on our meeting",
    content:
      "Dear John,\n\nI hope this email finds you well.\n\nI wanted to follow up on our meeting yesterday regarding the new project proposal. As discussed, I believe this initiative could significantly benefit our team's productivity.\n\nPlease let me know your thoughts and if you need any additional information.\n\nBest regards,\n[Your Name]",
    prompt:
      "Write a follow-up email after a business meeting about a project proposal",
    createdAt: "2024-01-15T10:30:00Z",
    category: "Business",
    isFavorite: true,
    wordCount: 45,
  },
  {
    id: "2",
    subject: "Request for refund - Order #12345",
    content:
      "Dear Customer Service,\n\nI am writing to request a refund for my recent purchase (Order #12345) due to a defective product.\n\nThe item arrived damaged and does not meet the quality standards described on your website. I have attached photos of the damage for your reference.\n\nI would appreciate a full refund processed to my original payment method.\n\nThank you for your assistance.\n\nSincerely,\n[Your Name]",
    prompt: "Generate a refund request email for a defective product",
    createdAt: "2024-01-14T14:20:00Z",
    category: "Customer Service",
    isFavorite: false,
    wordCount: 67,
  },
  {
    id: "3",
    subject: "Thank you for the interview opportunity",
    content:
      "Dear Ms. Johnson,\n\nThank you for taking the time to interview me yesterday for the Marketing Manager position at ABC Company.\n\nI enjoyed our conversation about the upcoming product launch and how my experience in digital marketing could contribute to your team's success.\n\nI'm very excited about the opportunity to join your team and look forward to hearing from you soon.\n\nBest regards,\n[Your Name]",
    prompt: "Write a thank you email after a job interview",
    createdAt: "2024-01-13T16:45:00Z",
    category: "Professional",
    isFavorite: true,
    wordCount: 58,
  },
  {
    id: "4",
    subject: "Exciting news about our new product launch!",
    content:
      "Hi there!\n\nWe're thrilled to announce the launch of our revolutionary new product that will transform how you work.\n\nFor the next 48 hours, we're offering an exclusive 30% discount to our valued customers like you.\n\nDon't miss out on this limited-time offer!\n\nClick here to learn more and claim your discount.\n\nBest,\nThe Team",
    prompt:
      "Create a marketing email for a new product launch with a discount offer",
    createdAt: "2024-01-12T09:15:00Z",
    category: "Marketing",
    isFavorite: false,
    wordCount: 52,
  },
  {
    id: "5",
    subject: "Apology for service disruption",
    content:
      "Dear Valued Customer,\n\nWe sincerely apologize for the service disruption you experienced yesterday between 2:00 PM and 4:30 PM.\n\nOur technical team has identified and resolved the issue to prevent future occurrences.\n\nAs an apology, we're crediting your account with a 20% discount on your next purchase.\n\nThank you for your patience and continued trust in our services.\n\nSincerely,\nCustomer Success Team",
    prompt: "Write an apology email for a service disruption with compensation",
    createdAt: "2024-01-11T11:00:00Z",
    category: "Customer Service",
    isFavorite: false,
    wordCount: 61,
  },
];

export default function GeneratedEmailsPage() {
  const [emails, setEmails] = useState<GeneratedEmail[]>(mockEmails);
  const [filteredEmails, setFilteredEmails] =
    useState<GeneratedEmail[]>(mockEmails);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedEmail, setSelectedEmail] = useState<GeneratedEmail | null>(
    null,
  );
  const { toast } = useToast();
  const router = useRouter();

  const categories = [
    "all",
    "Business",
    "Customer Service",
    "Professional",
    "Marketing",
  ];

  useEffect(() => {
    let filtered = emails;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.prompt.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (email) => email.category === selectedCategory,
      );
    }

    // Sort emails
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "favorites":
          return b.isFavorite === a.isFavorite ? 0 : b.isFavorite ? 1 : -1;
        default:
          return 0;
      }
    });

    setFilteredEmails(filtered);
  }, [emails, searchTerm, selectedCategory, sortBy]);

  const toggleFavorite = (id: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, isFavorite: !email.isFavorite } : email,
      ),
    );
    toast({
      title: "Updated!",
      description: "Email favorite status updated.",
    });
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== id));
    toast({
      title: "Deleted!",
      description: "Email has been removed from your history.",
    });
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const downloadEmail = (email: GeneratedEmail) => {
    const element = document.createElement("a");
    const file = new Blob([email.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${email.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded!",
      description: "Email has been downloaded as a text file.",
    });
  };

  const editEmail = (email: GeneratedEmail) => {
    localStorage.setItem("generatedEmail", email.content);
    router.push("/edit-email");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Business: "bg-blue-100 text-blue-800",
      "Customer Service": "bg-green-100 text-green-800",
      Professional: "bg-purple-100 text-purple-800",
      Marketing: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                  Email History
                </h1>
                <p className="text-gray-600">
                  Manage and revisit your generated emails
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate New Email
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails by subject, content, or prompt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="favorites">Favorites First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emails.length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emails.filter((e) => e.isFavorite).length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Words</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      emails.reduce((acc, e) => acc + e.wordCount, 0) /
                        emails.length,
                    )}
                  </p>
                </div>
                <Wand2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="space-y-4">
          {filteredEmails.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No emails found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start generating emails to see them here"}
                </p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Your First Email
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredEmails.map((email) => (
              <Card
                key={email.id}
                className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {email.subject}
                        </h3>
                        <Badge className={getCategoryColor(email.category)}>
                          {email.category}
                        </Badge>
                        {email.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {email.prompt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(email.createdAt)}
                        </span>
                        <span>{email.wordCount} words</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(email.id)}
                        className="text-gray-500 hover:text-yellow-600"
                      >
                        <Star
                          className={`w-4 h-4 ${email.isFavorite ? "fill-current text-yellow-500" : ""}`}
                        />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmail(email)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Mail className="w-5 h-5" />
                              {email.subject}
                            </DialogTitle>
                            <DialogDescription>
                              Generated on {formatDate(email.createdAt)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Original Prompt:
                              </h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {email.prompt}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Generated Email:
                              </h4>
                              <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                                {email.content}
                              </pre>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => copyToClipboard(email.content)}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                              <Button
                                onClick={() => downloadEmail(email)}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                onClick={() => editEmail(email)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Edit & Send
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(email.content)}
                        className="text-gray-500 hover:text-green-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadEmail(email)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEmail(email.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
