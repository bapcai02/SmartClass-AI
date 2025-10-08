import { useGetClasses, useDeleteClass } from '@/hooks/useClasses'
import { Button } from '@/components/ui/button'

type Props = {
  page: number
  perPage: number
  onPageChange: (p: number) => void
  onEdit?: (c: any) => void
}

export default function ClassTable({ page, perPage, onPageChange, onEdit }: Props) {
  const { data, isLoading, isError, error } = useGetClasses({ page, perPage })
  const del = useDeleteClass()

  if (isLoading) return <div className="p-4">Loading classes...</div>
  if (isError) return <div className="p-4 text-red-600">{(error as any)?.message || 'Failed to load'}</div>

  const items = (data as any)?.data || (data as any)?.items || []
  const meta = (data as any)?.meta || {
    current_page: (data as any)?.current_page || page,
    per_page: (data as any)?.per_page || perPage,
    total: (data as any)?.total || items.length,
    last_page: (data as any)?.last_page || 1,
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Subject</th>
            <th className="px-3 py-2 text-left">Teacher</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c: any) => (
            <tr key={c.id} className="border-t">
              <td className="px-3 py-2">{c.id}</td>
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.subject?.name || '-'}</td>
              <td className="px-3 py-2">{c.teacher?.name || '-'}</td>
              <td className="px-3 py-2 text-right">
                <Button variant="outline" className="mr-2" onClick={() => onEdit?.(c)}>Edit</Button>
                <Button
                  onClick={() => {
                    if (confirm('Delete this class?')) del.mutate(c.id)
                  }}
                  disabled={(del as any).isPending}
                >
                  {(del as any).isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t p-3 text-sm">
        <div>
          Page {meta.current_page} of {meta.last_page}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, meta.current_page - 1))}
            disabled={meta.current_page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(meta.last_page, meta.current_page + 1))}
            disabled={meta.current_page >= meta.last_page}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}


