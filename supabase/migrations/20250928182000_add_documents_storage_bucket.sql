-- Add documents storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can view their own documents
CREATE POLICY "users_view_own_documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- RLS Policy: Users can upload documents to their folder
CREATE POLICY "users_upload_own_documents" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' 
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can update their own documents
CREATE POLICY "users_update_own_documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'documents' AND owner = auth.uid());

-- RLS Policy: Users can delete their own documents  
CREATE POLICY "users_delete_own_documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());