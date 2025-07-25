"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Wand2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [prompt, setPrompt] = useState("");
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate an email.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has used their free generation
    const freeGenerationUsed = localStorage.getItem("freeEmailGenerated");
    if (freeGenerationUsed) {
      toast({
        title: "Free generation used",
        description:
          "You've already used your free email generation. Please sign up for more.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const generatedEmail = `Subject: ${prompt.split(" ").slice(0, 5).join(" ")}

Dear Recipient,

I hope this email finds you well.

${prompt}

I would appreciate your prompt attention to this matter. Please let me know if you need any additional information.

Thank you for your time and consideration.

Best regards,
[Your Name]`;

      // Mark free generation as used
      localStorage.setItem("freeEmailGenerated", "true");
      localStorage.setItem("generatedEmail", generatedEmail);

      // Redirect to edit page
      router.push("/edit-email");
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

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Generate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Professional
              </span>{" "}
              Email Templates with AI
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Simply describe what email you need, and our AI will craft the
              perfect professional message for you in seconds.
            </p>

            {/* Prompt Input Section */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholderText}
                  className="min-h-[120px] text-lg p-6 border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none"
                  disabled={isGenerating}
                />
                <div className="absolute bottom-4 right-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                ✨ Get 1 free email generation, then sign up for unlimited
                access
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Generating Templates
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Multiple email categories</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>AI-powered generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Copy & format instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
