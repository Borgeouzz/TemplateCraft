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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Your Email
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={downloadAsText}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openSendDialog}>
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Generated Email</CardTitle>
              <CardDescription>
                Edit your email content below. You can copy it to your clipboard
                or download it when you're satisfied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="min-h-[400px] text-base font-mono"
                placeholder="Your email content will appear here..."
              />

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button onClick={copyToClipboard} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadAsText}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Text
                </Button>
                <Button
                  onClick={openSendDialog}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={generateAnother}
                  className="flex-1"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Another
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Want to generate more emails?
                </h3>
                <p className="text-gray-600 mb-4">
                  You've used your free email generation. Sign up to get
                  unlimited access to our AI email generator.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/sign-up">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Sign Up for Free
                    </Button>
                  </Link>
                  <Link href="#pricing">
                    <Button variant="outline">View Pricing</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
