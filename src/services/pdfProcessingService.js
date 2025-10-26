import { supabase } from '../lib/supabase';

class PDFProcessingService {
  constructor() {
    this.apiUrl = import.meta.env?.VITE_API_BASE_URL;
    this.ocrServiceUrl = import.meta.env?.VITE_OCR_SERVICE_URL;
    this.isProductionMode = import.meta.env?.VITE_PRODUCTION_MODE === 'true';
    this.storageBucket = import.meta.env?.VITE_STORAGE_BUCKET_NAME || 'documents';
  }

  /**
   * 🚀 Production Document Processing
   */
  async processDocument(file, metadata) {
    try {
      if (!this.isProductionMode) {
        throw new Error('Production processing only available in production mode');
      }

      console.log(`📄 Starting production processing for: ${file?.name}`);

      // Step 1: Upload file to Supabase Storage
      const storageResult = await this.uploadToStorage(file, metadata);
      if (!storageResult?.success) {
        throw new Error(storageResult?.error || 'Failed to upload to storage');
      }

      // Step 2: Process document through OCR pipeline
      const ocrResult = await this.processOCR(storageResult?.data?.path, metadata);
      if (!ocrResult?.success) {
        throw new Error(ocrResult?.error || 'OCR processing failed');
      }

      // Step 3: Store document metadata in database
      const dbResult = await this.storeDocumentMetadata({
        ...metadata,
        filePath: storageResult?.data?.path,
        ocrData: ocrResult?.data,
        fileSize: file?.size,
        mimeType: file?.type,
        status: 'processed',
        processingMode: 'production'
      });

      if (!dbResult?.success) {
        throw new Error(dbResult?.error || 'Failed to store document metadata');
      }

      // Step 4: Trigger knowledge extraction pipeline
      const extractionResult = await this.triggerKnowledgeExtraction(dbResult?.data?.id, ocrResult?.data);

      return {
        success: true,
        data: {
          documentId: dbResult?.data?.id,
          storagePath: storageResult?.data?.path,
          ocrData: ocrResult?.data,
          extractionData: extractionResult?.data,
          status: 'completed',
          mode: 'production'
        }
      };

    } catch (error) {
      console.error('❌ Production document processing failed:', error);
      return {
        success: false,
        error: error?.message || 'Document processing failed'
      };
    }
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadToStorage(file, metadata) {
    try {
      const timestamp = new Date()?.toISOString()?.replace(/[:.]/g, '-');
      const fileName = `${timestamp}-${file?.name}`;
      const filePath = `production/${fileName}`;

      const { data, error } = await supabase?.storage
        ?.from(this.storageBucket)
        ?.upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            ...metadata,
            uploadedAt: new Date()?.toISOString(),
            originalName: file?.name,
            size: file?.size?.toString()
          }
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error?.message}`);
      }

      return {
        success: true,
        data: {
          path: data?.path,
          fullPath: data?.fullPath,
          id: data?.id
        }
      };

    } catch (error) {
      console.error('❌ Storage upload failed:', error);
      return {
        success: false,
        error: error?.message || 'Storage upload failed'
      };
    }
  }

  /**
   * Process document through OCR service
   */
  async processOCR(filePath, metadata) {
    try {
      // Get signed URL for OCR service access
      const { data: signedUrlData } = await supabase?.storage
        ?.from(this.storageBucket)
        ?.createSignedUrl(filePath, 3600);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to generate signed URL for OCR processing');
      }

      // Call OCR service API
      const ocrResponse = await fetch(`${this.ocrServiceUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env?.VITE_INTERNAL_ADMIN_KEY}`
        },
        body: JSON.stringify({
          fileUrl: signedUrlData?.signedUrl,
          options: {
            language: metadata?.language || 'en',
            extractTables: true,
            extractImages: true,
            quality: 'high'
          },
          metadata: {
            ...metadata,
            processingMode: 'production'
          }
        })
      });

      if (!ocrResponse?.ok) {
        throw new Error(`OCR service error: ${ocrResponse?.statusText}`);
      }

      const ocrResult = await ocrResponse?.json();

      return {
        success: true,
        data: {
          text: ocrResult?.text,
          confidence: ocrResult?.confidence,
          pages: ocrResult?.pages,
          tables: ocrResult?.tables || [],
          images: ocrResult?.images || [],
          metadata: ocrResult?.metadata || {}
        }
      };

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      return {
        success: false,
        error: error?.message || 'OCR processing failed'
      };
    }
  }

  /**
   * Store document metadata in database
   */
  async storeDocumentMetadata(documentData) {
    try {
      const { data, error } = await supabase
        ?.from('processed_documents')
        ?.insert({
          title: documentData?.title,
          author: documentData?.author,
          publication_year: documentData?.publicationYear ? parseInt(documentData?.publicationYear) : null,
          isbn: documentData?.isbn,
          language: documentData?.language,
          tags: documentData?.tags || [],
          file_path: documentData?.filePath,
          file_size: documentData?.fileSize,
          mime_type: documentData?.mimeType,
          ocr_data: documentData?.ocrData,
          processing_status: documentData?.status,
          processing_mode: documentData?.processingMode,
          created_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })
        ?.select()
        ?.single();

      if (error) {
        throw new Error(`Database insert failed: ${error?.message}`);
      }

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Database storage failed:', error);
      return {
        success: false,
        error: error?.message || 'Database storage failed'
      };
    }
  }

  /**
   * Trigger knowledge extraction pipeline
   */
  async triggerKnowledgeExtraction(documentId, ocrData) {
    try {
      const extractionResponse = await fetch(`${this.apiUrl}/knowledge-extraction/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env?.VITE_INTERNAL_ADMIN_KEY}`
        },
        body: JSON.stringify({
          documentId,
          text: ocrData?.text,
          metadata: ocrData?.metadata,
          processingMode: 'production'
        })
      });

      if (!extractionResponse?.ok) {
        console.warn('⚠️ Knowledge extraction failed, but document was processed');
        return {
          success: false,
          error: 'Knowledge extraction failed'
        };
      }

      const extractionResult = await extractionResponse?.json();

      return {
        success: true,
        data: extractionResult
      };

    } catch (error) {
      console.warn('⚠️ Knowledge extraction failed:', error);
      return {
        success: false,
        error: error?.message || 'Knowledge extraction failed'
      };
    }
  }

  /**
   * Get processing status for a document
   */
  async getProcessingStatus(documentId) {
    try {
      const { data, error } = await supabase
        ?.from('processed_documents')
        ?.select('id, title, processing_status, created_at, updated_at, ocr_data')
        ?.eq('id', documentId)
        ?.single();

      if (error) {
        throw new Error(`Failed to fetch document status: ${error?.message}`);
      }

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Status fetch failed:', error);
      return {
        success: false,
        error: error?.message || 'Status fetch failed'
      };
    }
  }

  /**
   * List processed documents
   */
  async listProcessedDocuments(filters = {}) {
    try {
      let query = supabase
        ?.from('processed_documents')
        ?.select('*');

      if (filters?.status) {
        query = query?.eq('processing_status', filters?.status);
      }

      if (filters?.language) {
        query = query?.eq('language', filters?.language);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to list documents: ${error?.message}`);
      }

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Document list failed:', error);
      return {
        success: false,
        error: error?.message || 'Document list failed'
      };
    }
  }
}

export default new PDFProcessingService();