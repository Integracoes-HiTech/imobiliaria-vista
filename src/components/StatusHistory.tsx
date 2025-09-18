import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types";
import { Clock, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatusHistoryProps {
  property: Property;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ property }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success/10 text-success">Disponível</Badge>;
      case "negotiating":
        return <Badge className="bg-warning/10 text-warning">Em Negociação</Badge>;
      case "sold":
        return <Badge className="bg-primary/10 text-primary">Vendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {property.statusHistory && property.statusHistory.length > 0 ? (
            property.statusHistory
              .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
              .map((entry, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
              <div className="flex-shrink-0">
                {getStatusBadge(entry.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {entry.changed_by}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.changed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {entry.notes && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {entry.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
              ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum histórico de alterações encontrado.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusHistory;
