import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Send, Users, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useSendAlert, useOccurrences } from '@/hooks/useOccurrences';

const samplePhones = [
  { phone: '+244 923 111 222', name: 'João Silva', province: 'Huambo' },
  { phone: '+244 923 333 444', name: 'Maria Santos', province: 'Huambo' },
  { phone: '+244 923 555 666', name: 'António Costa', province: 'Huíla' },
  { phone: '+244 923 777 888', name: 'Ana Ferreira', province: 'Benguela' },
  { phone: '+244 923 999 000', name: 'Pedro Nunes', province: 'Malanje' },
];

export function AlertSender() {
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>('');
  const [sentAlerts, setSentAlerts] = useState<{ phones: number; time: Date }[]>([]);

  const { data: occurrences } = useOccurrences();
  const sendAlert = useSendAlert();

  const handleTogglePhone = (phone: string) => {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    );
  };

  const handleSelectAll = () => {
    if (selectedPhones.length === samplePhones.length) {
      setSelectedPhones([]);
    } else {
      setSelectedPhones(samplePhones.map((p) => p.phone));
    }
  };

  const handleSendAlerts = async () => {
    if (!selectedOccurrence || selectedPhones.length === 0 || !customMessage) return;

    try {
      await sendAlert.mutateAsync({
        occurrence_id: selectedOccurrence,
        phones: selectedPhones,
        message: customMessage,
      });

      setSentAlerts((prev) => [...prev, { phones: selectedPhones.length, time: new Date() }]);
      setSelectedPhones([]);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending alerts:', error);
    }
  };

  const generateDefaultMessage = (occurrenceId: string) => {
    const occurrence = occurrences?.find((o) => o.id === occurrenceId);
    if (occurrence) {
      return `ALERTA SIGAFLO: ${occurrence.title}. ${occurrence.description?.slice(0, 100)}. Tome precauções necessárias.`;
    }
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enviar Alertas SMS
        </CardTitle>
        <CardDescription>
          Envie alertas outbound para agricultores sobre ocorrências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Occurrence Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ocorrência</label>
          <Select 
            value={selectedOccurrence} 
            onValueChange={(value) => {
              setSelectedOccurrence(value);
              setCustomMessage(generateDefaultMessage(value));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma ocorrência" />
            </SelectTrigger>
            <SelectContent>
              {occurrences?.map((occurrence) => (
                <SelectItem key={occurrence.id} value={occurrence.id}>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={occurrence.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {occurrence.severity}
                    </Badge>
                    {occurrence.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Destinatários</label>
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {selectedPhones.length === samplePhones.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </Button>
          </div>
          <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {samplePhones.map((contact) => (
              <div
                key={contact.phone}
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded"
              >
                <Checkbox
                  id={contact.phone}
                  checked={selectedPhones.includes(contact.phone)}
                  onCheckedChange={() => handleTogglePhone(contact.phone)}
                />
                <label
                  htmlFor={contact.phone}
                  className="flex-1 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {contact.province}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <Users className="h-3 w-3 inline mr-1" />
            {selectedPhones.length} destinatários selecionados
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem do Alerta</label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Escreva a mensagem de alerta..."
            className="min-h-24"
          />
          <p className="text-xs text-muted-foreground">
            {customMessage.length}/160 caracteres (1 SMS)
          </p>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendAlerts}
          disabled={!selectedOccurrence || selectedPhones.length === 0 || !customMessage || sendAlert.isPending}
          className="w-full"
        >
          {sendAlert.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Enviar Alertas ({selectedPhones.length})
        </Button>

        {/* Sent Alerts History */}
        {sentAlerts.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <span className="text-sm font-medium">Alertas Enviados</span>
            <div className="space-y-2 mt-2">
              {sentAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{alert.phones} alertas enviados</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {alert.time.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
