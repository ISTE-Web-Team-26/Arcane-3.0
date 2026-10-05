import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { membersOf, teamNameOf } from './admin.ts'
import type { AdminRow } from './admin.ts'

/** Participant export (XLSX).
 *
 * Privacy: this deliberately picks ONLY name / class (branch) / batch /
 * semester per member plus blank signature cells. Emails, phone numbers and
 * everything else in the registration payload are never read here.
 */

export interface ExportSheet {
  name: string
  aoa: (string | number)[][]
}

export interface ExportSection {
  title: string
  aoa: (string | number)[][]
}

/** jsPDF's built-in fonts are WinAnsi — strip glyphs outside it. */
function pdfText(value: string | number): string {
  return String(value ?? '')
    .replace(/₹/g, 'Rs. ')
    .replace(/[★•]/g, '')
    .replace(/[—–]/g, '-')
}

/** Print-formatted PDF: landscape, ruled grid, every column fitted to the
 *  page width, header repeated on each page, rows flowing across pages. */
export function downloadPdf(filename: string, sections: ExportSection[]): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 36
  const usableW = pageW - margin * 2
  const ink: [number, number, number] = [25, 25, 28]
  const grid: [number, number, number] = [175, 175, 180]
  const headFill: [number, number, number] = [170, 52, 48]
  const zebra: [number, number, number] = [244, 243, 245]

  // Relative column widths: No | Ticket | Team | Member | Class/Batch/Sem | Signature
  const weights = [0.5, 1.3, 2.2, 2.0, 2.2, 1.8]
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const colW = weights.map((w) => (usableW * w) / weightSum)
  const colX: number[] = []
  colW.reduce((x, w, i) => {
    colX[i] = x
    return x + w
  }, margin)

  const headH = 24
  const lineH = 12
  const pad = 5
  let y = 0

  const gridRow = (top: number, height: number) => {
    doc.setDrawColor(...grid)
    doc.setLineWidth(0.75)
    doc.rect(margin, top, usableW, height, 'D')
    for (let i = 1; i < colW.length; i++) {
      doc.line(colX[i], top, colX[i], top + height)
    }
  }

  const drawHead = (headers: (string | number)[]) => {
    doc.setFillColor(...headFill)
    doc.rect(margin, y, usableW, headH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    headers.forEach((h, i) => {
      doc.text(pdfText(h).toUpperCase(), colX[i] + pad, y + 16)
    })
    gridRow(y, headH)
    y += headH
  }

  sections.forEach((section, si) => {
    if (si > 0) doc.addPage()
    y = margin
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...ink)
    doc.text(pdfText(section.title), margin, y + 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(110, 110, 115)
    doc.text(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      pageW - margin,
      y + 14,
      { align: 'right' },
    )
    y += 30

    const headers = section.aoa[0] ?? []
    const body = section.aoa.length > 1 ? section.aoa.slice(1) : [['', '', 'No participants', '', '', '']]
    drawHead(headers)

    body.forEach((cells, ri) => {
      const lines = cells.map((c, i) =>
        doc.splitTextToSize(pdfText(c), colW[i] - pad * 2),
      )
      const rowH = Math.max(...lines.map((l) => l.length)) * lineH + pad * 2
      if (y + rowH > pageH - margin) {
        doc.addPage()
        y = margin
        drawHead(headers)
      }
      if (ri % 2 === 1) {
        doc.setFillColor(...zebra)
        doc.rect(margin, y, usableW, rowH, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...ink)
      lines.forEach((wrapped, i) => {
        doc.text(wrapped as string[], colX[i] + pad, y + pad + 9)
      })
      gridRow(y, rowH)
      y += rowH
    })
  })

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(110, 110, 115)
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 16, {
      align: 'right',
    })
  }

  doc.save(filename)
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function memberField(
  member: unknown,
  key: 'name' | 'branch' | 'batch' | 'semester',
): string {
  if (typeof member !== 'object' || member === null) return ''
  return text((member as Record<string, unknown>)[key])
}

/** One row per member (vertical layout). Registrations with no member data
 *  still get a single blank-member row so no ticket goes missing. */
export function buildParticipantSheet(rows: AdminRow[]): (string | number)[][] {
  const header: string[] = [
    'No',
    'Ticket',
    'Team Name',
    'Member Name',
    'Class / Batch / Sem',
    'Signature',
  ]
  const aoa: (string | number)[][] = [header]
  let serial = 0
  for (const row of rows) {
    const members = membersOf(row)
    const team = teamNameOf(row)
    const ticket = row.ticket ?? `#${row.id}`
    const teamCell = team === '—' ? '' : team
    const list = members.length > 0 ? members : [null]
    for (const member of list) {
      serial += 1
      const detail = member
        ? [memberField(member, 'branch'), memberField(member, 'batch'), memberField(member, 'semester')]
            .filter((part) => part !== '')
            .join(' / ')
        : ''
      aoa.push([
        serial,
        ticket,
        teamCell,
        member ? memberField(member, 'name') : '',
        detail,
        '', // Signature — signed on site.
      ])
    }
  }
  return aoa
}

/** XLSX sheet names forbid \ / ? * [ ] : and cap at 31 chars. */
export function sheetName(name: string): string {
  const clean = (name || 'Event').replace(/[\\/?*[\]:]/g, '').slice(0, 31)
  return clean || 'Event'
}

export function downloadWorkbook(filename: string, sheets: ExportSheet[]): void {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.aoa)
    ws['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 24 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, sheetName(sheet.name))
  }
  XLSX.writeFile(wb, filename)
}
