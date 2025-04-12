/**
 * Data Export Service - Handles exporting data from various entities
 */

import { StatusCodes } from 'http-status-codes'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { getLogger } from '../../utils/logger'
import { exportManager, ExportFormat, ExportOptions } from '../../utils/export'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

// Define supported entity types
export enum ExportEntityType {
    CHATFLOW = 'chatflow',
    CHATMESSAGE = 'chatmessage',
    TOOL = 'tool',
    CREDENTIAL = 'credential',
    ASSISTANT = 'assistant',
    VARIABLE = 'variable'
}

// Define export request
export interface DataExportRequest {
    entityType: ExportEntityType
    entityId?: string
    format: ExportFormat
    options?: ExportOptions
    filter?: Record<string, any>
}

// Define export response
export interface DataExportResponse {
    success: boolean
    filePath?: string
    message?: string
    error?: string
}

const logger = getLogger()

/**
 * Export data from a specific entity
 * @param request Export request
 */
const exportData = async (request: DataExportRequest): Promise<DataExportResponse> => {
    try {
        const { entityType, entityId, format, options, filter } = request
        
        // Get data based on entity type
        const data = await getEntityData(entityType, entityId, filter)
        
        if (!data || data.length === 0) {
            return {
                success: false,
                message: `No data found for ${entityType}${entityId ? ` with ID ${entityId}` : ''}`
            }
        }
        
        // Create a temporary file path
        const tempDir = path.join(os.tmpdir(), 'flowise-exports')
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }
        
        const fileName = `${entityType}${entityId ? `-${entityId}` : ''}-${uuidv4()}`
        const outputPath = path.join(tempDir, `${fileName}.${format}`)
        
        // Export the data
        const success = await exportManager.export({
            data,
            format,
            outputPath,
            options
        })
        
        if (success) {
            return {
                success: true,
                filePath: outputPath,
                message: `Successfully exported ${data.length} records to ${format.toUpperCase()}`
            }
        } else {
            return {
                success: false,
                error: `Failed to export data to ${format.toUpperCase()}`
            }
        }
    } catch (error) {
        logger.error(`Error in exportData: ${getErrorMessage(error)}`)
        return {
            success: false,
            error: getErrorMessage(error)
        }
    }
}

/**
 * Get data for a specific entity type
 * @param entityType Entity type
 * @param entityId Optional entity ID
 * @param filter Optional filter
 */
const getEntityData = async (entityType: ExportEntityType, entityId?: string, filter?: Record<string, any>): Promise<any[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dataSource = appServer.AppDataSource
        
        // Build query based on entity type
        let query = dataSource.createQueryBuilder()
        
        switch (entityType) {
            case ExportEntityType.CHATFLOW:
                query = query.select('chatflow').from('chatflow', 'chatflow')
                if (entityId) query = query.where('chatflow.id = :id', { id: entityId })
                break
                
            case ExportEntityType.CHATMESSAGE:
                query = query.select('chatmessage').from('chatmessage', 'chatmessage')
                if (entityId) query = query.where('chatmessage.chatflowid = :id', { id: entityId })
                break
                
            case ExportEntityType.TOOL:
                query = query.select('tool').from('tool', 'tool')
                if (entityId) query = query.where('tool.id = :id', { id: entityId })
                break
                
            case ExportEntityType.CREDENTIAL:
                query = query.select('credential').from('credential', 'credential')
                if (entityId) query = query.where('credential.id = :id', { id: entityId })
                break
                
            case ExportEntityType.ASSISTANT:
                query = query.select('assistant').from('assistant', 'assistant')
                if (entityId) query = query.where('assistant.id = :id', { id: entityId })
                break
                
            case ExportEntityType.VARIABLE:
                query = query.select('variable').from('variable', 'variable')
                if (entityId) query = query.where('variable.id = :id', { id: entityId })
                break
                
            default:
                throw new InternalFlowiseError(
                    StatusCodes.BAD_REQUEST,
                    `Unsupported entity type: ${entityType}`
                )
        }
        
        // Apply additional filters if provided
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                query = query.andWhere(`${entityType}.${key} = :${key}`, { [key]: value })
            })
        }
        
        // Execute the query
        const result = await query.getMany()
        return result
    } catch (error) {
        logger.error(`Error in getEntityData: ${getErrorMessage(error)}`)
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error retrieving data for ${entityType}: ${getErrorMessage(error)}`
        )
    }
}

export default {
    exportData
}
