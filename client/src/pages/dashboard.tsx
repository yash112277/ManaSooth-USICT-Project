import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Assessment, Consultation, supportedLanguages } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "wouter";
import { Line } from "recharts";
import { format } from "date-fns";
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const { user, updateLanguageMutation } = useAuth();
  const [_, navigate] = useNavigate();

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ["/api/users", user?.id, "assessments"],
    enabled: !!user,
  });

  const { data: consultations } = useQuery<Consultation[]>({
    queryKey: ["/api/users", user?.id, "consultations"],
    enabled: !!user,
  });

  const latestAssessment = assessments?.[assessments.length - 1];
  const needsConsultation = latestAssessment?.consultationRecommended;

  const assessmentData = assessments?.map(assessment => ({
    date: format(new Date(assessment.createdAt), 'MMM dd'),
    who5: assessment.who5Score,
    gad7: assessment.gad7Score,
    phq9: assessment.phq9Score,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.username}
        </h1>
        <Select
          value={user?.preferredLanguage}
          onValueChange={(language) => updateLanguageMutation.mutate(language)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Latest Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {latestAssessment ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Completed on {format(new Date(latestAssessment.createdAt), 'PPP')}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">WHO-5</p>
                    <p className="text-2xl font-bold">{latestAssessment.who5Score}%</p>
                  </div>
                  <div>
                    <p className="font-medium">GAD-7</p>
                    <p className="text-2xl font-bold">{latestAssessment.gad7Score}/21</p>
                  </div>
                  <div>
                    <p className="font-medium">PHQ-9</p>
                    <p className="text-2xl font-bold">{latestAssessment.phq9Score}/27</p>
                  </div>
                </div>
                {needsConsultation && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      Professional consultation recommended
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => navigate("/consultation")}
                  className="w-full"
                  variant={needsConsultation ? "default" : "secondary"}
                >
                  Book Consultation
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No assessments yet</p>
                <Button onClick={() => navigate("/assessment")}>
                  Take Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              {consultations?.filter(c => c.status === 'pending').map((consultation) => (
                <div
                  key={consultation.id}
                  className="mb-4 p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(consultation.dateTime), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(consultation.dateTime), 'p')}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentData && assessmentData.length > 0 ? (
            <div className="h-[300px]">
              <Line
                data={assessmentData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <Line type="monotone" dataKey="who5" stroke="hsl(var(--primary))" />
                <Line type="monotone" dataKey="gad7" stroke="hsl(var(--destructive))" />
                <Line type="monotone" dataKey="phq9" stroke="hsl(var(--muted-foreground))" />
              </Line>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Complete multiple assessments to track your progress over time
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
