import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type GateRole } from "@/lib/gateStore";

interface RoleSelectorProps {
  role: GateRole;
  onRoleChange: (role: GateRole) => void;
}

export function RoleSelector({ role, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(value) => onRoleChange(value as GateRole)}>
        <SelectTrigger className="w-32" data-testid="select-role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPS" data-testid="select-item-ops">OPS</SelectItem>
          <SelectItem value="RISK" data-testid="select-item-risk">RISK</SelectItem>
        </SelectContent>
      </Select>
      <RoleBadge role={role} />
    </div>
  );
}

export function RoleBadge({ role }: { role: GateRole }) {
  return (
    <Badge 
      variant={role === "OPS" ? "default" : "secondary"}
      className={role === "OPS" ? "bg-blue-600 text-white" : "bg-amber-600 text-white"}
      data-testid={`badge-role-${role.toLowerCase()}`}
    >
      {role}
    </Badge>
  );
}
