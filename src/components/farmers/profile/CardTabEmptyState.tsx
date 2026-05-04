import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, GraduationCap, Briefcase, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type IneligibleType = 'cooperative' | 'field_school' | 'company';

interface CardTabEmptyStateProps {
  farmerType: IneligibleType;
  farmerId: string;
}

const COPY: Record<IneligibleType, {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  altLabel: string;
  altTab: string;
}> = {
  cooperative: {
    Icon: Building2,
    title: 'Cooperativas não emitem cartão SIGAFLO',
    description:
      'O cartão SIGAFLO destina-se a produtores individuais e famílias. Para cooperativas, consulte os detalhes institucionais e a lista de membros associados.',
    altLabel: 'Ver detalhes da cooperativa',
    altTab: 'entity-details',
  },
  field_school: {
    Icon: GraduationCap,
    title: 'Escolas de Campo não emitem cartão SIGAFLO',
    description:
      'A ECA é uma entidade pedagógica e não tem cartão de produtor. Consulte os detalhes da escola e a lista de alunos/produtores em formação.',
    altLabel: 'Ver detalhes da ECA',
    altTab: 'entity-details',
  },
  company: {
    Icon: Briefcase,
    title: 'Cartão SIGAFLO indisponível para empresas',
    description:
      'Empresas e grandes produtores são identificados por NIF e certificado digital próprio. O cartão físico SIGAFLO é exclusivo de produtores individuais e famílias.',
    altLabel: 'Ver documentos da empresa',
    altTab: 'documents',
  },
};

export const CardTabEmptyState = ({ farmerType, farmerId }: CardTabEmptyStateProps) => {
  const { Icon, title, description, altLabel, altTab } = COPY[farmerType];

  return (
    <Card data-testid="card-tab-empty-state" className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-muted rounded-full blur-2xl opacity-50" />
          <div className="relative h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40" />
            <Icon className="absolute -bottom-1 -right-1 h-8 w-8 text-muted-foreground bg-background rounded-full p-1.5 border" />
          </div>
        </div>

        <Badge variant="outline" className="mb-3">
          <Info className="h-3 w-3 mr-1" />
          Funcionalidade não aplicável
        </Badge>

        <h3 className="text-lg font-semibold text-foreground mb-2 max-w-md">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>

        <Button asChild variant="outline" size="sm">
          <Link to={`/agricultores/${farmerId}?tab=${altTab}`}>
            {altLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
