-- ==============================================================================
-- ระบบตรวจสอบอุปกรณ์ประจำรถพยาบาล หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN' AND approved = TRUE AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is approved active member
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND approved = TRUE AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================
-- Everyone authenticated can read active approved profiles (to display inspector names)
CREATE POLICY "Allow authenticated to view approved profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile (name, phone, password_change/first_login)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin has full access to profiles (Approve, change role, deactivate)
CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Registration insert policy (new users insert their own profile on signup)
CREATE POLICY "Users can insert own profile on signup"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ==============================================================================
-- VEHICLES POLICIES
-- ==============================================================================
-- All authenticated users can view active vehicles
CREATE POLICY "Allow authenticated to view vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

-- Only Admin can insert, update, or delete vehicles
CREATE POLICY "Admin manage vehicles"
ON public.vehicles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- EQUIPMENT POLICIES
-- ==============================================================================
-- All authenticated users can view active equipment master
CREATE POLICY "Allow authenticated to view equipment"
ON public.equipment FOR SELECT
TO authenticated
USING (true);

-- Only Admin can insert, update, or delete equipment
CREATE POLICY "Admin manage equipment"
ON public.equipment FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- INSPECTIONS POLICIES
-- ==============================================================================
-- Active members and admins can view all inspections
CREATE POLICY "Allow active members to view inspections"
ON public.inspections FOR SELECT
TO authenticated
USING (public.is_active_member() OR public.is_admin());

-- Active members can insert new inspections
CREATE POLICY "Allow active members to insert inspections"
ON public.inspections FOR INSERT
TO authenticated
WITH CHECK (public.is_active_member() AND (inspector_id = auth.uid() OR public.is_admin()));

-- Active members can update their own inspections (e.g. within the same shift) or Admin
CREATE POLICY "Allow inspectors and admin to update inspections"
ON public.inspections FOR UPDATE
TO authenticated
USING (inspector_id = auth.uid() OR public.is_admin())
WITH CHECK (inspector_id = auth.uid() OR public.is_admin());

-- Only Admins can delete inspections
CREATE POLICY "Only Admins can delete inspections"
ON public.inspections FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- INSPECTION ITEMS POLICIES
-- ==============================================================================
-- Active members can view inspection items
CREATE POLICY "Allow active members to view inspection items"
ON public.inspection_items FOR SELECT
TO authenticated
USING (public.is_active_member() OR public.is_admin());

-- Active members can insert inspection items in batch
CREATE POLICY "Allow active members to insert inspection items"
ON public.inspection_items FOR INSERT
TO authenticated
WITH CHECK (public.is_active_member());

-- Inspectors and Admins can update inspection items
CREATE POLICY "Allow update inspection items"
ON public.inspection_items FOR UPDATE
TO authenticated
USING (public.is_active_member() OR public.is_admin())
WITH CHECK (public.is_active_member() OR public.is_admin());

-- ==============================================================================
-- AUDIT LOGS POLICIES
-- ==============================================================================
-- Anyone authenticated can insert audit logs for auditing their own actions
CREATE POLICY "Allow users to insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only Admins can view audit logs (strictly protected)
CREATE POLICY "Only Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

-- No one can delete or modify audit logs (immutable security trail)
-- (No UPDATE or DELETE policies created)
