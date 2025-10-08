import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  HelpCircle, 
  Trash2, 
  User, 
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react'
import { 
  getMyQaPosts, 
  getMyQaAnswers, 
  getQaStats,
  deleteQaPost,
  deleteQaAnswer,
} from '@/api/qa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function AllQaPage() {
  const [activeTab, setActiveTab] = useState('questions')
  const [page, setPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['qa-stats'],
    queryFn: getQaStats,
  })

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['my-qa-posts', page],
    queryFn: () => getMyQaPosts({ page, perPage: 15 }),
  })

  const { data: answersData, isLoading: answersLoading } = useQuery({
    queryKey: ['my-qa-answers', page],
    queryFn: () => getMyQaAnswers({ page, perPage: 15 }),
  })

  const deletePostMutation = useMutation({
    mutationFn: deleteQaPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-qa-posts'] })
      queryClient.invalidateQueries({ queryKey: ['qa-stats'] })
    },
  })

  const deleteAnswerMutation = useMutation({
    mutationFn: deleteQaAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-qa-answers'] })
      queryClient.invalidateQueries({ queryKey: ['qa-stats'] })
    },
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeletePost = (id: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deletePostMutation.mutate(id)
    }
  }

  const handleDeleteAnswer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      deleteAnswerMutation.mutate(id)
    }
  }

  const tabs = [
    { id: 'questions', label: 'My Questions', icon: HelpCircle },
    { id: 'answers', label: 'My Answers', icon: MessageCircle },
  ]

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">My Q&A</h1>
          <p className="text-slate-600">Manage your questions and answers</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.total_questions}</div>
                  <div className="text-sm text-slate-600">Total Questions</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.total_answers}</div>
                  <div className="text-sm text-slate-600">Total Answers</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.recent_questions}</div>
                  <div className="text-sm text-slate-600">Recent Questions</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.recent_answers}</div>
                  <div className="text-sm text-slate-600">Recent Answers</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-brand-blue text-white' 
                      : 'text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">My Questions</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {questionsLoading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(showAll ? questionsData?.data : questionsData?.data?.slice(0, 10))?.map((question) => (
                  <Card key={question.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-slate-900">Question</h3>
                        </div>
                        <p className="mb-3 text-slate-700">{question.question_text}</p>
                        {question.image_url && (
                          <div className="mb-3">
                            <img 
                              src={question.image_url} 
                              alt="Question image" 
                              className="max-w-xs rounded-lg border border-slate-200"
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{question.user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(question.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answers.length} answers</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(question.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Answers Tab */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">My Answers</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {answersLoading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(showAll ? answersData?.data : answersData?.data?.slice(0, 10))?.map((answer) => (
                  <Card key={answer.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-slate-900">Answer</h3>
                        </div>
                        <p className="mb-3 text-slate-700">{answer.answer_text}</p>
                        {answer.post && (
                          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="text-sm font-medium text-slate-600 mb-1">Original Question:</div>
                            <div className="text-sm text-slate-700">{answer.post.question_text}</div>
                            <div className="mt-1 text-xs text-slate-500">by {answer.post.user.name}</div>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{answer.user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(answer.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAnswer(answer.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {((activeTab === 'questions' && questionsData?.last_page && questionsData.last_page > 1) ||
          (activeTab === 'answers' && answersData?.last_page && answersData.last_page > 1)) && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, (activeTab === 'questions' ? questionsData?.last_page : answersData?.last_page) || 1) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg ${page === pageNum ? 'bg-brand-blue text-white' : ''}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min((activeTab === 'questions' ? questionsData?.last_page : answersData?.last_page) || 1, p + 1))}
              disabled={page === (activeTab === 'questions' ? questionsData?.last_page : answersData?.last_page)}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'questions' && questionsData?.data?.length === 0) ||
          (activeTab === 'answers' && answersData?.data?.length === 0)) && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              {activeTab === 'questions' ? (
                <HelpCircle className="h-8 w-8 text-slate-400" />
              ) : (
                <MessageCircle className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No {activeTab === 'questions' ? 'questions' : 'answers'} found
            </h3>
            <p className="text-slate-600">
              {activeTab === 'questions' 
                ? "You haven't asked any questions yet." 
                : "You haven't answered any questions yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
