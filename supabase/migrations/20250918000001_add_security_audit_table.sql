-- Create security_audit table for logging security events and access attempts
CREATE TABLE IF NOT EXISTS public.security_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL CHECK (event_type IN ('access_attempt', 'unauthorized_access', 'admin_access', 'permission_check')),
    resource text NOT NULL,
    action text NOT NULL,
    success boolean NOT NULL DEFAULT false,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_resource ON public.security_audit(resource);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_success ON public.security_audit(success);

-- Enable RLS
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_audit table
-- Only super admins can read security audit logs
CREATE POLICY "Super admins can view all security audit logs"
ON public.security_audit
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.roles 
        WHERE roles.user_id = auth.uid() 
        AND roles.role = 'super_admin'
    )
);

-- Allow the system to insert security audit logs (service role)
CREATE POLICY "System can insert security audit logs"
ON public.security_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.security_audit IS 'Logs security events and access attempts for audit purposes';
COMMENT ON COLUMN public.security_audit.event_type IS 'Type of security event: access_attempt, unauthorized_access, admin_access, permission_check';
COMMENT ON COLUMN public.security_audit.resource IS 'The resource being accessed (e.g., /community-insights)';
COMMENT ON COLUMN public.security_audit.action IS 'The action being performed (e.g., view, check_permission)';
COMMENT ON COLUMN public.security_audit.success IS 'Whether the access/action was successful';
COMMENT ON COLUMN public.security_audit.details IS 'Additional details about the event in JSON format';
COMMENT ON COLUMN public.security_audit.ip_address IS 'IP address of the user making the request';
COMMENT ON COLUMN public.security_audit.user_agent IS 'User agent string from the browser';
