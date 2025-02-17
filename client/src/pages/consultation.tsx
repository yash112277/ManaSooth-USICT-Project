import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Professional, Consultation } from "@shared/schema";

export default function ConsultationBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedProfessional, setSelectedProfessional] = useState<number>();
  const { toast } = useToast();

  const { data: professionals } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const { data: availability } = useQuery<any>({
    queryKey: [`/api/professionals/${selectedProfessional}/availability`],
    enabled: !!selectedProfessional,
  });

  const bookingMutation = useMutation({
    mutationFn: async (consultation: Partial<Consultation>) => {
      const res = await apiRequest("POST", "/api/consultations", consultation);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Consultation Booked",
        description: "Your consultation has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !availability) return [];
    const day = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return availability
      .filter((slot: any) => slot.day === day)
      .map((slot: any) => ({
        start: slot.startTime,
        end: slot.endTime,
      }));
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedProfessional) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a professional, date, and time slot.",
        variant: "destructive",
      });
      return;
    }

    const dateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    bookingMutation.mutate({
      professionalId: selectedProfessional.toString(),
      userId: "demo-user", // Replace with actual user ID from auth
      dateTime: dateTime.toISOString(),
      status: "pending",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Book a Consultation</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Professional</h2>
            <Select
              value={selectedProfessional?.toString()}
              onValueChange={(value) => setSelectedProfessional(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a professional" />
              </SelectTrigger>
              <SelectContent>
                {professionals?.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.name} - {professional.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProfessional && professionals && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Professional Details</h3>
                {professionals.find(p => p.id === selectedProfessional)?.bio}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
              className="mb-4"
            />

            {selectedDate && (
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTimeSlots().map((slot: any) => (
                    <SelectItem key={slot.start} value={slot.start}>
                      {slot.start} - {slot.end}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleBooking}
        disabled={bookingMutation.isPending}
        className="mt-8 w-full max-w-md mx-auto"
      >
        {bookingMutation.isPending ? "Booking..." : "Book Consultation"}
      </Button>
    </div>
  );
}
