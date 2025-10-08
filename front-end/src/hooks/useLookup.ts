import { useQuery } from '@tanstack/react-query'
import { searchSubjects, searchUsers, type SubjectDto, type UserDto } from '@/api/lookup'

export function useSubjectSearch(term: string) {
  return useQuery<SubjectDto[], Error>({
    queryKey: ['subjects', term],
    queryFn: () => searchSubjects(term),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useUserSearch(term: string, role?: string) {
  return useQuery<UserDto[], Error>({
    queryKey: ['users', term, role],
    queryFn: () => searchUsers(term, role),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}


