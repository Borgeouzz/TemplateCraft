"use client";

import { useState } from "react";
import * as React from "react";
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
import {
  sendEmailAction,
  generateEmailAction,
  saveContactAction,
} from "../actions";
import { createClient } from "../../../supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Wand2,
  Send,
  Copy,
  RefreshCw,
  Paperclip,
  X,
  UserPlus,
  Users,
} from "lucide-react";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  // Load user email on component mount
  React.useEffect(() => {
    const loadUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setFormData((prev) => ({ ...prev, fromEmail: user.email }));
      }
    };
    loadUserEmail();
  }, [supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Check file size (limit to 10MB per file)
      const oversizedFiles = newFiles.filter(
        (file) => file.size > 10 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
        toast({
          title: "File Too Large",
          description: "Please select files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

      // Add attachments to form data
      attachments.forEach((file, index) => {
        formDataForSending.append(`attachment_${index}`, file);
      });
      formDataForSending.append(
        "attachmentCount",
        attachments.length.toString(),
      );

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
        setAttachments([]);
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

  const saveContact = async () => {
    if (!formData.toEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter an email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingContact(true);
    try {
      const formDataForContact = new FormData();
      formDataForContact.append("email", formData.toEmail);
      formDataForContact.append("name", contactName);

      const result = await saveContactAction(formDataForContact);

      if (result.success) {
        toast({
          title: "Contact Saved!",
          description: result.message || "Contact has been saved successfully.",
        });
        setIsContactDialogOpen(false);
        setContactName("");
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save contact.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingContact(false);
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="toEmail">To Email *</Label>
                      {formData.toEmail && (
                        <Dialog
                          open={isContactDialogOpen}
                          onOpenChange={setIsContactDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <UserPlus className="h-3 w-3" />
                              Save Contact
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Save Contact</DialogTitle>
                              <DialogDescription>
                                Save this email address to your contact list for
                                easy access.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input
                                  id="contact-email"
                                  value={formData.toEmail}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contact-name">
                                  Name (Optional)
                                </Label>
                                <Input
                                  id="contact-name"
                                  placeholder="Contact name"
                                  value={contactName}
                                  onChange={(e) =>
                                    setContactName(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsContactDialogOpen(false);
                                  setContactName("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={saveContact}
                                disabled={isSavingContact}
                                className="flex items-center gap-2"
                              >
                                {isSavingContact ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                                {isSavingContact ? "Saving..." : "Save Contact"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments</Label>
                    <div className="space-y-2">
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum file size: 10MB per file
                      </p>

                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Attached Files ({attachments.length}):
                          </p>
                          <div className="space-y-1">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
