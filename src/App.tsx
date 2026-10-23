/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import {
  TabType,
  TeacherProfile,
  ClassInfo,
  Student,
  GradeRecord,
  ScheduleItem,
  NotificationItem,
  LessonPlan,
  LearningResource,
  GradeConfig,
  AttendanceSession
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ClassView } from './views/ClassView';
import { StudentView } from './views/StudentView';
import { AttendanceView } from './views/AttendanceView';
import { GradebookView } from './views/GradebookView';
import { AnalyticsView } from './views/AnalyticsView';
import { LessonPlanView } from './views/LessonPlanView';
import { ResourcesView } from './views/ResourcesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core state loaded from StorageService
  const [teacher, setTeacher] = useState<TeacherProfile>(() => StorageService.getTeacherProfile());
  const [classes, setClasses] = useState<ClassInfo[]>(() => StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [grades, setGrades] = useState<GradeRecord[]>(() => StorageService.getGrades());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => StorageService.getSchedule());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => StorageService.getLessonPlans());
  const [resources, setResources] = useState<LearningResource[]>(() => StorageService.getResources());
  const [gradeConfig, setGradeConfig] = useState<GradeConfig>(() => StorageService.getGradeConfig());
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => StorageService.getAttendanceSessions());

  // Function to refresh state from localStorage
  const refreshAllData = useCallback(() => {
    setTeacher(StorageService.getTeacherProfile());
    setClasses(StorageService.getClasses());
    setStudents(StorageService.getStudents());
    setGrades(StorageService.getGrades());
    setSchedule(StorageService.getSchedule());
    setNotifications(StorageService.getNotifications());
    setLessonPlans(StorageService.getLessonPlans());
    setResources(StorageService.getResources());
    setGradeConfig(StorageService.getGradeConfig());
    setAttendanceSessions(StorageService.getAttendanceSessions());
  }, []);

  // Listen to storage change events
  useEffect(() => {
    const handleStorageChange = () => {
      refreshAllData();
    };
    window.addEventListener('app_storage_change', handleStorageChange);
    return () => window.removeEventListener('app_storage_change', handleStorageChange);
  }, [refreshAllData]);

  // Handle teacher switching subject from header
  const handleSubjectChange = (subject: string) => {
    const updated = { ...teacher, defaultSubject: subject };
    StorageService.saveTeacherProfile(updated);
    setTeacher(updated);
  };

  // Handle teacher switching semester from header
  const handleSemesterChange = (semester: 'HKI' | 'HKII') => {
    const updated = { ...teacher, semester };
    StorageService.saveTeacherProfile(updated);
    setTeacher(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FD] text-slate-800 selection:bg-sky-200">
      {/* Top Header */}
      <Header
        teacher={teacher}
        notifications={notifications}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setCurrentTab('settings')}
        onSubjectChange={handleSubjectChange}
        onSemesterChange={handleSemesterChange}
      />

      {/* Mobile Top Bar with Hamburger */}
      <div className="lg:hidden bg-[#063B7A] text-white px-4 py-2 flex items-center justify-between border-t border-sky-800">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white/10 text-xs font-bold"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>Menu Chức năng</span>
        </button>

        <span className="text-xs font-bold text-sky-200">
          {currentTab === 'dashboard' && 'Tổng quan'}
          {currentTab === 'classes' && 'Lớp học'}
          {currentTab === 'students' && 'Học sinh'}
          {currentTab === 'attendance' && 'Điểm danh'}
          {currentTab === 'gradebook' && 'Sổ điểm'}
          {currentTab === 'analytics' && 'Thống kê'}
          {currentTab === 'lesson-plan' && 'Kế hoạch dạy học'}
          {currentTab === 'resources' && 'Học liệu số'}
          {currentTab === 'reports' && 'Báo cáo'}
          {currentTab === 'settings' && 'Cài đặt'}
        </span>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Center / Right Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              teacher={teacher}
              classes={classes}
              students={students}
              grades={grades}
              schedule={schedule}
              notifications={notifications}
              gradeConfig={gradeConfig}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'classes' && (
            <ClassView
              classes={classes}
              students={students}
              grades={grades}
              onRefreshData={refreshAllData}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'students' && (
            <StudentView
              students={students}
              classes={classes}
              grades={grades}
              gradeConfig={gradeConfig}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              classes={classes}
              students={students}
              sessions={attendanceSessions}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'gradebook' && (
            <GradebookView
              classes={classes}
              students={students}
              grades={grades}
              gradeConfig={gradeConfig}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              classes={classes}
              students={students}
              grades={grades}
              gradeConfig={gradeConfig}
            />
          )}

          {currentTab === 'lesson-plan' && (
            <LessonPlanView
              lessonPlans={lessonPlans}
              classes={classes}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'resources' && (
            <ResourcesView
              resources={resources}
              onRefreshData={refreshAllData}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              teacher={teacher}
              classes={classes}
              students={students}
              grades={grades}
              lessonPlans={lessonPlans}
              gradeConfig={gradeConfig}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              teacher={teacher}
              gradeConfig={gradeConfig}
              onRefreshData={refreshAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
