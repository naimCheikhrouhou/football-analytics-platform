# PDF Report Generation Server

This Node.js server handles PDF report generation for the Football Analytics Platform.

## Overview

The server provides an endpoint that:
1. Receives PDF generation requests from Hasura Actions
2. Fetches data from Supabase
3. Generates PDF reports using PDFKit
4. Uploads PDFs to Supabase Storage
5. Returns download URLs

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
```

**Get Service Role Key:**
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key!)

### 3. Set Up Supabase Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Create a new bucket named `reports`
3. Set it to **Public** (or configure RLS policies)
4. Enable public access if you want direct download links

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run server:dev

# Production
npm run server
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST `/actions/generatePdfReport`

Generates a PDF report and returns a download URL.

**Request Body:**
```json
{
  "input": {
    "reportType": "player" | "match" | "comparison",
    "entityId": "uuid-or-comma-separated-ids",
    "options": {
      "includeCharts": true,
      "includeTrainingData": true,
      "includeDetailedStats": true
    }
  }
}
```

**Response:**
```json
{
  "report_id": "report-1234567890-abc123",
  "download_url": "https://your-project.supabase.co/storage/v1/object/public/reports/player-uuid-1234567890.pdf",
  "status": "completed",
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Report Types

### Player Performance Report

- Player information
- Statistics summary (goals, assists, rating, matches)
- Match history (if `includeDetailedStats` is true)

### Match Report

- Match information (date, competition, venue)
- Score
- Player statistics table

### Comparison Report

- Side-by-side comparison table
- Statistics for multiple players

## Hasura Action Configuration

1. Go to Hasura Console → **Actions**
2. Create a new action with:
   - **Action Name**: `generatePdfReport`
   - **Handler URL**: `http://localhost:3001/actions/generatePdfReport`
   - **GraphQL Schema**: (see `hasura/metadata/actions.graphql`)

3. Set permissions for roles (coach, analyst)

## Deployment

### Option 1: Deploy as Standalone Server

Deploy to platforms like:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

Set environment variables in your hosting platform.

### Option 2: Deploy as Serverless Function

Convert to serverless functions:
- Vercel Serverless Functions
- Netlify Functions
- AWS Lambda
- Supabase Edge Functions

### Option 3: Docker Container

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server/ ./server/
EXPOSE 3001
CMD ["node", "server/index.js"]
```

## Troubleshooting

### Supabase Storage Upload Fails

- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that the `reports` bucket exists
- Ensure bucket is public or RLS policies allow uploads

### PDF Generation Fails

- Check that player/match IDs exist in database
- Verify database schema matches expected structure
- Check server logs for detailed error messages

### Hasura Action Not Reaching Server

- Verify server is running
- Check CORS configuration
- Verify handler URL is correct
- Check network connectivity

## Security Notes

- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Use environment variables for all secrets
- Implement rate limiting for production
- Add authentication/authorization checks
- Validate input parameters

## Future Enhancements

- Add chart generation (using Puppeteer or canvas)
- Support for custom report templates
- Email delivery of reports
- Report scheduling
- Caching for frequently requested reports
- Support for Excel/CSV exports

