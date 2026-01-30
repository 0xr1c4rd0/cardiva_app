'use client'

/**
 * Generate a thumbnail from the first page of a PDF file
 * @param file - The PDF file to generate a thumbnail from
 * @param maxWidth - Maximum width of the thumbnail (default: 200)
 * @returns Promise<string> - Data URL of the thumbnail image
 */
export async function generatePDFThumbnail(
  file: File,
  maxWidth: number = 200
): Promise<string> {
  // Dynamically import pdfjs-dist to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source using unpkg.com CDN (has newer versions)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    // Get the first page
    const page = await pdf.getPage(1)

    // Calculate scale to fit within maxWidth
    const viewport = page.getViewport({ scale: 1 })
    const scale = maxWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

    // Create canvas for rendering
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Could not get canvas context')
    }

    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    // Render the page to canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas,
    }).promise

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png')

    // Cleanup
    pdf.destroy()

    return dataUrl
  } catch (error) {
    console.error('Failed to generate PDF thumbnail:', error)
    throw error
  }
}

/**
 * Generate thumbnails for multiple PDF files
 * @param files - Array of PDF files
 * @param maxWidth - Maximum width of thumbnails
 * @returns Promise<Map<string, string>> - Map of filename to thumbnail data URL
 */
export async function generatePDFThumbnails(
  files: File[],
  maxWidth: number = 200
): Promise<Map<string, string>> {
  const thumbnails = new Map<string, string>()

  await Promise.all(
    files.map(async (file) => {
      try {
        const thumbnail = await generatePDFThumbnail(file, maxWidth)
        thumbnails.set(file.name, thumbnail)
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${file.name}:`, error)
        // Don't add to map if failed
      }
    })
  )

  return thumbnails
}
