import { supabase } from '../lib/supabase';

class PrivateCorpusService {
  // Get user's book library with processing status
  async getBookLibrary(userId) {
    try {
      const { data, error } = await supabase?.from('book_library')?.select(`
          id,
          title,
          author,
          publication_year,
          document_format,
          file_size,
          file_path,
          processing_status,
          created_at,
          updated_at,
          metadata
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to load book library: ${error.message}`);
    }
  }

  // Upload PDF and create book record
  async uploadPDF(userId, file) {
    try {
      // Generate unique file path
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${userId}/documents/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase?.storage?.from('documents')?.upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create book library record
      const { data: bookData, error: bookError } = await supabase?.from('book_library')?.insert({
          user_id: userId,
          title: file?.name?.replace(/\.[^/.]+$/, ""), // Remove extension
          document_format: 'pdf',
          file_size: file?.size,
          file_path: fileName,
          processing_status: 'pending',
          metadata: {
            original_filename: file?.name,
            upload_timestamp: new Date()?.toISOString()
          }
        })?.select()?.single();

      if (bookError) throw bookError;
      return bookData;
    } catch (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }

  // Get processing jobs for a book
  async getProcessingJobs(bookId) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.select(`
          id,
          processing_stage,
          status,
          progress_percentage,
          started_at,
          completed_at,
          error_message,
          output_data
        `)?.eq('book_id', bookId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to load processing jobs: ${error.message}`);
    }
  }

  // Start processing a book
  async startProcessing(userId, bookId) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.insert({
          user_id: userId,
          book_id: bookId,
          processing_stage: 'ocr',
          status: 'pending',
          progress_percentage: 0,
          started_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to start processing: ${error.message}`);
    }
  }

  // Get strategy extractions for user
  async getStrategyExtractions(userId) {
    try {
      const { data, error } = await supabase?.from('strategy_extractions')?.select(`
          id,
          strategy_name,
          strategy_description,
          extraction_type,
          confidence_score,
          parameters,
          yaml_output,
          source_chapter,
          source_page_range,
          created_at,
          book_library:book_id (
            title,
            author
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to load strategy extractions: ${error.message}`);
    }
  }

  // Get pipeline registry status
  async getPipelineRegistry() {
    try {
      const { data, error } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to load pipeline registry: ${error.message}`);
    }
  }

  // Get processing statistics
  async getProcessingStats(userId) {
    try {
      // Get total books
      const { count: totalBooks } = await supabase?.from('book_library')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId);

      // Get processed books
      const { count: processedBooks } = await supabase?.from('book_library')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId)?.eq('processing_status', 'completed');

      // Get strategies extracted
      const { count: strategiesCount } = await supabase?.from('strategy_extractions')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId);

      return {
        totalBooks: totalBooks || 0,
        processedBooks: processedBooks || 0,
        pendingBooks: (totalBooks || 0) - (processedBooks || 0),
        strategiesExtracted: strategiesCount || 0
      };
    } catch (error) {
      throw new Error(`Failed to load processing stats: ${error.message}`);
    }
  }

  // Delete book and associated data
  async deleteBook(userId, bookId, filePath) {
    try {
      // Delete from storage
      if (filePath) {
        const { error: storageError } = await supabase?.storage?.from('documents')?.remove([filePath]);
        
        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError?.message);
        }
      }

      // Delete book record (cascade will handle related records)
      const { error: deleteError } = await supabase?.from('book_library')?.delete()?.eq('id', bookId)?.eq('user_id', userId);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete book: ${error.message}`);
    }
  }

  // Get signed URL for private document
  async getDocumentSignedUrl(filePath) {
    try {
      const { data, error } = await supabase?.storage?.from('documents')?.createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data?.signedUrl;
    } catch (error) {
      throw new Error(`Failed to get document URL: ${error.message}`);
    }
  }

  // Real-time subscription for processing updates
  subscribeToProcessingUpdates(userId, callback) {
    const channel = supabase?.channel('processing-updates')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_processing_jobs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
}

export const privateCorpusService = new PrivateCorpusService();
export default privateCorpusService;