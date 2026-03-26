let db = {
  users: [],
  attendance: [],
  leaves: [],
  parentChildLinks: [],
  announcements: []
};

function initDatabase() {
  const savedUsers = localStorage.getItem('attendify_users');
  const savedAttendance = localStorage.getItem('attendify_attendance');
  const savedLeaves = localStorage.getItem('attendify_leaves');
  const savedLinks = localStorage.getItem('attendify_parent_child_links');
  const savedAnnouncements = localStorage.getItem('attendify_announcements');
  
  if (savedUsers) db.users = JSON.parse(savedUsers);
  if (savedAttendance) db.attendance = JSON.parse(savedAttendance);
  if (savedLeaves) db.leaves = JSON.parse(savedLeaves);
  if (savedLinks) db.parentChildLinks = JSON.parse(savedLinks);
  if (savedAnnouncements) db.announcements = JSON.parse(savedAnnouncements);
  
  if (db.users.length === 0) {
    db.users = [
      { id: 'teacher1', name: 'Prof. Sarah Johnson', email: 'teacher@attendify.com', password: 'teacher123', role: 'teacher', createdAt: new Date().toISOString() },
      { id: 'student1', name: 'Alex Thompson', email: 'student@attendify.com', password: 'student123', role: 'student', rollNo: 'STU001', class: '10th Grade', createdAt: new Date().toISOString() },
      { id: 'student2', name: 'Emma Wilson', email: 'emma@demo.com', password: 'demo123', role: 'student', rollNo: 'STU002', class: '10th Grade', createdAt: new Date().toISOString() },
      { id: 'student3', name: 'James Chen', email: 'james@demo.com', password: 'demo123', role: 'student', rollNo: 'STU003', class: '10th Grade', createdAt: new Date().toISOString() },
      { id: 'parent1', name: 'Michael Brown', email: 'parent@attendify.com', password: 'parent123', role: 'parent', createdAt: new Date().toISOString() }
    ];
    
    db.announcements = [
      { id: 'ann1', title: 'Welcome to Attendify!', content: 'This is a demo announcement. Teachers can create announcements here.', postedBy: 'System', createdAt: new Date().toISOString() },
      { id: 'ann2', title: 'Parent-Teacher Meeting', content: 'Parent-Teacher meeting scheduled for March 30th at 10:00 AM.', postedBy: 'System', createdAt: new Date().toISOString() }
    ];
    
    db.parentChildLinks = [
      { id: 'link1', parentId: 'parent1', childId: 'student1', childName: 'Alex Thompson', childRollNo: 'STU001', linkedAt: new Date().toISOString() }
    ];
    
    db.leaves = [
      { id: 'leave1', studentId: 'student1', studentName: 'Alex Thompson', rollNo: 'STU001', fromDate: '2024-03-25', toDate: '2024-03-26', reason: 'Medical appointment', status: 'pending', appliedAt: new Date().toISOString() }
    ];
    
    saveToLocalStorage();
  }
}

function saveToLocalStorage() {
  localStorage.setItem('attendify_users', JSON.stringify(db.users));
  localStorage.setItem('attendify_attendance', JSON.stringify(db.attendance));
  localStorage.setItem('attendify_leaves', JSON.stringify(db.leaves));
  localStorage.setItem('attendify_parent_child_links', JSON.stringify(db.parentChildLinks));
  localStorage.setItem('attendify_announcements', JSON.stringify(db.announcements));
}