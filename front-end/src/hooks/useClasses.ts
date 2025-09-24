import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClass, deleteClass, getClassById, getClasses, updateClass, type ClassroomDto, type PaginatedResponse } from '@/api/classApi'

export function useGetClasses({ page = 1, perPage = 10 }: { page?: number; perPage?: number } = {}) {
  return useQuery<PaginatedResponse<ClassroomDto>>({
    queryKey: ['classes', page, perPage],
    queryFn: () => getClasses({ page, perPage }),
    keepPreviousData: true,
  })
}

export function useGetClass(id: number | string) {
  return useQuery<ClassroomDto>({
    queryKey: ['class', id],
    queryFn: () => getClassById(id),
    enabled: Boolean(id),
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ClassroomDto>) => createClass(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<ClassroomDto> }) => updateClass(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['class', vars.id] })
    },
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}


