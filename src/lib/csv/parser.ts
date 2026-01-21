import Papa from 'papaparse'

export interface ParseResult {
  data: Record<string, unknown>[]
  errors: Papa.ParseError[]
  meta: Papa.ParseMeta
}

export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      encoding: 'UTF-8',
      complete: (results) => {
        // Check for encoding issues (replacement characters)
        const hasEncodingIssues = JSON.stringify(results.data).includes('\uFFFD')
        if (hasEncodingIssues) {
          // Retry with different encoding for Portuguese characters
          Papa.parse(file, {
            header: true,
            skipEmptyLines: 'greedy',
            dynamicTyping: true,
            transformHeader: (header) => header.trim().toLowerCase(),
            encoding: 'ISO-8859-1',
            complete: (retryResults) => {
              resolve({
                data: retryResults.data as Record<string, unknown>[],
                errors: retryResults.errors,
                meta: retryResults.meta,
              })
            },
          })
          return
        }
        resolve({
          data: results.data as Record<string, unknown>[],
          errors: results.errors,
          meta: results.meta,
        })
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{
            type: 'Quotes' as const,
            code: 'InvalidQuotes' as const,
            message: error.message,
            row: 0,
          }],
          meta: {} as Papa.ParseMeta,
        })
      },
    })
  })
}
