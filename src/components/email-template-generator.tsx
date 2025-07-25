"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Wand2,
  RefreshCw,
  Copy,
  Send,
  Mail,
  User,
  Building,
} from "lucide-react";

export default function EmailTemplateGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const placeholderTexts = [
    "Generate an email to request a refund for a defective product...",
    "Create a professional introduction email for a business partnership...",
    "Write a marketing email for a new product launch...",
    "Draft a follow-up email after a job interview...",
    "Compose an apology email for a service disruption...",
    "Generate a thank you email for a client meeting...",
    "Write a complaint email about poor service...",
    "Create a proposal email for a new project...",
  ];

  useEffect(() => {
    let currentIndex = 0;
    let currentText = "";
    let isDeleting = false;
    let charIndex = 0;

    const typeWriter = () => {
      const fullText = placeholderTexts[currentIndex];

      if (!isDeleting) {
        currentText = fullText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === fullText.length) {
          setTimeout(() => {
            isDeleting = true;
          }, 2000);
        }
      } else {
        currentText = fullText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % placeholderTexts.length;
        }
      }

      setPlaceholderText(currentText);
    };

    const interval = setInterval(typeWriter, isDeleting ? 50 : 100);
    return () => clearInterval(interval);
  }, []);

  const generateEmail = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your email.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation with a delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate email based on the prompt
      const emailContent = `Subject: Professional Email

Dear Recipient,

I hope this email finds you well.

${prompt}

I would appreciate your prompt attention to this matter. Please let me know if you need any additional information or have any questions.

Thank you for your time and consideration.

Best regards,
[Your Name]`;

      setGeneratedEmail(emailContent);

      toast({
        title: "Email generated!",
        description: "Your professional email template is ready.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

  const editEmail = () => {
    localStorage.setItem("generatedEmail", generatedEmail);
    router.push("/edit-email");
  };

  const resetForm = () => {
    setPrompt("");
    setGeneratedEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            AI Email Template{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Generator
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Simply describe what email you need, and our AI will craft the
            perfect professional message for you in seconds.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  Describe Your Email
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="prompt"
                      className="text-sm font-medium text-gray-700"
                    >
                      What email do you need?
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={placeholderText}
                      className="min-h-[200px] text-base p-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={generateEmail}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Email
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="px-6 py-3"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generated Email
                  </h2>
                  {generatedEmail && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="text-sm"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={editEmail}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Edit & Send
                      </Button>
                    </div>
                  )}
                </div>
                {generatedEmail ? (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {generatedEmail}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wand2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Enter your email description and click generate to create
                      your professional email template
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
