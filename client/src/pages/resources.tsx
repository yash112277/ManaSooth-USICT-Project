import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Heart, ExternalLink, Globe, BookOpen } from "lucide-react";

export default function Resources() {
  const emergencyResources = [
    {
      name: "KIRAN (Government Initiative)",
      number: "1800-599-0019",
      description: "24/7 service available in 13 languages",
      type: "national"
    },
    {
      name: "Tele MANAS",
      number: "14416",
      description: "24/7 support in multiple regional languages",
      type: "national"
    },
    {
      name: "AASRA",
      number: "+91-22-27546669",
      description: "24/7 crisis support for suicidal and emotionally distressed individuals",
      type: "ngo"
    },
    {
      name: "Vandrevala Foundation",
      number: "9999666555",
      description: "Round-the-clock, multilingual counseling (calls and WhatsApp)",
      type: "ngo"
    },
    {
      name: "Mpower Minds",
      number: "1800-120-820050",
      description: "Available 24/7 in English, Hindi, and Marathi",
      type: "ngo"
    },
    {
      name: "iCALL",
      number: "022-25521111",
      description: "Professional counseling (Monday–Saturday, 10 AM–8 PM)",
      type: "ngo"
    },
    {
      name: "Sumaitri",
      number: "011-23389090 / +91-9315767849",
      description: "Mental health support and crisis intervention",
      type: "ngo"
    },
  ];

  const questionnairesInfo = [
    {
      title: "WHO-5 Well-Being Index",
      description: "A validated screening tool for measuring psychological well-being",
      link: "https://www.who-5.org/",
      citation: "World Health Organization (WHO)",
    },
    {
      title: "GAD-7 (Generalized Anxiety Disorder-7)",
      description: "A clinically validated tool for screening and measuring anxiety severity",
      link: "https://www.psychiatry.org/getmedia/e2b3ac78-02fa-41c2-8c80-4af146a55542/gad7",
      citation: "American Psychiatric Association",
    },
    {
      title: "PHQ-9 (Patient Health Questionnaire-9)",
      description: "A widely used and validated depression screening instrument",
      link: "https://www.apa.org/depression-guideline/patient-health-questionnaire.pdf",
      citation: "American Psychological Association",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Mental Health Resources
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-semibold">Indian Helpline Numbers</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                <div className="pb-2 border-b">
                  <h3 className="text-lg font-medium text-primary mb-2">Government Helplines</h3>
                  {emergencyResources
                    .filter(resource => resource.type === "national")
                    .map((resource) => (
                      <div key={resource.name} className="mb-4 p-4 bg-muted rounded-lg">
                        <h4 className="text-lg font-medium mb-1">{resource.name}</h4>
                        <p className="text-2xl font-bold text-primary mb-1">
                          {resource.number}
                        </p>
                        <p className="text-muted-foreground">{resource.description}</p>
                      </div>
                    ))}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">NGO Helplines</h3>
                  {emergencyResources
                    .filter(resource => resource.type === "ngo")
                    .map((resource) => (
                      <div key={resource.name} className="mb-4 p-4 bg-muted rounded-lg">
                        <h4 className="text-lg font-medium mb-1">{resource.name}</h4>
                        <p className="text-2xl font-bold text-primary mb-1">
                          {resource.number}
                        </p>
                        <p className="text-muted-foreground">{resource.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Assessment References</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              {questionnairesInfo.map((info) => (
                <div key={info.title} className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">{info.title}</h3>
                  <p className="text-muted-foreground mb-2">
                    {info.description}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Source: {info.citation}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(info.link, "_blank")}
                  >
                    View Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 p-6 bg-muted">
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            If you're experiencing thoughts of suicide or self-harm, please seek immediate help.
            These resources are available 24/7 and are staffed by caring professionals who want to help.
            All conversations are confidential and free of cost.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}