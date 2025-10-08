import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listAssignments, createAssignment, updateAssignment, deleteAssignment, type AssignmentDto, type Paginated } from '@/api/assignments'

export function useListAssignments(classId: number | string, page = 1, perPage = 10) {
  return useQuery<Paginated<AssignmentDto>>({
    queryKey: ['assignments', classId, page, perPage],
    queryFn: () => listAssignments(classId, { page, perPage }),
    enabled: Boolean(classId),
  })
}

export function useCreateAssignment(classId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<AssignmentDto>) => createAssignment(classId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments', classId] })
    },
  })
}

export function useUpdateAssignment(classId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<AssignmentDto> }) => updateAssignment(classId, id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['assignments', classId] })
      qc.invalidateQueries({ queryKey: ['assignment', classId, vars.id] })
    },
  })
}

export function useDeleteAssignment(classId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAssignment(classId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments', classId] })
    },
  })
}


