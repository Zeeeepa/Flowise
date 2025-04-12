/**
 * BaseExporter class - Base class for all exporters
 * Provides common functionality for exporting data to different formats
 */

import { Logger } from 'winston'
import { getLogger } from '../logger'

export interface ExportOptions {
    includeMetadata?: boolean
    customFields?: string[]
    filterOptions?: Record<string, any>
}

export abstract class BaseExporter {
    protected logger: Logger

    constructor() {
        this.logger = getLogger()
    }

    /**
     * Export data to a specific format
     * @param data The data to export
     * @param outputPath Path to save the exported file
     * @param options Export options
     */
    abstract export(data: any[], outputPath: string, options?: ExportOptions): Promise<boolean>

    /**
     * Process data before export
     * @param data The data to process
     * @param options Export options
     */
    protected processData(data: any[], options?: ExportOptions): any[] {
        if (!data || !Array.isArray(data)) {
            return []
        }

        let processedData = [...data]

        // Apply filtering if specified
        if (options?.filterOptions) {
            processedData = this.filterData(processedData, options.filterOptions)
        }

        // Select only specific fields if specified
        if (options?.customFields && options.customFields.length > 0) {
            processedData = this.selectFields(processedData, options.customFields)
        }

        // Add metadata if requested
        if (options?.includeMetadata) {
            processedData = this.addMetadata(processedData)
        }

        return processedData
    }

    /**
     * Filter data based on filter options
     * @param data The data to filter
     * @param filterOptions Filter criteria
     */
    protected filterData(data: any[], filterOptions: Record<string, any>): any[] {
        return data.filter((item) => {
            for (const [key, value] of Object.entries(filterOptions)) {
                if (item[key] !== value) {
                    return false
                }
            }
            return true
        })
    }

    /**
     * Select specific fields from data
     * @param data The data to process
     * @param fields Fields to select
     */
    protected selectFields(data: any[], fields: string[]): any[] {
        return data.map((item) => {
            const result: Record<string, any> = {}
            fields.forEach((field) => {
                if (field in item) {
                    result[field] = item[field]
                }
            })
            return result
        })
    }

    /**
     * Add metadata to the data
     * @param data The data to process
     */
    protected addMetadata(data: any[]): any[] {
        const timestamp = new Date().toISOString()
        return data.map((item) => ({
            ...item,
            _exportedAt: timestamp,
            _exportVersion: '1.0.0'
        }))
    }
}
