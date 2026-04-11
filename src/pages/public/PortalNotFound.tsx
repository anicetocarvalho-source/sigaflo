import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const PortalNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Página não encontrada</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        A página que procura não existe ou foi movida. Verifique o endereço e tente novamente.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/portal">
            <Home className="h-4 w-4 mr-2" />
            Portal Público
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default PortalNotFound;
