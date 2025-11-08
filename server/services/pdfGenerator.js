const PDFDocument = require('pdfkit');
const { getPlayerData, getMatchData, getComparisonData } = require('./dataFetcher');

/**
 * Generate PDF report based on type
 * @param {string} reportType - 'player', 'match', or 'comparison'
 * @param {string} entityId - ID of player, match, or comma-separated player IDs
 * @param {object} options - Report options (includeCharts, includeTrainingData, etc.)
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePdfReport(reportType, entityId, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate report based on type
      switch (reportType) {
        case 'player':
          await generatePlayerReport(doc, entityId, options);
          break;
        case 'match':
          await generateMatchReport(doc, entityId, options);
          break;
        case 'comparison':
          await generateComparisonReport(doc, entityId, options);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Player Performance Report
 */
async function generatePlayerReport(doc, playerId, options) {
  const playerData = await getPlayerData(playerId);

  // Header
  doc.fontSize(20).text('Player Performance Report', { align: 'center' });
  doc.moveDown();

  // Player Information
  doc.fontSize(16).text('Player Information', { underline: true });
  doc.fontSize(12);
  doc.text(`Name: ${playerData.first_name} ${playerData.last_name}`);
  doc.text(`Position: ${playerData.position || 'N/A'}`);
  if (playerData.jersey_number) {
    doc.text(`Jersey Number: #${playerData.jersey_number}`);
  }
  doc.moveDown();

  // Statistics Summary
  const stats = playerData.player_statistics_aggregate?.aggregate || {};
  doc.fontSize(16).text('Statistics Summary', { underline: true });
  doc.fontSize(12);
  doc.text(`Total Goals: ${stats.sum?.goals || 0}`);
  doc.text(`Total Assists: ${stats.sum?.assists || 0}`);
  doc.text(`Average Rating: ${stats.avg?.rating?.toFixed(1) || 'N/A'}`);
  doc.text(`Total Matches: ${stats.count || 0}`);
  doc.moveDown();

  // Match History
  if (options.includeDetailedStats && playerData.player_statistics?.length > 0) {
    doc.fontSize(16).text('Match History', { underline: true });
    doc.fontSize(10);
    
    playerData.player_statistics.forEach((stat, index) => {
      if (index > 0 && index % 25 === 0) {
        doc.addPage();
      }
      
      const match = stat.match || {};
      doc.text(
        `${new Date(match.date).toLocaleDateString()} - ${match.home_team} vs ${match.away_team}`,
        { continued: false }
      );
      doc.text(
        `  Goals: ${stat.goals || 0} | Assists: ${stat.assists || 0} | Rating: ${stat.rating || 'N/A'}`,
        { indent: 20 }
      );
      doc.moveDown(0.5);
    });
  }

  // Footer
  doc.fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      doc.page.width - 50,
      doc.page.height - 30,
      { align: 'right' }
    );
}

/**
 * Generate Match Report
 */
async function generateMatchReport(doc, matchId, options) {
  const matchData = await getMatchData(matchId);

  // Header
  doc.fontSize(20).text('Match Report', { align: 'center' });
  doc.moveDown();

  // Match Information
  doc.fontSize(16).text('Match Information', { underline: true });
  doc.fontSize(12);
  doc.text(`Date: ${new Date(matchData.date).toLocaleDateString()}`);
  doc.text(`Competition: ${matchData.competition || 'N/A'}`);
  doc.text(`Venue: ${matchData.venue || 'N/A'}`);
  doc.moveDown();

  // Score
  doc.fontSize(18).text(
    `${matchData.home_team} ${matchData.goals_for || 0} - ${matchData.goals_against || 0} ${matchData.away_team}`,
    { align: 'center' }
  );
  doc.moveDown();

  // Player Statistics
  if (matchData.player_statistics?.length > 0) {
    doc.fontSize(16).text('Player Statistics', { underline: true });
    doc.fontSize(10);
    
    // Table header
    doc.text('Player', { continued: true, width: 150 });
    doc.text('Goals', { continued: true, width: 60, align: 'center' });
    doc.text('Assists', { continued: true, width: 60, align: 'center' });
    doc.text('Rating', { width: 60, align: 'center' });
    doc.moveDown(0.3);
    doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    matchData.player_statistics.forEach((stat, index) => {
      if (index > 0 && index % 30 === 0) {
        doc.addPage();
      }
      
      const player = stat.player || {};
      doc.text(`${player.first_name} ${player.last_name}`, { continued: true, width: 150 });
      doc.text(`${stat.goals || 0}`, { continued: true, width: 60, align: 'center' });
      doc.text(`${stat.assists || 0}`, { continued: true, width: 60, align: 'center' });
      doc.text(`${stat.rating || 'N/A'}`, { width: 60, align: 'center' });
      doc.moveDown(0.3);
    });
  }

  // Footer
  doc.fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      doc.page.width - 50,
      doc.page.height - 30,
      { align: 'right' }
    );
}

/**
 * Generate Comparison Report
 */
async function generateComparisonReport(doc, playerIds, options) {
  const playerIdsArray = playerIds.split(',').map(id => id.trim());
  const playersData = await getComparisonData(playerIdsArray);

  // Header
  doc.fontSize(20).text('Player Comparison Report', { align: 'center' });
  doc.moveDown();

  // Comparison Table
  doc.fontSize(16).text('Comparison', { underline: true });
  doc.fontSize(10);
  
  // Table header
  doc.text('Player', { continued: true, width: 150 });
  doc.text('Position', { continued: true, width: 80 });
  doc.text('Goals', { continued: true, width: 60, align: 'center' });
  doc.text('Assists', { continued: true, width: 60, align: 'center' });
  doc.text('Avg Rating', { continued: true, width: 70, align: 'center' });
  doc.text('Matches', { width: 60, align: 'center' });
  doc.moveDown(0.3);
  doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.3);

  playersData.forEach((player, index) => {
    if (index > 0 && index % 30 === 0) {
      doc.addPage();
    }
    
    const stats = player.player_statistics_aggregate?.aggregate || {};
    doc.text(`${player.first_name} ${player.last_name}`, { continued: true, width: 150 });
    doc.text(`${player.position || 'N/A'}`, { continued: true, width: 80 });
    doc.text(`${stats.sum?.goals || 0}`, { continued: true, width: 60, align: 'center' });
    doc.text(`${stats.sum?.assists || 0}`, { continued: true, width: 60, align: 'center' });
    doc.text(`${stats.avg?.rating?.toFixed(1) || 'N/A'}`, { continued: true, width: 70, align: 'center' });
    doc.text(`${stats.count || 0}`, { width: 60, align: 'center' });
    doc.moveDown(0.3);
  });

  // Footer
  doc.fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      doc.page.width - 50,
      doc.page.height - 30,
      { align: 'right' }
    );
}

module.exports = { generatePdfReport };

