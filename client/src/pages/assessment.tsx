import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Message, type QuestionnaireResponse } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/hooks/lib/queryClient";
import { Questionnaire } from "@/components/Questionnaire";

type AssessmentStage = "questionnaire" | "scores" | "conversation";

export default function Assessment() {
  const [stage, setStage] = useState<AssessmentStage>("questionnaire");
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        history: messages,
        questionnaireResponses,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const newMessage: Message = {
        role: "assistant",
        content: data.response.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);

      if (data.response.emergency) {
        toast({
          title: "Emergency Resources",
          description: "Please seek immediate help. Call 988 for 24/7 crisis support.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateScores = (responses: QuestionnaireResponse) => {
    const who5 = Object.values(responses.who5).reduce((sum, val) => sum + val, 0) * 4;
    const gad7 = Object.values(responses.gad7).reduce((sum, val) => sum + val, 0);
    const phq9 = Object.values(responses.phq9).reduce((sum, val) => sum + val, 0);
    return { who5, gad7, phq9 };
  };

  const handleQuestionnaireComplete = (responses: QuestionnaireResponse) => {
    setQuestionnaireResponses(responses);
    setStage("scores");
    // Automatically start the conversation with AI about the scores
    const scores = calculateScores(responses);
    chatMutation.mutate("I've completed the assessment questionnaires. Could you help me understand my results?");
  };

  const handleStartConversation = () => {
    setStage("conversation");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  if (stage === "questionnaire") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Mental Health Assessment</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Please complete these standardized questionnaires. Your responses will help us better understand your mental health status.
          </p>
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        </div>
      </div>
    );
  }

  if (stage === "scores") {
    const scores = questionnaireResponses ? calculateScores(questionnaireResponses) : null;

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Assessment Results</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">WHO-5 Well-Being Index</h3>
                <p className="text-muted-foreground">Score: {scores?.who5}%</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">GAD-7 Anxiety Assessment</h3>
                <p className="text-muted-foreground">Score: {scores?.gad7}/21</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">PHQ-9 Depression Assessment</h3>
                <p className="text-muted-foreground">Score: {scores?.phq9}/27</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Our AI assistant will help you understand these results and provide personalized support.
              </p>
              <Button onClick={handleStartConversation} className="w-full">
                Continue to Conversation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <CardContent className="flex-1 p-4 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={message.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-muted text-foreground mr-12"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={chatMutation.isPending}
            />
            <Button onClick={handleSend} disabled={chatMutation.isPending}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}