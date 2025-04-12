/**
 * Data Export Routes - Defines routes for data export functionality
 */

import express from 'express'
import dataExportController from '../../controllers/data-export'

const router = express.Router()

// Export data to a file
router.post('/export', dataExportController.exportData)

// Download an exported file
router.get('/download/:filename', dataExportController.downloadExportedFile)

export default router
