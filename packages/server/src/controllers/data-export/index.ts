/**
 * Data Export Controller - Handles HTTP requests for data export
 */

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as fs from 'fs'
import * as path from 'path'
import dataExportService, { DataExportRequest, ExportEntityType } from '../../services/data-export'
import { ExportFormat } from '../../utils/export'
import { getLogger } from '../../utils/logger'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

const logger = getLogger()

/**
 * Export data to a file and return a download link
 */
const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { entityType, entityId, format, options, filter } = req.body
        
        if (!entityType || !Object.values(ExportEntityType).includes(entityType as ExportEntityType)) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                `Invalid entity type: ${entityType}. Must be one of: ${Object.values(ExportEntityType).join(', ')}`
            )
        }
        
        if (!format || !Object.values(ExportFormat).includes(format as ExportFormat)) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                `Invalid format: ${format}. Must be one of: ${Object.values(ExportFormat).join(', ')}`
            )
        }
        
        // Create export request
        const exportRequest: DataExportRequest = {
            entityType: entityType as ExportEntityType,
            entityId,
            format: format as ExportFormat,
            options,
            filter
        }
        
        // Export the data
        const result = await dataExportService.exportData(exportRequest)
        
        if (!result.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: result.error || result.message || 'Export failed'
            })
        }
        
        // Return the file path for download
        return res.json({
            success: true,
            message: result.message,
            filePath: path.basename(result.filePath || ''),
            format
        })
    } catch (error) {
        logger.error(`Error in exportData controller: ${getErrorMessage(error)}`)
        next(error)
    }
}

/**
 * Download an exported file
 */
const downloadExportedFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filename } = req.params
        
        if (!filename) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'Filename is required'
            )
        }
        
        // Construct the file path
        const filePath = path.join(require('os').tmpdir(), 'flowise-exports', filename)
        
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            throw new InternalFlowiseError(
                StatusCodes.NOT_FOUND,
                `File not found: ${filename}`
            )
        }
        
        // Set appropriate headers based on file extension
        const extension = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        
        switch (extension) {
            case '.csv':
                contentType = 'text/csv'
                break
            case '.json':
                contentType = 'application/json'
                break
            case '.pdf':
                contentType = 'application/pdf'
                break
        }
        
        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
        
        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
        
        // Clean up the file after download (optional)
        fileStream.on('end', () => {
            // Uncomment to delete the file after download
            // fs.unlinkSync(filePath)
        })
    } catch (error) {
        logger.error(`Error in downloadExportedFile controller: ${getErrorMessage(error)}`)
        next(error)
    }
}

export default {
    exportData,
    downloadExportedFile
}
