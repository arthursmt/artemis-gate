import { User, Phone, Mail, CreditCard, Building, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/types/gate";
import { formatValue, formatCurrency } from "@/lib/selectors";

interface MemberDetailsProps {
  member: Member;
}

export function MemberDetails({ member }: MemberDetailsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
            {member.isLeader && (
              <Badge variant="default" className="ml-auto">Leader</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Full Name" value={member.name} />
          <InfoRow label="Phone" value={member.phoneNumber} icon={<Phone className="h-4 w-4" />} />
          <InfoRow label="Email" value={member.email} icon={<Mail className="h-4 w-4" />} />
          <InfoRow label="National ID" value={member.nationalId} icon={<CreditCard className="h-4 w-4" />} />
          <InfoRow label="Date of Birth" value={member.dateOfBirth} icon={<Calendar className="h-4 w-4" />} />
          <InfoRow label="Gender" value={member.gender} />
          <InfoRow label="Address" value={member.address} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Loan Amount" value={formatCurrency(member.loanAmount)} isCurrency />
          <InfoRow label="Loan Purpose" value={member.loanPurpose} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Business Name" value={member.businessName} />
          <InfoRow label="Business Type" value={member.businessType} />
          <InfoRow label="Business Address" value={member.businessAddress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Monthly Income" value={formatCurrency(member.monthlyIncome)} isCurrency />
          <InfoRow label="Monthly Expenses" value={formatCurrency(member.monthlyExpenses)} isCurrency />
          <InfoRow label="Existing Loans" value={formatCurrency(member.existingLoans)} isCurrency />
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string | undefined;
  icon?: React.ReactNode;
  isCurrency?: boolean;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right" data-testid={`info-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        {formatValue(value)}
      </span>
    </div>
  );
}
