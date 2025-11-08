const express = require('express');
const cors = require('cors');
const { generatePdfReport } = require('./services/pdfGenerator');
const { uploadToSupabase } = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PDF Report Generation Endpoint (Hasura Action)
app.post('/actions/generatePdfReport', async (req, res) => {
  try {
    const { input } = req.body;
    const { reportType, entityId, options } = input;

    console.log('Generating PDF report:', { reportType, entityId, options });

    // Generate PDF
    const pdfBuffer = await generatePdfReport(reportType, entityId, options);

    // Upload to Supabase Storage
    const fileName = `reports/${reportType}-${entityId || 'comparison'}-${Date.now()}.pdf`;
    const downloadUrl = await uploadToSupabase(pdfBuffer, fileName);

    // Return response
    const response = {
      report_id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      download_url: downloadUrl,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate PDF report',
      error: error.toString(),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`PDF Report Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`PDF endpoint: http://localhost:${PORT}/actions/generatePdfReport`);
});

module.exports = app;

