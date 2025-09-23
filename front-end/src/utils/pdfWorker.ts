// Configure pdfjs worker for react-pdf
import { pdfjs } from 'react-pdf'
// @ts-expect-error pdfjs-dist provides worker in dist
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc as unknown as string

export {}

