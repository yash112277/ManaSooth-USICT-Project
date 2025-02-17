import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Heart, ExternalLink } from "lucide-react";

export default function Resources() {
  const emergencyResources = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 free and confidential support",
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
    },
  ];

  const additionalResources = [
    {
      title: "SAMHSA Treatment Locator",
      description: "Find treatment facilities confidentially and anonymously",
      link: "https://findtreatment.samhsa.gov/",
    },
    {
      title: "NAMI HelpLine",
      description: "Mental health information, referrals and support",
      link: "https://www.nami.org/help",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Mental Health Resources</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-semibold">Emergency Contacts</h2>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              {emergencyResources.map((resource) => (
                <div key={resource.name} className="mb-6">
                  <h3 className="text-xl font-medium mb-2">{resource.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {resource.number}
                  </p>
                  <p className="text-muted-foreground">{resource.description}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Additional Resources</h2>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              {additionalResources.map((resource) => (
                <div key={resource.title} className="mb-6">
                  <h3 className="text-xl font-medium mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground mb-2">
                    {resource.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(resource.link, "_blank")}
                  >
                    Visit Website
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
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
