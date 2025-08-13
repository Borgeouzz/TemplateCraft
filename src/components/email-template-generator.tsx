"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { sendEmailRequest } from "@/lib/email_service";
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
      // Generate email based on the prompt
      const emailContent = await sendEmailRequest(prompt);

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

        <div className="max-w-7xl mx-auto">
          {/* Main Email Generation Area */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Generated Email Preview - Primary Focus */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Generated Email
                  </h2>
                  {generatedEmail && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Button
                        onClick={editEmail}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Edit & Send
                      </Button>
                    </div>
                  )}
                </div>
                {generatedEmail ? (
                  <div className="bg-gray-50 p-6 rounded-lg border min-h-[500px]">
                    <pre className="whitespace-pre-wrap text-base text-gray-800 font-mono leading-relaxed">
                      {generatedEmail}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 min-h-[500px] flex flex-col justify-center">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Wand2 className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-3">
                      Ready to Generate
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Enter your email description in the sidebar and click
                      generate to create your professional email template
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Section - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                      className="min-h-[200px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={generateEmail}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
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
                    className="w-full py-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
