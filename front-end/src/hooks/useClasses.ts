import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClass, deleteClass, getClassById, getClasses, getClassDetail, getClassStudents, addClassStudents, removeClassStudents, updateClass, type ClassroomDto, type PaginatedResponse } from '@/api/classApi'

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

export function useGetClassDetail(id: number | string, options?: { include?: string[]; perPage?: { students?: number; assignments?: number; exams?: number; resources?: number } }) {
  return useQuery({
    queryKey: ['class-detail', id, options],
    queryFn: () => getClassDetail(id, options),
    enabled: Boolean(id),
  })
}

export function useClassStudents(classId: number | string, page = 1, perPage = 10, search = '') {
  return useQuery({
    queryKey: ['class-students', classId, page, perPage, search],
    queryFn: () => getClassStudents(classId, { page, perPage, search }),
    enabled: Boolean(classId),
    keepPreviousData: true,
  })
}

export function useAddClassStudents(classId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentIds: number[]) => addClassStudents(classId, studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-students', classId] })
      qc.invalidateQueries({ queryKey: ['class-detail', classId] })
    },
  })
}

export function useRemoveClassStudents(classId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentIds: number[]) => removeClassStudents(classId, studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-students', classId] })
      qc.invalidateQueries({ queryKey: ['class-detail', classId] })
    },
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


