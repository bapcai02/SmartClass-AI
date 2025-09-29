import { Route, Routes, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import AuthPage from '@/pages/Auth'
import LoginPage from '@/pages/Login'
import PrivateRoute from '@/components/PrivateRoute'
import DashboardPage from '@/pages/Dashboard'
import ClassesPage from '@/pages/Classes'
import ClassDetailsPage from '@/pages/ClassDetails'
import AssignmentDetailPage from '@/pages/AssignmentDetail'
import AssignmentsPage from '@/pages/Assignments'
import ReportsPage from '@/pages/ReportsPage'
import ChatPage from '@/pages/Chat'
import ExamsPage from '@/pages/Exams'
import ResourcesPage from '@/pages/Resources'
import SettingsPage from '@/pages/Settings'
import QAPage from '@/pages/QA'
import LeaderboardPage from '@/pages/Leaderboard'
import ProfilePage from '@/pages/ProfilePage'
import AiChatPage from '@/pages/AiChatPage'
import CreateClassPage from '@/pages/CreateClass'
import ClassStudentsPage from '@/pages/ClassStudents'
import ClassAttendancePage from '@/pages/ClassAttendance'
import ClassResourcesManagePage from '@/pages/ClassResources'
import ClassAssignmentsPage from '@/pages/ClassAssignments'
import ClassExamsPage from '@/pages/ClassExams'
import ExamDetailPage from '@/pages/ExamDetail'
import ExamTakePage from '@/pages/ExamTake'
import ClassGradebookPage from '@/pages/ClassGradebook'
import ClassAnnouncementsPage from '@/pages/ClassAnnouncements'
import AllAssignmentsPage from '@/pages/AllAssignments'
import AllExamsPage from '@/pages/AllExams'
import AllQaPage from '@/pages/AllQaPage'
import AllResourcesPage from '@/pages/AllResourcesPage'
import QuestionBankPage from '@/pages/QuestionBank'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/classes" element={<PrivateRoute><ClassesPage /></PrivateRoute>} />
        <Route path="/classes/new" element={<PrivateRoute><CreateClassPage /></PrivateRoute>} />
        <Route path="/class/:id" element={<PrivateRoute><ClassDetailsPage /></PrivateRoute>} />
        <Route path="/class/:id/students" element={<PrivateRoute><ClassStudentsPage /></PrivateRoute>} />
        <Route path="/class/:id/attendance" element={<PrivateRoute><ClassAttendancePage /></PrivateRoute>} />
        <Route path="/class/:id/resources" element={<PrivateRoute><ClassResourcesManagePage /></PrivateRoute>} />
        <Route path="/class/:id/assignments" element={<PrivateRoute><ClassAssignmentsPage /></PrivateRoute>} />
        <Route path="/class/:id/exams" element={<PrivateRoute><ClassExamsPage /></PrivateRoute>} />
        <Route path="/class/:id/exam/:eid" element={<PrivateRoute><ExamDetailPage /></PrivateRoute>} />
        <Route path="/class/:id/grades" element={<PrivateRoute><ClassGradebookPage /></PrivateRoute>} />
        <Route path="/class/:id/announcements" element={<PrivateRoute><ClassAnnouncementsPage /></PrivateRoute>} />
        <Route path="/assignments" element={<PrivateRoute><AllAssignmentsPage /></PrivateRoute>} />
        <Route path="/assignment/:id" element={<PrivateRoute><AssignmentDetailPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/exams" element={<PrivateRoute><AllExamsPage /></PrivateRoute>} />
        <Route path="/resources" element={<PrivateRoute><AllResourcesPage /></PrivateRoute>} />
        <Route path="/question-bank" element={<PrivateRoute><QuestionBankPage /></PrivateRoute>} />
        <Route path="/qa" element={<PrivateRoute><AllQaPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><AiChatPage /></PrivateRoute>} />
      </Route>
      {/* Fullscreen exam taking route (no layout/menu) */}
      <Route path="/class/:id/exam/:eid/take" element={<PrivateRoute><ExamTakePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
