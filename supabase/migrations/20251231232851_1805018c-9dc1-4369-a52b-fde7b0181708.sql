-- Fix missing UPDATE policy for rice_prices
CREATE POLICY "Rice prices updatable by authenticated" 
ON public.rice_prices 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);