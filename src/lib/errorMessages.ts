// =============================================================================
// SIGAFLO - Mensagens de Erro Personalizadas por Tipo
// =============================================================================

/**
 * Mapeia erros de API/Supabase para mensagens amigáveis em português.
 */

const supabaseErrorMap: Record<string, string> = {
  // Auth
  'Invalid login credentials': 'Email ou palavra-passe incorretos.',
  'Email not confirmed': 'Confirme o seu email antes de iniciar sessão.',
  'User already registered': 'Este email já está registado.',
  'Password should be at least 6 characters': 'A palavra-passe deve ter pelo menos 6 caracteres.',
  'Signup requires a valid password': 'Introduza uma palavra-passe válida.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'For security purposes, you can only request this after': 'Aguarde antes de tentar novamente.',
  
  // Database / RLS
  'new row violates row-level security policy': 'Sem permissão para esta operação.',
  'duplicate key value violates unique constraint': 'Este registo já existe no sistema.',
  'violates foreign key constraint': 'Referência inválida — verifique os dados selecionados.',
  'null value in column': 'Campo obrigatório não preenchido.',
  'value too long for type': 'Texto excede o tamanho máximo permitido.',
  'invalid input syntax for type uuid': 'Identificador inválido.',
  
  // Network
  'Failed to fetch': 'Sem ligação à internet. Verifique a sua conexão.',
  'NetworkError': 'Erro de rede. Verifique a sua conexão.',
  'Load failed': 'Falha ao carregar. Tente novamente.',
  'AbortError': 'O pedido foi cancelado. Tente novamente.',
  'TypeError: Failed to fetch': 'Sem ligação ao servidor. Verifique a sua internet.',
};

const httpStatusMap: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada. Inicie sessão novamente.',
  403: 'Sem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito — este registo já existe.',
  422: 'Dados inválidos. Verifique os campos preenchidos.',
  429: 'Muitas tentativas. Aguarde um momento.',
  500: 'Erro interno do servidor. Tente mais tarde.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço em manutenção. Tente mais tarde.',
};

/**
 * Retorna uma mensagem de erro amigável em português.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.';

  // String error
  if (typeof error === 'string') {
    return matchErrorMessage(error);
  }

  // Error-like object
  if (error instanceof Error || (typeof error === 'object' && error !== null)) {
    const err = error as Record<string, unknown>;
    
    // Supabase error with status
    if (typeof err.status === 'number' && httpStatusMap[err.status]) {
      // Check message first for more specific match
      const msg = (err.message as string) || (err.error_description as string) || '';
      const specific = matchErrorMessage(msg);
      if (specific !== msg) return specific;
      return httpStatusMap[err.status];
    }

    // Error message
    const message = (err.message as string) || (err.error_description as string) || '';
    if (message) return matchErrorMessage(message);
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

function matchErrorMessage(message: string): string {
  for (const [key, value] of Object.entries(supabaseErrorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return message;
}

/**
 * Mensagem para toast de erro em operações CRUD.
 */
export function getCrudErrorMessage(
  operation: 'create' | 'update' | 'delete' | 'fetch',
  entity: string,
  error?: unknown
): string {
  const opLabels = {
    create: 'criar',
    update: 'atualizar',
    delete: 'eliminar',
    fetch: 'carregar',
  };

  const base = `Erro ao ${opLabels[operation]} ${entity}.`;
  
  if (error) {
    const detail = getErrorMessage(error);
    // Avoid duplicating the base message
    if (detail !== 'Ocorreu um erro inesperado.' && detail !== 'Ocorreu um erro inesperado. Tente novamente.') {
      return `${base} ${detail}`;
    }
  }
  
  return `${base} Tente novamente.`;
}

/**
 * Helper para usar em onError de mutations do TanStack Query.
 * Uso: onError: handleMutationError('criar', 'agricultor')
 */
export function handleMutationError(operation: 'create' | 'update' | 'delete', entity: string) {
  return (error: Error) => {
    import('sonner').then(({ toast }) => {
      toast.error(getCrudErrorMessage(operation, entity, error));
    });
  };
}
