"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Copy, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface EmailCategory {
  id: string;
  name: string;
  subcategories: { id: string; name: string; fields: FormField[] }[];
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "email";
  placeholder: string;
  required: boolean;
}

const emailCategories: EmailCategory[] = [
  {
    id: "legal",
    name: "Legal",
    subcategories: [
      {
        id: "refund",
        name: "Refund Request",
        fields: [
          {
            id: "customerName",
            label: "Customer Name",
            type: "text",
            placeholder: "John Doe",
            required: true,
          },
          {
            id: "orderNumber",
            label: "Order Number",
            type: "text",
            placeholder: "#12345",
            required: true,
          },
          {
            id: "refundReason",
            label: "Refund Reason",
            type: "textarea",
            placeholder: "Product defect, wrong item, etc.",
            required: true,
          },
          {
            id: "refundAmount",
            label: "Refund Amount",
            type: "text",
            placeholder: "$99.99",
            required: true,
          },
        ],
      },
      {
        id: "contract",
        name: "Contract Inquiry",
        fields: [
          {
            id: "clientName",
            label: "Client Name",
            type: "text",
            placeholder: "ABC Company",
            required: true,
          },
          {
            id: "contractType",
            label: "Contract Type",
            type: "text",
            placeholder: "Service Agreement",
            required: true,
          },
          {
            id: "inquiryDetails",
            label: "Inquiry Details",
            type: "textarea",
            placeholder: "Specific questions or concerns",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "business",
    name: "Business",
    subcategories: [
      {
        id: "introduction",
        name: "Introduction",
        fields: [
          {
            id: "yourName",
            label: "Your Name",
            type: "text",
            placeholder: "Jane Smith",
            required: true,
          },
          {
            id: "yourCompany",
            label: "Your Company",
            type: "text",
            placeholder: "XYZ Corp",
            required: true,
          },
          {
            id: "recipientName",
            label: "Recipient Name",
            type: "text",
            placeholder: "John Doe",
            required: true,
          },
          {
            id: "purpose",
            label: "Purpose of Introduction",
            type: "textarea",
            placeholder: "Partnership opportunity, collaboration, etc.",
            required: true,
          },
        ],
      },
      {
        id: "proposal",
        name: "Business Proposal",
        fields: [
          {
            id: "proposalTitle",
            label: "Proposal Title",
            type: "text",
            placeholder: "Marketing Campaign Proposal",
            required: true,
          },
          {
            id: "clientCompany",
            label: "Client Company",
            type: "text",
            placeholder: "Target Company",
            required: true,
          },
          {
            id: "proposalSummary",
            label: "Proposal Summary",
            type: "textarea",
            placeholder: "Brief overview of your proposal",
            required: true,
          },
          {
            id: "timeline",
            label: "Timeline",
            type: "text",
            placeholder: "4-6 weeks",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    subcategories: [
      {
        id: "newsletter",
        name: "Newsletter",
        fields: [
          {
            id: "companyName",
            label: "Company Name",
            type: "text",
            placeholder: "Your Company",
            required: true,
          },
          {
            id: "mainTopic",
            label: "Main Topic",
            type: "text",
            placeholder: "Product launch, company update, etc.",
            required: true,
          },
          {
            id: "keyHighlights",
            label: "Key Highlights",
            type: "textarea",
            placeholder: "Main points to highlight",
            required: true,
          },
          {
            id: "callToAction",
            label: "Call to Action",
            type: "text",
            placeholder: "Visit our website, sign up, etc.",
            required: true,
          },
        ],
      },
      {
        id: "promotion",
        name: "Promotional Email",
        fields: [
          {
            id: "productService",
            label: "Product/Service",
            type: "text",
            placeholder: "Product or service name",
            required: true,
          },
          {
            id: "discount",
            label: "Discount/Offer",
            type: "text",
            placeholder: "20% off, Buy one get one free",
            required: true,
          },
          {
            id: "validUntil",
            label: "Valid Until",
            type: "text",
            placeholder: "December 31st",
            required: true,
          },
          {
            id: "targetAudience",
            label: "Target Audience",
            type: "text",
            placeholder: "Existing customers, new prospects",
            required: true,
          },
        ],
      },
    ],
  },
];

export default function EmailTemplateGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const currentCategory = emailCategories.find(
    (cat) => cat.id === selectedCategory,
  );
  const currentSubcategory = currentCategory?.subcategories.find(
    (sub) => sub.id === selectedSubcategory,
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setFormData({});
    setGeneratedEmail("");
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setFormData({});
    setGeneratedEmail("");
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const generateEmail = async () => {
    if (!currentSubcategory) return;

    setIsGenerating(true);

    // Simulate AI generation with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate email based on category and form data
    let emailContent = "";

    if (selectedCategory === "legal" && selectedSubcategory === "refund") {
      emailContent = `Subject: Refund Request for Order ${formData.orderNumber}

Dear Customer Service Team,

I hope this email finds you well. I am writing to request a refund for my recent purchase.

Order Details:
- Customer Name: ${formData.customerName}
- Order Number: ${formData.orderNumber}
- Refund Amount: ${formData.refundAmount}

Reason for Refund:
${formData.refundReason}

I would appreciate your prompt attention to this matter. Please let me know if you need any additional information or documentation to process this refund.

Thank you for your time and assistance.

Best regards,
${formData.customerName}`;
    } else if (
      selectedCategory === "business" &&
      selectedSubcategory === "introduction"
    ) {
      emailContent = `Subject: Introduction - ${formData.yourCompany}

Dear ${formData.recipientName},

I hope this email finds you well. My name is ${formData.yourName}, and I am reaching out from ${formData.yourCompany}.

Purpose of Contact:
${formData.purpose}

I believe there could be valuable opportunities for collaboration between our organizations. I would welcome the chance to discuss this further at your convenience.

Would you be available for a brief call or meeting in the coming weeks? I'm happy to work around your schedule.

Thank you for your time, and I look forward to hearing from you.

Best regards,
${formData.yourName}
${formData.yourCompany}`;
    } else if (
      selectedCategory === "marketing" &&
      selectedSubcategory === "newsletter"
    ) {
      emailContent = `Subject: ${formData.mainTopic} - ${formData.companyName} Newsletter

Dear Valued Subscriber,

We're excited to share the latest updates from ${formData.companyName}!

📢 ${formData.mainTopic}

Key Highlights:
${formData.keyHighlights}

What's Next?
${formData.callToAction}

Thank you for being part of our community. We appreciate your continued support!

Best regards,
The ${formData.companyName} Team

---
You're receiving this email because you subscribed to our newsletter. If you no longer wish to receive these emails, you can unsubscribe at any time.`;
    } else {
      // Generic template
      emailContent = `Subject: ${currentSubcategory?.name} Email

Dear Recipient,

I hope this email finds you well.

${Object.entries(formData)
  .map(
    ([key, value]) =>
      `${currentSubcategory?.fields.find((f) => f.id === key)?.label}: ${value}`,
  )
  .join("\n")}

Thank you for your time.

Best regards,
[Your Name]`;
    }

    setGeneratedEmail(emailContent);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast({
        title: "Copied to clipboard!",
        description: "Email template has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setFormData({});
    setGeneratedEmail("");
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Email Template Generator
          </h1>
          <p className="text-xl text-gray-600">
            Create professional email templates in seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Configuration</CardTitle>
                <CardDescription>
                  Select category and fill in the details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="category">Email Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Selection */}
                {currentCategory && (
                  <div>
                    <Label htmlFor="subcategory">Email Type</Label>
                    <Select
                      value={selectedSubcategory}
                      onValueChange={handleSubcategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select email type" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategory.subcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dynamic Form Fields */}
                {currentSubcategory && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Template Details</h3>
                    {currentSubcategory.fields.map((field) => (
                      <div key={field.id}>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(field.id, e.target.value)
                            }
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(field.id, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {currentSubcategory && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={generateEmail}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      {isGenerating ? "Generating..." : "Generate Email"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Preview</CardTitle>
                    <CardDescription>Generated email template</CardDescription>
                  </div>
                  {generatedEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedEmail ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {generatedEmail}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      Select a category and fill in the details to generate your
                      email template
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
