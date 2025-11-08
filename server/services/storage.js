const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Supabase Storage credentials not configured');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Upload PDF buffer to Supabase Storage
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - File name/path in storage
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadToSupabase(pdfBuffer, fileName) {
  if (!supabase) {
    throw new Error('Supabase Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  try {
    // Upload file to 'reports' bucket
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL from Supabase Storage');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Supabase Storage upload error:', error);
    throw error;
  }
}

module.exports = { uploadToSupabase };

