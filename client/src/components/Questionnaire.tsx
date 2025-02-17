import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { who5Questions, gad7Questions, phq9Questions } from "@shared/schema";
import type { WHO5Question, GAD7Question, PHQ9Question } from "@shared/schema";

type QuestionnaireType = "who5" | "gad7" | "phq9";

interface QuestionnaireProps {
  onComplete: (responses: {
    who5: Record<string, number>;
    gad7: Record<string, number>;
    phq9: Record<string, number>;
    who5Score: number;
    gad7Score: number;
    phq9Score: number;
  }) => void;
}

export function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [currentType, setCurrentType] = useState<QuestionnaireType>("who5");
  const [responses, setResponses] = useState<{
    who5: Record<string, number>;
    gad7: Record<string, number>;
    phq9: Record<string, number>;
  }>({
    who5: {},
    gad7: {},
    phq9: {},
  });

  const calculateScores = () => {
    const who5Score = Object.values(responses.who5).reduce((sum, val) => sum + val, 0) * 4;
    const gad7Score = Object.values(responses.gad7).reduce((sum, val) => sum + val, 0);
    const phq9Score = Object.values(responses.phq9).reduce((sum, val) => sum + val, 0);
    return { who5Score, gad7Score, phq9Score };
  };

  const getScoreInterpretation = (score: number, type: QuestionnaireType) => {
    if (type === 'who5') {
      if (score < 28) return "Probable depression";
      if (score < 50) return "Low well-being";
      return "Good well-being";
    } else if (type === 'gad7') {
      if (score >= 15) return "Severe anxiety";
      if (score >= 10) return "Moderate anxiety";
      if (score >= 5) return "Mild anxiety";
      return "Minimal anxiety";
    } else {
      if (score >= 20) return "Severe depression";
      if (score >= 15) return "Moderately severe depression";
      if (score >= 10) return "Moderate depression";
      if (score >= 5) return "Mild depression";
      return "Minimal depression";
    }
  };

  const getCurrentQuestions = () => {
    switch (currentType) {
      case "who5":
        return who5Questions;
      case "gad7":
        return gad7Questions;
      case "phq9":
        return phq9Questions;
    }
  };

  const getQuestionnaireTitle = () => {
    switch (currentType) {
      case "who5":
        return "WHO-5 Well-Being Index";
      case "gad7":
        return "GAD-7 Anxiety Assessment";
      case "phq9":
        return "PHQ-9 Depression Assessment";
    }
  };

  const getScaleOptions = () => {
    switch (currentType) {
      case "who5":
        return [
          { value: "0", label: "At no time" },
          { value: "1", label: "Some of the time" },
          { value: "2", label: "Less than half of the time" },
          { value: "3", label: "More than half of the time" },
          { value: "4", label: "Most of the time" },
          { value: "5", label: "All of the time" },
        ];
      case "gad7":
      case "phq9":
        return [
          { value: "0", label: "Not at all" },
          { value: "1", label: "Several days" },
          { value: "2", label: "More than half the days" },
          { value: "3", label: "Nearly every day" },
        ];
    }
  };

  const handleResponse = (question: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentType]: {
        ...prev[currentType],
        [question]: parseInt(value),
      },
    }));
  };

  const getCurrentProgress = () => {
    const currentResponses = responses[currentType];
    const currentQuestions = getCurrentQuestions();
    return (Object.keys(currentResponses).length / currentQuestions.length) * 100;
  };

  const canProceed = () => {
    const currentQuestions = getCurrentQuestions();
    return Object.keys(responses[currentType]).length === currentQuestions.length;
  };

  const handleNext = () => {
    if (currentType === "who5") {
      setCurrentType("gad7");
    } else if (currentType === "gad7") {
      setCurrentType("phq9");
    } else {
      const scores = calculateScores();
      onComplete({ ...responses, ...scores });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{getQuestionnaireTitle()}</h2>
        <Progress value={getCurrentProgress()} className="mb-6" />

        <div className="space-y-6">
          {getCurrentQuestions().map((question, index) => (
            <div key={question} className="space-y-2">
              <p className="font-medium">{index + 1}. {question}</p>
              <RadioGroup
                onValueChange={(value) => handleResponse(question, value)}
                value={responses[currentType][question]?.toString()}
              >
                {getScaleOptions().map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question}-${option.value}`} />
                    <Label htmlFor={`${question}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="mt-6 w-full"
        >
          {currentType === "phq9" ? "Complete Assessment" : "Next Section"}
        </Button>
      </CardContent>
    </Card>
  );
}