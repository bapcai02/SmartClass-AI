import { Route, Routes, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import AuthPage from '@/pages/Auth'
import DashboardPage from '@/pages/Dashboard'
import ClassPage from '@/pages/ClassPage'
import ClassesPage from '@/pages/Classes'
import ClassDetailsPage from '@/pages/ClassDetails'
import AssignmentDetailPage from '@/pages/AssignmentDetail'
import AssignmentsPage from '@/pages/Assignments'
import ReportsPage from '@/pages/Reports'
import ChatPage from '@/pages/Chat'
import ExamsPage from '@/pages/Exams'
import ResourcesPage from '@/pages/Resources'
import SettingsPage from '@/pages/Settings'
import QAPage from '@/pages/QA'
import LeaderboardPage from '@/pages/Leaderboard'
import ProfilePage from '@/pages/Profile'
import CreateClassPage from '@/pages/CreateClass'
import ClassStudentsPage from '@/pages/ClassStudents'
import ClassAttendancePage from '@/pages/ClassAttendance'
import ClassResourcesManagePage from '@/pages/ClassResources'
import ClassAssignmentsPage from '@/pages/ClassAssignments'
import ClassExamsPage from '@/pages/ClassExams'
import ClassGradebookPage from '@/pages/ClassGradebook'
import ClassAnnouncementsPage from '@/pages/ClassAnnouncements'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/new" element={<CreateClassPage />} />
        <Route path="/class/:id" element={<ClassDetailsPage />} />
        <Route path="/class/:id/students" element={<ClassStudentsPage />} />
        <Route path="/class/:id/attendance" element={<ClassAttendancePage />} />
        <Route path="/class/:id/resources" element={<ClassResourcesManagePage />} />
        <Route path="/class/:id/assignments" element={<ClassAssignmentsPage />} />
        <Route path="/class/:id/exams" element={<ClassExamsPage />} />
        <Route path="/class/:id/grades" element={<ClassGradebookPage />} />
        <Route path="/class/:id/announcements" element={<ClassAnnouncementsPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/assignment/:id" element={<AssignmentDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
