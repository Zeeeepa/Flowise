# Export Capabilities

This module provides functionality for exporting data from Flowise to various formats (CSV, JSON, PDF).

## Features

- Export data to CSV, JSON, and PDF formats
- Customizable export options (field selection, filtering, metadata)
- Consistent error handling and logging
- Extensible architecture for adding new export formats

## Usage

### Basic Usage

```typescript
import { exportManager, ExportFormat } from '../../utils/export'

// Export data to CSV
const success = await exportManager.export({
    data: myData,
    format: ExportFormat.CSV,
    outputPath: '/path/to/output.csv'
})

// Export data to JSON
const success = await exportManager.export({
    data: myData,
    format: ExportFormat.JSON,
    outputPath: '/path/to/output.json'
})

// Export data to PDF
const success = await exportManager.export({
    data: myData,
    format: ExportFormat.PDF,
    outputPath: '/path/to/output.pdf'
})
```

### Advanced Usage with Options

```typescript
import { exportManager, ExportFormat } from '../../utils/export'

// Export with custom options
const success = await exportManager.export({
    data: myData,
    format: ExportFormat.CSV,
    outputPath: '/path/to/output.csv',
    options: {
        // Include metadata in the export
        includeMetadata: true,
        
        // Select only specific fields
        customFields: ['id', 'name', 'email'],
        
        // Filter data based on criteria
        filterOptions: {
            status: 'active',
            type: 'user'
        }
    }
})
```

### Export Multiple Formats

```typescript
import { exportManager, ExportFormat } from '../../utils/export'

// Export to multiple formats at once
const results = await exportManager.exportMultiple(
    myData,
    '/path/to/output',
    [ExportFormat.CSV, ExportFormat.JSON, ExportFormat.PDF],
    {
        includeMetadata: true,
        customFields: ['id', 'name', 'email']
    }
)

// Check results
console.log(`CSV export: ${results[ExportFormat.CSV] ? 'Success' : 'Failed'}`)
console.log(`JSON export: ${results[ExportFormat.JSON] ? 'Success' : 'Failed'}`)
console.log(`PDF export: ${results[ExportFormat.PDF] ? 'Success' : 'Failed'}`)
```

## API Endpoints

The export functionality is exposed through the following API endpoints:

- `POST /api/v1/data-export/export` - Export data to a file
- `GET /api/v1/data-export/download/:filename` - Download an exported file

### Export Request Example

```json
{
    "entityType": "chatflow",
    "entityId": "123e4567-e89b-12d3-a456-426614174000",
    "format": "csv",
    "options": {
        "includeMetadata": true,
        "customFields": ["id", "name", "description"],
        "filterOptions": {
            "status": "published"
        }
    }
}
```

### Export Response Example

```json
{
    "success": true,
    "message": "Successfully exported 10 records to CSV",
    "filePath": "chatflow-123e4567-e89b-12d3-a456-426614174000-abcdef123456.csv",
    "format": "csv"
}
```

## Adding New Export Formats

To add a new export format:

1. Create a new exporter class that extends `BaseExporter`
2. Implement the `export` method
3. Register the exporter in `ExportManager`

Example:

```typescript
// Create a new exporter
export class XMLExporter extends BaseExporter {
    async export(data: any[], outputPath: string, options?: ExportOptions): Promise<boolean> {
        // Implementation for XML export
    }
}

// Add a new format to the enum
export enum ExportFormat {
    CSV = 'csv',
    JSON = 'json',
    PDF = 'pdf',
    XML = 'xml'  // New format
}

// Register the exporter
exportManager.registerExporter(ExportFormat.XML, new XMLExporter())
```

## Dependencies

- `fs` and `path` for file operations
- `pdfkit` for PDF generation
- `uuid` for unique file naming
