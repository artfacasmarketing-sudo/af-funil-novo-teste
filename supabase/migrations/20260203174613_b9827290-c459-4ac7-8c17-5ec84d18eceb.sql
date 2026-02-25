-- Políticas explícitas de negação para UPDATE e DELETE na tabela leads
-- Isso reforça a segurança mesmo que o comportamento padrão já negue essas operações

CREATE POLICY "Deny all updates" ON public.leads
  FOR UPDATE USING (false);

CREATE POLICY "Deny all deletes" ON public.leads
  FOR DELETE USING (false);