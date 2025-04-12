/**
 * JSONExporter class - Exports data to JSON format
 */

import * as fs from 'fs'
import * as path from 'path'
import { BaseExporter, ExportOptions } from './BaseExporter'

export class JSONExporter extends BaseExporter {
    /**
     * Export data to JSON format
     * @param data The data to export
     * @param outputPath Path to save the JSON file
     * @param options Export options
     */
    async export(data: any[], outputPath: string, options?: ExportOptions): Promise<boolean> {
        try {
            // Process data before export
            const processedData = this.processData(data, options)
            
            if (processedData.length === 0) {
                this.logger.warn('No data to export to JSON')
                return false
            }

            // Ensure directory exists
            const dir = path.dirname(outputPath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            
            // Add export metadata
            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    recordCount: processedData.length,
                    version: '1.0.0'
                },
                data: processedData
            }
            
            // Write to file with pretty formatting
            fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8')
            
            this.logger.info(`Successfully exported ${processedData.length} records to JSON: ${outputPath}`)
            return true
        } catch (error) {
            this.logger.error(`Error exporting to JSON: ${error instanceof Error ? error.message : String(error)}`)
            return false
        }
    }
}
