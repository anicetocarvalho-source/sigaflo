import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
}

interface UseLocationCascadeProps {
  initialProvinceId?: string;
  initialMunicipalityId?: string;
  initialCommuneId?: string;
}

export function useLocationCascade(props?: UseLocationCascadeProps) {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [municipalities, setMunicipalities] = useState<Location[]>([]);
  const [communes, setCommunes] = useState<Location[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | undefined>(props?.initialProvinceId);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | undefined>(props?.initialMunicipalityId);
  const [selectedCommuneId, setSelectedCommuneId] = useState<string | undefined>(props?.initialCommuneId);
  const [loading, setLoading] = useState({
    provinces: true,
    municipalities: false,
    communes: false,
  });

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      if (!error && data) setProvinces(data);
      setLoading(prev => ({ ...prev, provinces: false }));
    };
    loadProvinces();
  }, []);

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      const loadMunicipalities = async () => {
        setLoading(prev => ({ ...prev, municipalities: true }));
        const { data, error } = await supabase
          .from('municipalities')
          .select('id, name')
          .eq('province_id', selectedProvinceId)
          .order('name');
        if (!error && data) setMunicipalities(data);
        setLoading(prev => ({ ...prev, municipalities: false }));
      };
      loadMunicipalities();
    } else {
      setMunicipalities([]);
      setCommunes([]);
    }
  }, [selectedProvinceId]);

  // Load communes when municipality changes
  useEffect(() => {
    if (selectedMunicipalityId) {
      const loadCommunes = async () => {
        setLoading(prev => ({ ...prev, communes: true }));
        const { data, error } = await supabase
          .from('communes')
          .select('id, name')
          .eq('municipality_id', selectedMunicipalityId)
          .order('name');
        if (!error && data) setCommunes(data);
        setLoading(prev => ({ ...prev, communes: false }));
      };
      loadCommunes();
    } else {
      setCommunes([]);
    }
  }, [selectedMunicipalityId]);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedMunicipalityId(undefined);
    setSelectedCommuneId(undefined);
    setMunicipalities([]);
    setCommunes([]);
  };

  const handleMunicipalityChange = (municipalityId: string) => {
    setSelectedMunicipalityId(municipalityId);
    setSelectedCommuneId(undefined);
    setCommunes([]);
  };

  const handleCommuneChange = (communeId: string) => {
    setSelectedCommuneId(communeId);
  };

  return {
    provinces,
    municipalities,
    communes,
    selectedProvinceId,
    selectedMunicipalityId,
    selectedCommuneId,
    loading,
    handleProvinceChange,
    handleMunicipalityChange,
    handleCommuneChange,
    setSelectedProvinceId,
    setSelectedMunicipalityId,
    setSelectedCommuneId,
  };
}
