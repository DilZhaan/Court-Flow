import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './Button'

interface DataTableProps<T> {
  rows: T[]
  getKey: (row: T) => string
  columns: Array<{
    header: string
    render: (row: T) => ReactNode
    className?: string
  }>
  pageSize?: number
}

export function DataTable<T>({ rows, getKey, columns, pageSize = 8 }: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, pageCount)

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [currentPage, pageSize, rows])

  const startItem = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, rows.length)

  return (
    <div className="data-table">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th className={column.className} key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={getKey(row)}>
                {columns.map((column) => (
                  <td className={column.className} key={column.header}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize ? (
        <div className="pagination">
          <span>Showing {startItem}-{endItem} of {rows.length}</span>
          <div>
            <Button
              variant="secondary"
              icon={<ChevronLeft size={15} />}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <strong>{currentPage} / {pageCount}</strong>
            <Button
              variant="secondary"
              icon={<ChevronRight size={15} />}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
