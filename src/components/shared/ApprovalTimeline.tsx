import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface ApprovalStep {
  id: number;
  role: string;
  approverName: string;
  approverInitials: string;
  status: "approved" | "rejected" | "pending" | "not-reached";
  timestamp?: string;
  comment?: string;
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  currentStep: number;
}

export function ApprovalTimeline({ steps, currentStep }: ApprovalTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "border-green-600 bg-green-50";
      case "rejected":
        return "border-red-600 bg-red-50";
      case "pending":
        return "border-orange-600 bg-orange-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getConnectorColor = (index: number) => {
    if (index < currentStep) return "bg-green-600";
    if (index === currentStep) return "bg-orange-600";
    return "bg-gray-300";
  };

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-12 left-1/2 w-full h-1 ${getConnectorColor(index)}`}
                style={{ zIndex: 0 }}
              />
            )}

            {/* Step Card */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={`relative z-10 cursor-pointer transition-all hover:scale-105 ${
                    step.status === "pending" ? "animate-pulse" : ""
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full border-4 ${getStatusColor(
                      step.status
                    )} flex items-center justify-center mb-3 shadow-md`}
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-gray-900">
                        {step.approverInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    {getStatusIcon(step.status)}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-900">{step.role}</h4>
                    <Badge
                      variant={
                        step.status === "approved"
                          ? "default"
                          : step.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{step.approverName}</p>
                  {step.timestamp && (
                    <p className="text-gray-500">{step.timestamp}</p>
                  )}
                  {step.comment && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-[#0F67FF] mt-1" />
                        <div>
                          <p className="text-[#0F67FF] mb-1">Comment:</p>
                          <p className="text-gray-700">{step.comment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Step Label */}
            <div className="text-center">
              <p className="text-gray-900 mb-1">{step.role}</p>
              <p className="text-gray-500">{step.approverName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
