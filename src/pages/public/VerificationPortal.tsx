import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, QrCode, FileCheck, TreePine, Coffee, ArrowRight, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VerificationPortal = () => {
  const [searchCode, setSearchCode] = useState("");

  const verificationTypes = [
    {
      title: "Certificados Agrícolas",
      description: "Verifique a autenticidade de certificados de produção agrícola emitidos pelo MINAGRIF",
      icon: FileCheck,
      path: "/verificar/certificado",
      color: "bg-success/10 text-success",
      count: "12.450 certificados activos"
    },
    {
      title: "Licenças Florestais",
      description: "Consulte licenças de exploração, transporte e exportação de madeira",
      icon: TreePine,
      path: "/verificar/licenca",
      color: "bg-primary/10 text-primary",
      count: "3.280 licenças válidas"
    },
    {
      title: "Lotes de Café",
      description: "Rastreie lotes de café certificados com o sistema de semaforização INCA",
      icon: Coffee,
      path: "/verificar/cafe",
      color: "bg-accent/20 text-accent-foreground",
      count: "8.920 lotes rastreados"
    }
  ];

  const recentVerifications = [
    { code: "CERT-2024-00891", type: "Certificado", status: "valid", time: "há 2 min" },
    { code: "LIC-FL-2024-0234", type: "Licença", status: "valid", time: "há 5 min" },
    { code: "CAFE-LOT-2024-1892", type: "Café", status: "valid", time: "há 8 min" },
    { code: "CERT-2024-00456", type: "Certificado", status: "expired", time: "há 12 min" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <CheckCircle className="h-3 w-3" /> Válido
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            <AlertTriangle className="h-3 w-3" /> Expirado
          </span>
        );
      case "invalid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <XCircle className="h-3 w-3" /> Inválido
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="gradient-hero py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Portal de Verificação de Documentos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Verifique a autenticidade de certificados, licenças e rastreabilidade de produtos agro-florestais de Angola
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Digite o código do documento ou QR Code..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="h-12 pl-10 bg-background text-foreground"
                  />
                </div>
                <Button size="lg" className="h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90">
                  Verificar
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-sm text-primary-foreground/70">
                <Link to="/portal/verificar/scanner" className="flex items-center gap-1 hover:text-primary-foreground transition-colors">
                  <QrCode className="h-4 w-4" />
                  Escanear QR Code
                </Link>
                <span>•</span>
                <span>Exemplo: CERT-2024-00123</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Types */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-8 text-center text-2xl font-semibold text-foreground">
            Tipos de Verificação
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {verificationTypes.map((type) => (
              <Link key={type.path} to={type.path}>
                <Card className="card-interactive h-full cursor-pointer">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${type.color}`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{type.count}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Verifications */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-6 text-xl font-semibold text-foreground">
            Verificações Recentes
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentVerifications.map((item, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.code}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(item.status)}
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default VerificationPortal;
