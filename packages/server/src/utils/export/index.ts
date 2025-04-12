/**
 * Export module - Provides functionality for exporting data to various formats
 */

export * from './BaseExporter'
export * from './CSVExporter'
export * from './JSONExporter'
export * from './PDFExporter'
export * from './ExportManager'

// Export a singleton instance of ExportManager for convenience
import { ExportManager } from './ExportManager'
export const exportManager = new ExportManager()
