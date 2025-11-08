import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner@2.0.3";

interface RequestFormProps {
  onSubmit: (data: RequestData) => void;
  userDepartment: string;
}

export interface RequestData {
  assetName: string;
  assetType: string;
  department: string;
  requestType: "new" | "maintenance" | "replacement";
  issueDescription: string;
  urgency: "low" | "medium" | "high" | "critical";
  amcDueDate?: Date;
  estimatedCost?: number;
  attachments?: File[];
}

export function RequestForm({ onSubmit, userDepartment }: RequestFormProps) {
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [department, setDepartment] = useState(userDepartment);
  const [requestType, setRequestType] = useState<"new" | "maintenance" | "replacement">("new");
  const [issueDescription, setIssueDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [amcDueDate, setAmcDueDate] = useState<Date>();
  const [estimatedCost, setEstimatedCost] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assetName || !assetType || !issueDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data: RequestData = {
      assetName,
      assetType,
      department,
      requestType,
      issueDescription,
      urgency,
      amcDueDate,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      attachments,
    };

    onSubmit(data);
    
    // Reset form
    setAssetName("");
    setAssetType("");
    setIssueDescription("");
    setUrgency("medium");
    setAmcDueDate(undefined);
    setEstimatedCost("");
    setAttachments([]);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Raise New Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="assetName">
                Asset Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="assetName"
                placeholder="e.g., X-Ray Machine"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
              />
            </div>

            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="assetType">
                Asset Type <span className="text-red-600">*</span>
              </Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical-equipment">Medical Equipment</SelectItem>
                  <SelectItem value="surgical-tools">Surgical Tools</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Equipment</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy/Medicines</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="electrical">Electrical Equipment</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Department</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy Department</SelectItem>
                  <SelectItem value="general">General Department</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Request Type */}
            <div className="space-y-2">
              <Label htmlFor="requestType">
                Request Type <span className="text-red-600">*</span>
              </Label>
              <Select
                value={requestType}
                onValueChange={(value: any) => setRequestType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Asset Purchase</SelectItem>
                  <SelectItem value="maintenance">Maintenance Required</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={urgency}
                onValueChange={(value: any) => setUrgency(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Routine</SelectItem>
                  <SelectItem value="medium">Medium - Within 1 week</SelectItem>
                  <SelectItem value="high">High - Within 48 hours</SelectItem>
                  <SelectItem value="critical">Critical - Immediate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AMC Due Date */}
            <div className="space-y-2">
              <Label>AMC Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {amcDueDate ? format(amcDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={amcDueDate}
                    onSelect={setAmcDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
              <Input
                id="estimatedCost"
                type="number"
                placeholder="e.g., 50000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
          </div>

          {/* Issue Description */}
          <div className="space-y-2">
            <Label htmlFor="issueDescription">
              Issue/Requirement Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="issueDescription"
              placeholder="Describe the issue, requirement, or justification in detail..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("attachments")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <p className="text-gray-500">Photos, PDFs, or documents</p>
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
