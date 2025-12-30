import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Phone, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useSimulateSmsInbound } from '@/hooks/useOccurrences';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface SmsMessage {
  id: string;
  phone: string;
  message: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'processed';
  occurrenceCreated?: boolean;
}

export function SmsSimulator() {
  const [phone, setPhone] = useState('+244 923 456 789');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SmsMessage[]>([
    {
      id: '1',
      phone: '+244 912 345 678',
      message: 'Reporto praga severa na minha machamba. Área afetada: 5 hectares. Preciso de ajuda urgente.',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 3600000),
      status: 'processed',
      occurrenceCreated: true,
    },
    {
      id: '2',
      phone: '+244 912 345 678',
      message: 'Ocorrência registada. Número de registo: OCC-2024-0045. Assistência técnica será contactada.',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 3500000),
      status: 'delivered',
    },
  ]);

  const simulateSms = useSimulateSmsInbound();

  const handleSendSms = async () => {
    if (!message.trim()) return;

    const newMessage: SmsMessage = {
      id: Date.now().toString(),
      phone,
      message,
      direction: 'inbound',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    try {
      const result = await simulateSms.mutateAsync({ phone, message });
      
      // Update message status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id
            ? { ...m, status: 'processed', occurrenceCreated: true }
            : m
        )
      );

      // Add system response
      const responseMessage: SmsMessage = {
        id: (Date.now() + 1).toString(),
        phone,
        message: `Ocorrência registada automaticamente. Severidade: ${result.occurrence?.severity}. Código: ${result.occurrence?.id?.slice(0, 8)}`,
        direction: 'outbound',
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error simulating SMS:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Simulador SMS
        </CardTitle>
        <CardDescription>
          Simule a receção de SMS de agricultores para reporte de ocorrências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SMS Console */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">Console SMS</span>
            <Badge variant="outline" className="text-xs">
              Simulação
            </Badge>
          </div>
          
          <ScrollArea className="h-64 p-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.direction === 'inbound' ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.direction === 'inbound'
                        ? 'bg-primary/10 text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
                      <Phone className="h-3 w-3" />
                      {msg.phone}
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(msg.timestamp, 'HH:mm', { locale: pt })}
                    {msg.status === 'delivered' && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {msg.occurrenceCreated && (
                      <Badge variant="secondary" className="text-xs">
                        Ocorrência criada
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Número de telefone"
              className="w-48"
            />
            <span className="text-sm text-muted-foreground self-center">→ SIGAFLO</span>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva uma mensagem SMS simulada... (Ex: Seca grave na minha área, 10 hectares afetados)"
              className="flex-1"
            />
            <Button 
              onClick={handleSendSms} 
              disabled={!message.trim() || simulateSms.isPending}
              className="self-end"
            >
              {simulateSms.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Mensagens rápidas:</span>
          <div className="flex flex-wrap gap-2">
            {[
              'Seca severa na minha machamba',
              'Praga de gafanhotos detectada',
              'Inundação total da plantação',
              'Doença nas culturas de milho',
            ].map((template) => (
              <Button
                key={template}
                variant="outline"
                size="sm"
                onClick={() => setMessage(template)}
                className="text-xs"
              >
                {template}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
