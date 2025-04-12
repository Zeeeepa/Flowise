/**
 * ExportManager class - Manages data export to various formats
 */

import { BaseExporter, ExportOptions } from './BaseExporter'
import { CSVExporter } from './CSVExporter'
import { JSONExporter } from './JSONExporter'
import { PDFExporter } from './PDFExporter'
import { getLogger } from '../logger'

export enum ExportFormat {
    CSV = 'csv',
    JSON = 'json',
    PDF = 'pdf'
}

export interface ExportRequest {
    data: any[]
    format: ExportFormat
    outputPath: string
    options?: ExportOptions
}

export class ExportManager {
    private logger = getLogger()
    private exporters: Map<ExportFormat, BaseExporter> = new Map()

    constructor() {
        // Register exporters
        this.registerExporter(ExportFormat.CSV, new CSVExporter())
        this.registerExporter(ExportFormat.JSON, new JSONExporter())
        this.registerExporter(ExportFormat.PDF, new PDFExporter())
    }

    /**
     * Register a new exporter
     * @param format Export format
     * @param exporter Exporter instance
     */
    registerExporter(format: ExportFormat, exporter: BaseExporter): void {
        this.exporters.set(format, exporter)
    }

    /**
     * Export data to the specified format
     * @param request Export request
     */
    async export(request: ExportRequest): Promise<boolean> {
        const { data, format, outputPath, options } = request

        // Check if data is valid
        if (!data || !Array.isArray(data) || data.length === 0) {
            this.logger.error('No data to export')
            return false
        }

        // Get the appropriate exporter
        const exporter = this.exporters.get(format)
        if (!exporter) {
            this.logger.error(`Unsupported export format: ${format}`)
            return false
        }

        try {
            // Perform the export
            const result = await exporter.export(data, outputPath, options)
            return result
        } catch (error) {
            this.logger.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
            return false
        }
    }

    /**
     * Export data to multiple formats
     * @param data Data to export
     * @param basePath Base path for output files
     * @param formats Formats to export to
     * @param options Export options
     */
    async exportMultiple(
        data: any[],
        basePath: string,
        formats: ExportFormat[],
        options?: ExportOptions
    ): Promise<Record<ExportFormat, boolean>> {
        const results: Record<ExportFormat, boolean> = {} as Record<ExportFormat, boolean>

        // Export to each format
        for (const format of formats) {
            const outputPath = `${basePath}.${format}`
            results[format] = await this.export({
                data,
                format,
                outputPath,
                options
            })
        }

        return results
    }
}
