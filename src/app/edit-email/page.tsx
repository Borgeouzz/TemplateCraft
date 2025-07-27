"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Copy, Download, ArrowLeft, Wand2, Send, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendEmailAction } from "@/app/actions";

export default function EditEmailPage() {
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    toEmail: "",
    fromEmail: "",
    fromName: "",
    subject: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Get the generated email from localStorage
    const generatedEmail = localStorage.getItem("generatedEmail");
    if (generatedEmail) {
      setEmailContent(generatedEmail);
    } else {
      // If no email found, redirect back to home
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      toast({
        title: "Copied to clipboard!",
        description: "Email content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([emailContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "generated-email.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded!",
      description: "Email has been downloaded as a text file.",
    });
  };

  const generateAnother = () => {
    // Clear the stored email and redirect to home
    localStorage.removeItem("generatedEmail");
    router.push("/");
  };

  const extractSubjectFromEmail = (content: string) => {
    const lines = content.split("\n");
    const subjectLine = lines.find((line) => line.startsWith("Subject:"));
    return subjectLine ? subjectLine.replace("Subject:", "").trim() : "";
  };

  const handleSendEmail = async () => {
    if (!emailForm.toEmail || !emailForm.fromEmail || !emailForm.subject) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("toEmail", emailForm.toEmail);
      formData.append("fromEmail", emailForm.fromEmail);
      formData.append("fromName", emailForm.fromName);
      formData.append("subject", emailForm.subject);
      formData.append("emailContent", emailContent);

      const result = await sendEmailAction(formData);

      if (result.success) {
        toast({
          title: "Email sent!",
          description: result.message,
        });
        setIsDialogOpen(false);
        setEmailForm({ toEmail: "", fromEmail: "", fromName: "", subject: "" });
      } else {
        toast({
          title: "Failed to send email",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const openSendDialog = () => {
    const subject = extractSubjectFromEmail(emailContent);
    setEmailForm((prev) => ({ ...prev, subject }));
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  ✨ Edit Your Email
                </h1>
                <p className="text-sm text-gray-600">
                  Fine-tune your AI-generated email
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="bg-white/80 hover:bg-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={downloadAsText}
                className="bg-white/80 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openSendDialog}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Send Email
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details to send your email directly.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="toEmail">To Email *</Label>
                      <Input
                        id="toEmail"
                        type="email"
                        placeholder="recipient@example.com"
                        value={emailForm.toEmail}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            toEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fromEmail">From Email *</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="your@example.com"
                        value={emailForm.fromEmail}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            fromEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        placeholder="Your Name"
                        value={emailForm.fromName}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            fromName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Email subject"
                        value={emailForm.subject}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Email Editor - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Your Generated Email
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Edit your email content below. Make it perfect!
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="min-h-[500px] text-base font-mono border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                    placeholder="Your email content will appear here..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel - Takes up 1 column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={copyToClipboard}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={downloadAsText}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as Text
                  </Button>
                  <Button
                    onClick={openSendDialog}
                    className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateAnother}
                    className="w-full justify-start"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Another
                  </Button>
                </CardContent>
              </Card>

              {/* Email Stats */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Email Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Word Count:</span>
                    <span className="font-medium">
                      {emailContent.split(" ").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Characters:</span>
                    <span className="font-medium">{emailContent.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lines:</span>
                    <span className="font-medium">
                      {emailContent.split("\n").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reading Time:</span>
                    <span className="font-medium">
                      {Math.ceil(emailContent.split(" ").length / 200)} min
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-800">
                    💡 Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-700 space-y-2">
                  <p>• Keep your subject line under 50 characters</p>
                  <p>• Use a clear call-to-action</p>
                  <p>• Personalize when possible</p>
                  <p>• Proofread before sending</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
