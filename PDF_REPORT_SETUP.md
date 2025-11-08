# PDF Report Generation Setup Guide

Complete guide for setting up PDF report generation with Node.js, PDFKit, and Supabase Storage.

## Architecture

```
Frontend (Next.js)
    ↓ GraphQL Mutation
Hasura Action
    ↓ HTTP POST
Node.js Server (Express)
    ↓ Fetch Data
Supabase Database
    ↓ Generate PDF
PDFKit
    ↓ Upload
Supabase Storage
    ↓ Return URL
Frontend (Download Link)
```

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `pdfkit` - PDF generation
- `@supabase/supabase-js` - Supabase client
- `cors` - CORS middleware
- `uuid` - ID generation

## Step 2: Configure Environment Variables

Create a `.env` file in the project root (or `server/.env`):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=3001
```

**Get Service Role Key:**
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (⚠️ Keep this secret!)

## Step 3: Set Up Supabase Storage

### Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `reports`
4. Set to **Public** (or configure RLS policies)
5. Click **Create bucket**

### Configure Bucket Policies (Optional)

If you want to keep the bucket private, set up RLS policies:

```sql
-- Allow authenticated users to read reports
CREATE POLICY "Users can read reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- Allow service role to upload reports
CREATE POLICY "Service can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');
```

## Step 4: Start the Server

```bash
# Development (with auto-reload)
npm run server:dev

# Production
npm run server
```

The server will run on `http://localhost:3001`

## Step 5: Configure Hasura Action

### 5.1 Define Action in Hasura Console

1. Open Hasura Console: http://localhost:8080/console
2. Go to **Actions** → **Create**
3. Fill in:

**Action Definition:**
```graphql
type Mutation {
  generatePdfReport(
    reportType: String!
    entityId: uuid
    options: jsonb
  ): PdfReportResponse
}

type PdfReportResponse {
  report_id: String!
  download_url: String!
  status: String!
  created_at: timestamptz!
}
```

**Handler URL:**
```
http://localhost:3001/actions/generatePdfReport
```

**Request Transform:**
```json
{
  "reportType": "{{$body.input.reportType}}",
  "entityId": "{{$body.input.entityId}}",
  "options": "{{$body.input.options}}"
}
```

### 5.2 Set Permissions

1. Go to **Actions** → **generatePdfReport** → **Permissions**
2. Add permissions for:
   - **coach**: Full access
   - **analyst**: Full access
   - **player**: None (or restrict to own reports)

## Step 6: Test the Setup

### Test Server Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Test PDF Generation

```bash
curl -X POST http://localhost:3001/actions/generatePdfReport \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "reportType": "player",
      "entityId": "player-uuid-here",
      "options": {
        "includeDetailedStats": true
      }
    }
  }'
```

### Test from Frontend

1. Go to `/reports` page
2. Select report type and entity
3. Click "Generate PDF Report"
4. Wait for generation
5. Click download link

## Report Types

### Player Performance Report

**Input:**
```json
{
  "reportType": "player",
  "entityId": "player-uuid",
  "options": {
    "includeDetailedStats": true,
    "includeTrainingData": false
  }
}
```

**Output PDF includes:**
- Player information
- Statistics summary
- Match history (if `includeDetailedStats` is true)

### Match Report

**Input:**
```json
{
  "reportType": "match",
  "entityId": "match-uuid",
  "options": {
    "includeDetailedStats": true
  }
}
```

**Output PDF includes:**
- Match information
- Score
- Player statistics table

### Comparison Report

**Input:**
```json
{
  "reportType": "comparison",
  "entityId": "player-id-1,player-id-2,player-id-3",
  "options": {}
}
```

**Output PDF includes:**
- Side-by-side comparison table
- Statistics for all selected players

## File Structure

```
server/
├── index.js                 # Express server
├── services/
│   ├── pdfGenerator.js     # PDF generation logic
│   ├── dataFetcher.js      # Data fetching from Supabase
│   └── storage.js          # Supabase Storage upload
├── .env.example            # Environment variables template
└── README.md               # Server documentation
```

## Deployment

### Option 1: Deploy Server Separately

Deploy the Node.js server to:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

Update Hasura Action handler URL to point to deployed server.

### Option 2: Deploy as Serverless Function

Convert to serverless:
- Vercel Serverless Functions
- Netlify Functions
- AWS Lambda
- Supabase Edge Functions

### Option 3: Docker Container

Add to `docker-compose.yml`:

```yaml
services:
  pdf-server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

## Troubleshooting

### Server Not Starting

- Check Node.js version (requires 18+)
- Verify all dependencies installed
- Check PORT is not in use
- Review error logs

### Supabase Storage Upload Fails

- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check bucket exists and is accessible
- Verify bucket permissions
- Check file size limits

### PDF Generation Fails

- Verify entity IDs exist in database
- Check database schema matches expected structure
- Review server logs for errors
- Test data fetching separately

### Hasura Action Not Working

- Verify server is running and accessible
- Check handler URL is correct
- Verify CORS is configured
- Test endpoint directly with curl

## Security Best Practices

1. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in client code
2. Use environment variables for all secrets
3. Implement rate limiting
4. Add authentication checks
5. Validate all input parameters
6. Set up proper CORS policies
7. Use HTTPS in production

## Future Enhancements

- [ ] Add chart generation (Puppeteer for HTML-to-PDF)
- [ ] Support custom report templates
- [ ] Email delivery of reports
- [ ] Report scheduling
- [ ] Caching for frequently requested reports
- [ ] Support for Excel/CSV exports
- [ ] Multi-language support
- [ ] Custom branding/logo in reports

## Support

For issues:
1. Check server logs
2. Verify environment variables
3. Test endpoints individually
4. Review Supabase Storage logs
5. Check Hasura Action logs

