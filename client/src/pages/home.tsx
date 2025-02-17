import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mental Health Assessment
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a conversation with our AI assistant to assess your mental well-being in a safe, confidential environment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15"
                alt="Peaceful conversation"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h2 className="text-2xl font-semibold">Conversational Assessment</h2>
              <p className="text-muted-foreground">
                Chat naturally with our AI assistant who will guide you through a comprehensive mental health assessment.
              </p>
              <Link href="/assessment">
                <Button className="w-full">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21"
                alt="Professional consultation"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h2 className="text-2xl font-semibold">Professional Consultation</h2>
              <p className="text-muted-foreground">
                Book a session with our mental health professionals for personalized guidance and support.
              </p>
              <Link href="/consultation">
                <Button className="w-full" variant="secondary">Book Consultation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8"
                alt="Support resources"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h2 className="text-2xl font-semibold">Support Resources</h2>
              <p className="text-muted-foreground">
                Access helpful resources, emergency contacts, and professional mental health services.
              </p>
              <Link href="/resources">
                <Button variant="outline" className="w-full">
                  View Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="p-6 bg-muted">
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Medical Disclaimer: This assessment is not a substitute for professional medical advice, diagnosis, or treatment.
              If you're experiencing a mental health emergency, please contact emergency services or call the National Suicide Prevention Lifeline at 988.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}