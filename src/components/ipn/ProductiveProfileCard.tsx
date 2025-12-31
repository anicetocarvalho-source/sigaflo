import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  FileCheck, 
  Wheat,
  Eye
} from 'lucide-react';
import { ProductiveProfile } from '@/hooks/useIPN';
import { ReputationScore } from './ReputationScore';

interface ProductiveProfileCardProps {
  profile: ProductiveProfile;
  onViewDetails: (id: string) => void;
}

export function ProductiveProfileCard({ profile, onViewDetails }: ProductiveProfileCardProps) {
  const getTypeIcon = () => {
    switch (profile.type) {
      case 'cooperative':
        return <Users className="h-5 w-5" />;
      case 'company':
        return <Building2 className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (profile.type) {
      case 'cooperative':
        return 'Cooperativa';
      case 'company':
        return 'Empresa';
      default:
        return 'Individual';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{profile.name}</CardTitle>
              {profile.tradeName && (
                <p className="text-sm text-muted-foreground">{profile.tradeName}</p>
              )}
            </div>
          </div>
          <ReputationScore score={profile.overallScore} size="sm" showLabel={false} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{getTypeLabel()}</Badge>
          {profile.isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
          ) : (
            <Badge variant="secondary">Inactivo</Badge>
          )}
          {profile.registrationNumber && (
            <Badge variant="secondary">{profile.registrationNumber}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {profile.province && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.province}</span>
            </div>
          )}
          {profile.registrationDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(profile.registrationDate).getFullYear()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wheat className="h-4 w-4" />
            <span>{profile.totalProductionRecords} registos</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileCheck className="h-4 w-4" />
            <span>{profile.activeCertificates}/{profile.totalCertificates} cert.</span>
          </div>
        </div>

        {profile.totalArea > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Área total:</span>{' '}
            <span className="font-medium">{profile.totalArea.toLocaleString()} ha</span>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewDetails(profile.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Perfil Completo
        </Button>
      </CardContent>
    </Card>
  );
}
