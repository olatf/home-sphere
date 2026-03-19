CREATE POLICY "Users can INSERT own wallet pin"
ON public.wallet_pins
FOR INSERT
TO authenticated
WITH CHECK(
  user_id = auth.uid()
);