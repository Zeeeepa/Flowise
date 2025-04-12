/**
 * CSVExporter class - Exports data to CSV format
 */

import * as fs from 'fs'
import * as path from 'path'
import { BaseExporter, ExportOptions } from './BaseExporter'

export class CSVExporter extends BaseExporter {
    /**
     * Export data to CSV format
     * @param data The data to export
     * @param outputPath Path to save the CSV file
     * @param options Export options
     */
    async export(data: any[], outputPath: string, options?: ExportOptions): Promise<boolean> {
        try {
            // Process data before export
            const processedData = this.processData(data, options)
            
            if (processedData.length === 0) {
                this.logger.warn('No data to export to CSV')
                return false
            }

            // Ensure directory exists
            const dir = path.dirname(outputPath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            // Get headers from the first item
            const headers = Object.keys(processedData[0])
            
            // Convert data to CSV format
            const csvContent = this.convertToCSV(processedData, headers)
            
            // Write to file
            fs.writeFileSync(outputPath, csvContent, 'utf8')
            
            this.logger.info(`Successfully exported ${processedData.length} records to CSV: ${outputPath}`)
            return true
        } catch (error) {
            this.logger.error(`Error exporting to CSV: ${error instanceof Error ? error.message : String(error)}`)
            return false
        }
    }

    /**
     * Convert data to CSV format
     * @param data The data to convert
     * @param headers CSV headers
     */
    private convertToCSV(data: any[], headers: string[]): string {
        // Create header row
        const headerRow = headers.join(',')
        
        // Create data rows
        const rows = data.map(item => {
            return headers.map(header => {
                const value = item[header]
                
                // Handle different data types
                if (value === null || value === undefined) {
                    return ''
                } else if (typeof value === 'object') {
                    // Convert objects to JSON strings and escape quotes
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`
                } else if (typeof value === 'string') {
                    // Escape quotes in strings
                    return `"${value.replace(/"/g, '""')}"`
                } else {
                    return value
                }
            }).join(',')
        })
        
        // Combine header and data rows
        return [headerRow, ...rows].join('\n')
    }
}
