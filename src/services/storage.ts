import {
  ClassInfo,
  Student,
  GradeRecord,
  GradeConfig,
  ScheduleItem,
  NotificationItem,
  LessonPlan,
  LearningResource,
  TeacherProfile,
  AttendanceSession
} from '../types';
import {
  initialClasses,
  initialStudents,
  initialGradeRecords,
  initialSchedule,
  initialNotifications,
  initialLessonPlans,
  initialResources,
  initialTeacherProfile,
  initialGradeConfig,
  initialAttendanceSessions,
  calculateStudentAverage,
  calculateTier
} from './initialData';

const STORAGE_KEYS = {
  CLASSES: 'thpt_td_classes_v2',
  STUDENTS: 'thpt_td_students_v2',
  GRADES: 'thpt_td_grades_v2',
  SCHEDULE: 'thpt_td_schedule_v2',
  NOTIFICATIONS: 'thpt_td_notifications_v2',
  LESSON_PLANS: 'thpt_td_lesson_plans_v2',
  RESOURCES: 'thpt_td_resources_v2',
  TEACHER: 'thpt_td_teacher_v2',
  CONFIG: 'thpt_td_config_v2',
  ATTENDANCE: 'thpt_td_attendance_v2',
};

// Safe localStorage getItem with fallback
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Safe localStorage setItem
function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('app_storage_change', { detail: { key } }));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Classes
  getClasses(): ClassInfo[] {
    return getStored<ClassInfo[]>(STORAGE_KEYS.CLASSES, initialClasses);
  },
  saveClasses(classes: ClassInfo[]): void {
    setStored(STORAGE_KEYS.CLASSES, classes);
  },
  addClass(newClass: Omit<ClassInfo, 'id'>): ClassInfo {
    const classes = this.getClasses();
    const created: ClassInfo = {
      ...newClass,
      id: `cls-${Date.now()}`,
    };
    classes.push(created);
    this.saveClasses(classes);
    return created;
  },
  updateClass(updated: ClassInfo): void {
    const classes = this.getClasses().map(c => c.id === updated.id ? updated : c);
    this.saveClasses(classes);
  },
  deleteClass(classId: string): boolean {
    const students = this.getStudents().filter(s => s.classId === classId);
    if (students.length > 0) {
      return false; // Prevent deleting class with students
    }
    const classes = this.getClasses().filter(c => c.id !== classId);
    this.saveClasses(classes);
    return true;
  },

  // Students
  getStudents(): Student[] {
    return getStored<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
  },
  saveStudents(students: Student[]): void {
    setStored(STORAGE_KEYS.STUDENTS, students);
  },
  addStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const created: Student = {
      ...student,
      id: `std-${Date.now()}`,
    };
    students.push(created);
    this.saveStudents(students);

    // Also create empty grade record for student
    const grades = this.getGrades();
    const teacher = this.getTeacherProfile();
    const gradeRec: GradeRecord = {
      id: `grd-${created.id}`,
      studentId: created.id,
      studentCode: created.code,
      studentName: created.name,
      classCode: created.className,
      subject: teacher.defaultSubject,
      semester: teacher.semester,
      academicYear: teacher.academicYear,
      tx1: null,
      tx2: null,
      tx3: null,
      tx4: null,
      gk: null,
      ck: null,
      avg: null,
      tier: null,
    };
    grades.push(gradeRec);
    this.saveGrades(grades);

    // Update class count
    const classes = this.getClasses().map(c => {
      if (c.code === created.className || c.id === created.classId) {
        return { ...c, studentCount: c.studentCount + 1 };
      }
      return c;
    });
    this.saveClasses(classes);

    return created;
  },
  updateStudent(student: Student): void {
    const students = this.getStudents().map(s => s.id === student.id ? student : s);
    this.saveStudents(students);

    // Also update studentName and classCode in grades
    const grades = this.getGrades().map(g => {
      if (g.studentId === student.id) {
        return {
          ...g,
          studentName: student.name,
          studentCode: student.code,
          classCode: student.className,
        };
      }
      return g;
    });
    this.saveGrades(grades);
  },
  deleteStudent(studentId: string): void {
    const students = this.getStudents();
    const target = students.find(s => s.id === studentId);
    const filtered = students.filter(s => s.id !== studentId);
    this.saveStudents(filtered);

    // Remove grade record
    const grades = this.getGrades().filter(g => g.studentId !== studentId);
    this.saveGrades(grades);

    // Update class count
    if (target) {
      const classes = this.getClasses().map(c => {
        if (c.code === target.className || c.id === target.classId) {
          return { ...c, studentCount: Math.max(0, c.studentCount - 1) };
        }
        return c;
      });
      this.saveClasses(classes);
    }
  },

  // Grades
  getGrades(): GradeRecord[] {
    return getStored<GradeRecord[]>(STORAGE_KEYS.GRADES, initialGradeRecords);
  },
  saveGrades(grades: GradeRecord[]): void {
    setStored(STORAGE_KEYS.GRADES, grades);
  },
  updateGradeRecord(record: GradeRecord): void {
    const config = this.getGradeConfig();
    const avg = calculateStudentAverage(record, config);
    const tier = calculateTier(avg, config);
    const updated: GradeRecord = {
      ...record,
      avg,
      tier,
      updatedAt: new Date().toISOString(),
    };
    const grades = this.getGrades().map(g => g.id === updated.id ? updated : g);
    this.saveGrades(grades);
  },
  batchUpdateGrades(records: GradeRecord[]): void {
    const config = this.getGradeConfig();
    const updatedMap = new Map<string, GradeRecord>();
    records.forEach(r => {
      const avg = calculateStudentAverage(r, config);
      const tier = calculateTier(avg, config);
      updatedMap.set(r.id, {
        ...r,
        avg,
        tier,
        updatedAt: new Date().toISOString(),
      });
    });

    const current = this.getGrades();
    const result = current.map(g => updatedMap.has(g.id) ? updatedMap.get(g.id)! : g);
    this.saveGrades(result);
  },

  // Grade Config
  getGradeConfig(): GradeConfig {
    return getStored<GradeConfig>(STORAGE_KEYS.CONFIG, initialGradeConfig);
  },
  saveGradeConfig(config: GradeConfig): void {
    setStored(STORAGE_KEYS.CONFIG, config);
    // Recalculate all grades with new config
    const grades = this.getGrades().map(g => {
      const avg = calculateStudentAverage(g, config);
      const tier = calculateTier(avg, config);
      return { ...g, avg, tier };
    });
    this.saveGrades(grades);
  },

  // Schedule
  getSchedule(): ScheduleItem[] {
    return getStored<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, initialSchedule);
  },
  saveSchedule(schedule: ScheduleItem[]): void {
    setStored(STORAGE_KEYS.SCHEDULE, schedule);
  },
  addScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const schedule = this.getSchedule();
    const created: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    schedule.push(created);
    this.saveSchedule(schedule);
    return created;
  },
  updateScheduleItem(item: ScheduleItem): void {
    const schedule = this.getSchedule().map(s => s.id === item.id ? item : s);
    this.saveSchedule(schedule);
  },
  deleteScheduleItem(itemId: string): void {
    const schedule = this.getSchedule().filter(s => s.id !== itemId);
    this.saveSchedule(schedule);
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  },
  saveNotifications(notifs: NotificationItem[]): void {
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationRead(id: string): void {
    const notifs = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(notifs);
  },
  markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(notifs);
  },

  // Lesson Plans
  getLessonPlans(): LessonPlan[] {
    return getStored<LessonPlan[]>(STORAGE_KEYS.LESSON_PLANS, initialLessonPlans);
  },
  saveLessonPlans(plans: LessonPlan[]): void {
    setStored(STORAGE_KEYS.LESSON_PLANS, plans);
  },
  addLessonPlan(plan: Omit<LessonPlan, 'id'>): LessonPlan {
    const plans = this.getLessonPlans();
    const created: LessonPlan = {
      ...plan,
      id: `lp-${Date.now()}`,
    };
    plans.push(created);
    this.saveLessonPlans(plans);
    return created;
  },
  updateLessonPlan(plan: LessonPlan): void {
    const plans = this.getLessonPlans().map(p => p.id === plan.id ? plan : p);
    this.saveLessonPlans(plans);
  },
  deleteLessonPlan(planId: string): void {
    const plans = this.getLessonPlans().filter(p => p.id !== planId);
    this.saveLessonPlans(plans);
  },

  // Resources
  getResources(): LearningResource[] {
    return getStored<LearningResource[]>(STORAGE_KEYS.RESOURCES, initialResources);
  },
  saveResources(resources: LearningResource[]): void {
    setStored(STORAGE_KEYS.RESOURCES, resources);
  },
  addResource(res: Omit<LearningResource, 'id'>): LearningResource {
    const resources = this.getResources();
    const created: LearningResource = {
      ...res,
      id: `res-${Date.now()}`,
    };
    resources.push(created);
    this.saveResources(resources);
    return created;
  },
  updateResource(res: LearningResource): void {
    const resources = this.getResources().map(r => r.id === res.id ? res : r);
    this.saveResources(resources);
  },
  deleteResource(resId: string): void {
    const resources = this.getResources().filter(r => r.id !== resId);
    this.saveResources(resources);
  },

  // Teacher Profile
  getTeacherProfile(): TeacherProfile {
    return getStored<TeacherProfile>(STORAGE_KEYS.TEACHER, initialTeacherProfile);
  },
  saveTeacherProfile(profile: TeacherProfile): void {
    setStored(STORAGE_KEYS.TEACHER, profile);
  },

  // Attendance Sessions
  getAttendanceSessions(): AttendanceSession[] {
    return getStored<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, initialAttendanceSessions);
  },
  saveAttendanceSessions(sessions: AttendanceSession[]): void {
    setStored(STORAGE_KEYS.ATTENDANCE, sessions);
  },
  saveOrUpdateAttendanceSession(session: AttendanceSession): void {
    const sessions = this.getAttendanceSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    this.saveAttendanceSessions(sessions);
  },
  deleteAttendanceSession(sessionId: string): void {
    const sessions = this.getAttendanceSessions().filter(s => s.id !== sessionId);
    this.saveAttendanceSessions(sessions);
  },

  // Reset to default
  resetAllToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.GRADES);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.LESSON_PLANS);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.TEACHER);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    window.dispatchEvent(new CustomEvent('app_storage_change', { detail: { key: 'ALL' } }));
  },

  // Export full JSON backup
  exportJsonBackup(): string {
    const backup = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      school: 'TRƯỜNG THPT TRÀNG ĐỊNH',
      teacher: this.getTeacherProfile(),
      config: this.getGradeConfig(),
      classes: this.getClasses(),
      students: this.getStudents(),
      grades: this.getGrades(),
      schedule: this.getSchedule(),
      notifications: this.getNotifications(),
      lessonPlans: this.getLessonPlans(),
      resources: this.getResources(),
      attendance: this.getAttendanceSessions(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore JSON backup
  restoreJsonBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.classes && Array.isArray(data.classes)) this.saveClasses(data.classes);
      if (data.students && Array.isArray(data.students)) this.saveStudents(data.students);
      if (data.grades && Array.isArray(data.grades)) this.saveGrades(data.grades);
      if (data.schedule && Array.isArray(data.schedule)) this.saveSchedule(data.schedule);
      if (data.notifications && Array.isArray(data.notifications)) this.saveNotifications(data.notifications);
      if (data.lessonPlans && Array.isArray(data.lessonPlans)) this.saveLessonPlans(data.lessonPlans);
      if (data.resources && Array.isArray(data.resources)) this.saveResources(data.resources);
      if (data.attendance && Array.isArray(data.attendance)) this.saveAttendanceSessions(data.attendance);
      if (data.teacher) this.saveTeacherProfile(data.teacher);
      if (data.config) this.saveGradeConfig(data.config);
      return true;
    } catch (e) {
      console.error('Failed to parse restore backup:', e);
      return false;
    }
  },

  // Export CSV with UTF-8 BOM
  exportCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
    const bom = '\uFEFF';
    const csvContent = bom + [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
