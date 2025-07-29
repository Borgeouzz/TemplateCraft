import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Sparkles,
  Mail,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Target,
  Calendar,
  Eye,
  Copy,
  Wand2,
} from "lucide-react";
import Link from "next/link";

// Mock data for recent emails - in a real app, this would come from your database
const recentEmails = [
  {
    id: "1",
    subject: "Follow-up on our meeting",
    category: "Business",
    createdAt: "2024-01-15T10:30:00Z",
    wordCount: 45,
  },
  {
    id: "2",
    subject: "Request for refund - Order #12345",
    category: "Customer Service",
    createdAt: "2024-01-14T14:20:00Z",
    wordCount: 67,
  },
  {
    id: "3",
    subject: "Thank you for the interview opportunity",
    category: "Professional",
    createdAt: "2024-01-13T16:45:00Z",
    wordCount: 58,
  },
];

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
    <SubscriptionCheck>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DashboardNavbar />

        {/* Header Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Company Dashboard 📊
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor your team's email generation performance and productivity
              metrics
            </p>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Emails Generated
                </CardTitle>
                <Mail className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <p className="text-xs text-green-600">+18% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Time Saved (Hours)
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">156.8</div>
                <p className="text-xs text-purple-600">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Most Used Category
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">Business</div>
                <p className="text-xs text-gray-500">42% of all emails</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Daily Average
                </CardTitle>
                <Calendar className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">52</div>
                <p className="text-xs text-gray-500">emails per day</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate New Email
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Create professional email templates with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/generate">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Start Generating
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-700" />
                  Email History
                </CardTitle>
                <CardDescription>
                  View and manage all generated email templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/generated-emails">
                  <Button variant="outline">View History</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Emails */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-700" />
                    Recent Email Templates
                  </CardTitle>
                  <CardDescription>
                    Latest emails generated by your team
                  </CardDescription>
                </div>
                <Link href="/generated-emails">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {email.subject}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(email.category)}`}
                        >
                          {email.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(email.createdAt)}
                        </span>
                        <span>{email.wordCount} words</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-green-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubscriptionCheck>
  );
}
