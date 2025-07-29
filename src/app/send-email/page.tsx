"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardNavbar from "@/components/dashboard-navbar";
import { sendEmailAction, generateEmailAction } from "../actions";
import { Mail, Wand2, Send, Copy, RefreshCw } from "lucide-react";

const emailCategories = {
  business: {
    name: "Business",
    subcategories: {
      introduction: "Introduction",
      followup: "Follow-up",
      proposal: "Proposal",
      meeting: "Meeting Request",
      thankyou: "Thank You",
    },
  },
  legal: {
    name: "Legal",
    subcategories: {
      refund: "Refund Request",
      complaint: "Complaint",
      inquiry: "Legal Inquiry",
      notice: "Legal Notice",
    },
  },
  personal: {
    name: "Personal",
    subcategories: {
      invitation: "Invitation",
      apology: "Apology",
      congratulations: "Congratulations",
      condolences: "Condolences",
    },
  },
  support: {
    name: "Support",
    subcategories: {
      technical: "Technical Support",
      billing: "Billing Inquiry",
      feedback: "Feedback",
      cancellation: "Cancellation Request",
    },
  },
};

export default function SendEmailPage() {
  const [formData, setFormData] = useState({
    toEmail: "",
    fromEmail: "",
    fromName: "",
    subject: "",
    emailContent: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState<"compose" | "generate">("compose");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateEmail = async () => {
    if (!selectedCategory || !selectedSubcategory) {
      toast({
        title: "Missing Information",
        description:
          "Please select a category and subcategory for email generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a professional ${emailCategories[selectedCategory as keyof typeof emailCategories].subcategories[selectedSubcategory as keyof (typeof emailCategories)[keyof typeof emailCategories]["subcategories"]]} email. Additional context: ${additionalContext || "None provided"}`;

      const formDataForGeneration = new FormData();
      formDataForGeneration.append("prompt", prompt);

      const result = await generateEmailAction(formDataForGeneration);

      if (result.success && result.email) {
        const emailLines = result.email.split("\n");
        const subjectLine = emailLines[0].replace("Subject: ", "");
        const emailBody = emailLines.slice(2).join("\n");

        setFormData((prev) => ({
          ...prev,
          subject: subjectLine,
          emailContent: emailBody,
        }));

        toast({
          title: "Email Generated!",
          description:
            "Your email has been generated successfully. You can edit it before sending.",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (
      !formData.toEmail ||
      !formData.fromEmail ||
      !formData.subject ||
      !formData.emailContent
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const formDataForSending = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataForSending.append(key, value);
      });

      const result = await sendEmailAction(formDataForSending);

      if (result.success) {
        toast({
          title: "Email Sent!",
          description:
            result.message || "Your email has been sent successfully.",
        });

        // Reset form
        setFormData({
          toEmail: "",
          fromEmail: "",
          fromName: "",
          subject: "",
          emailContent: "",
        });
        setSelectedCategory("");
        setSelectedSubcategory("");
        setAdditionalContext("");
      } else {
        toast({
          title: "Send Failed",
          description:
            result.error || "Failed to send email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.emailContent);
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Send Email
            </h1>
            <p className="text-gray-600">
              Compose and send emails directly from your dashboard
            </p>
          </div>

          {/* Mode Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={mode === "compose" ? "default" : "ghost"}
                onClick={() => setMode("compose")}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Compose Email
              </Button>
              <Button
                variant={mode === "generate" ? "default" : "ghost"}
                onClick={() => setMode("generate")}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </div>

          {/* Main Email Composition Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Details */}
            <div>
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Details
                  </CardTitle>
                  <CardDescription>
                    Configure your email settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email *</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.fromEmail}
                      onChange={(e) =>
                        handleInputChange("fromEmail", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="Your Name"
                      value={formData.fromName}
                      onChange={(e) =>
                        handleInputChange("fromName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toEmail">To Email *</Label>
                    <Input
                      id="toEmail"
                      type="email"
                      placeholder="recipient@email.com"
                      value={formData.toEmail}
                      onChange={(e) =>
                        handleInputChange("toEmail", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Content */}
            <div>
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Content
                  </CardTitle>
                  <CardDescription>
                    Write or generate your email content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailContent">Email Content *</Label>
                      {formData.emailContent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="emailContent"
                      placeholder="Write your email content here..."
                      value={formData.emailContent}
                      onChange={(e) =>
                        handleInputChange("emailContent", e.target.value)
                      }
                      className="resize-none min-h-[300px]"
                    />
                  </div>

                  <Button
                    onClick={sendEmail}
                    disabled={isSending}
                    className="w-full flex items-center gap-2"
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Generation Panel - Below main content */}
          {mode === "generate" && (
            <div className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Email Generator
                  </CardTitle>
                  <CardDescription>
                    Generate professional emails using AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Email Category *</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(emailCategories).map(
                            ([key, category]) => (
                              <SelectItem key={key} value={key}>
                                {category.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCategory && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Email Type *</Label>
                        <Select
                          value={selectedSubcategory}
                          onValueChange={setSelectedSubcategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select email type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(
                              emailCategories[
                                selectedCategory as keyof typeof emailCategories
                              ].subcategories,
                            ).map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="generate-btn" className="opacity-0">
                        Generate
                      </Label>
                      <Button
                        id="generate-btn"
                        onClick={generateEmail}
                        disabled={
                          isGenerating ||
                          !selectedCategory ||
                          !selectedSubcategory
                        }
                        className="w-full flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Email"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="context">Additional Context</Label>
                    <Textarea
                      id="context"
                      placeholder="Provide any specific details or context for your email..."
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg mt-4">
                    <p className="font-medium mb-1">💡 Tip:</p>
                    <p>
                      The generated email will appear in the main content area
                      above. You can edit it before sending!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
