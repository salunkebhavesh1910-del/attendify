setTimeout(() => {
  document.getElementById('splashScreen').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'flex';
}, 1000);

function showCreateAnnouncementModal() {
  if (currentUser.role !== 'teacher') {
    alert('Only teachers can create announcements');
    return;
  }
  document.getElementById('createAnnouncementModal').style.display = 'flex';
  document.getElementById('createAnnouncementForm').reset();
}

function closeCreateAnnouncementModal() {
  document.getElementById('createAnnouncementModal').style.display = 'none';
}

document.getElementById('createAnnouncementForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('announcementTitle').value;
  const content = document.getElementById('announcementContent').value;
  
  db.announcements.unshift({
    id: 'ann_' + Date.now(),
    title: title,
    content: content,
    postedBy: currentUser.name,
    createdAt: new Date().toISOString()
  });
  saveToLocalStorage();
  
  alert('Announcement posted successfully!');
  closeCreateAnnouncementModal();
  loadTeacherDashboard();
});

function viewAnnouncements() {
  const announcementList = document.getElementById('announcementList');
  if (db.announcements.length === 0) {
    announcementList.innerHTML = '<div style="padding: 12px; text-align: center; color: #64748b;">No announcements yet</div>';
  } else {
    announcementList.innerHTML = db.announcements.map(a => `
      <div class="announcement-item">
        <strong>${a.title}</strong><br>
        <small>${a.content}</small><br>
        <div class="announcement-date">Posted by ${a.postedBy} on ${new Date(a.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
  }
  document.getElementById('announcementModal').style.display = 'flex';
}

function closeAnnouncementModal() {
  document.getElementById('announcementModal').style.display = 'none';
}

function viewAttendanceHistory() {
  const records = db.attendance.filter(a => a.studentId === currentUser.id).sort((a,b) => new Date(b.date) - new Date(a.date));
  
  let html = '<div style="max-height: 400px; overflow-y: auto;">';
  if (records.length === 0) {
    html += '<div style="padding: 20px; text-align: center; color: #64748b;">No attendance records yet</div>';
  } else {
    records.forEach(a => {
      html += `<div style="padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
        <span>${a.date}</span>
        <span style="color: ${a.status === 'present' ? '#10b981' : '#ef4444'}">${a.status.toUpperCase()}</span>
        <span>${a.time || '-'}</span>
      </div>`;
    });
  }
  html += '</div>';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `<div class="modal-content"><h3>Attendance History</h3>${html}<button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button></div>`;
  document.body.appendChild(modal);
}

function showLeaveModal() {
  document.getElementById('leaveModal').style.display = 'flex';
  document.getElementById('leaveApplicationForm').reset();
}

function closeLeaveModal() {
  document.getElementById('leaveModal').style.display = 'none';
}

document.getElementById('leaveApplicationForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fromDate = document.getElementById('leaveFromDate').value;
  const toDate = document.getElementById('leaveToDate').value;
  const reason = document.getElementById('leaveReason').value;
  
  db.leaves.push({
    id: Date.now(),
    studentId: currentUser.id,
    studentName: currentUser.name,
    rollNo: currentUser.rollNo || '',
    fromDate: fromDate,
    toDate: toDate,
    reason: reason,
    status: 'pending',
    appliedAt: new Date().toISOString()
  });
  saveToLocalStorage();
  
  alert('Leave application submitted successfully!');
  closeLeaveModal();
  loadStudentDashboard();
});

function viewAllLeaveApplications() {
  const leaves = db.leaves.filter(l => l.status !== 'approved');
  let html = '<div style="max-height: 400px; overflow-y: auto;">';
  if (leaves.length === 0) {
    html += '<div style="padding: 20px; text-align: center; color: #64748b;">No pending leave applications</div>';
  } else {
    leaves.forEach(l => {
      html += `<div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>${l.studentName}</strong> (${l.rollNo || 'N/A'})<br>
        📅 ${l.fromDate} to ${l.toDate}<br>
        📝 ${l.reason}<br>
        <span class="status-badge status-${l.status}">${l.status.toUpperCase()}</span>
        <div style="margin-top: 10px;">
          <button class="btn-primary" onclick="approveLeave('${l.id}')" style="padding: 6px 12px; font-size: 0.8rem; width: auto; margin-right: 8px;">Approve</button>
          <button class="btn-secondary" onclick="rejectLeave('${l.id}')" style="padding: 6px 12px; font-size: 0.8rem; width: auto;">Reject</button>
        </div>
      </div>`;
    });
  }
  html += '</div>';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `<div class="modal-content"><h3>Leave Applications</h3>${html}<button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button></div>`;
  document.body.appendChild(modal);
}

function approveLeave(leaveId) {
  const leaveIndex = db.leaves.findIndex(l => l.id == leaveId);
  if (leaveIndex !== -1) {
    db.leaves[leaveIndex].status = 'approved';
    saveToLocalStorage();
    alert(`Leave approved for ${db.leaves[leaveIndex].studentName}`);
    if (currentUser.role === 'teacher') {
      loadTeacherDashboard();
    }
    const modal = document.querySelector('.modal');
    if (modal && modal.innerHTML.includes('Leave Applications')) {
      modal.remove();
    }
  }
}

function rejectLeave(leaveId) {
  const leaveIndex = db.leaves.findIndex(l => l.id == leaveId);
  if (leaveIndex !== -1) {
    db.leaves[leaveIndex].status = 'rejected';
    saveToLocalStorage();
    alert(`Leave rejected for ${db.leaves[leaveIndex].studentName}`);
    if (currentUser.role === 'teacher') {
      loadTeacherDashboard();
    }
    const modal = document.querySelector('.modal');
    if (modal && modal.innerHTML.includes('Leave Applications')) {
      modal.remove();
    }
  }
}

function viewAttendanceReport() {
  const students = db.users.filter(u => u.role === 'student');
  let html = '<div style="max-height: 400px; overflow-y: auto;"><table style="width:100%"><thead><tr><th>Student</th><th>Present</th><th>Total</th><th>%</th> </thead><tbody>';
  
  students.forEach(s => {
    const studentAtt = db.attendance.filter(a => a.studentId === s.id);
    const present = studentAtt.filter(a => a.status === 'present').length;
    const total = studentAtt.length;
    const percent = total ? ((present/total)*100).toFixed(1) : 0;
    html += `<tr><td>${s.name}</td><td>${present}</td><td>${total}</td><td>${percent}%</td> </tr>`;
  });
  
  html += '</tbody> </table></div>';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `<div class="modal-content"><h3>Attendance Report</h3>${html}<button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button></div>`;
  document.body.appendChild(modal);
}

function showHelpSupport() {
  document.getElementById('helpModal').style.display = 'flex';
}

function closeHelpModal() {
  document.getElementById('helpModal').style.display = 'none';
}

function showNotifications() {
  alert('Notification Alerts\n\nYou will receive real-time notifications when attendance is marked.');
}

function showLinkChildModal() {
  document.getElementById('linkChildModal').style.display = 'flex';
  document.getElementById('linkChildRollNo').value = '';
}

function closeLinkChildModal() {
  document.getElementById('linkChildModal').style.display = 'none';
}

function linkChild() {
  const rollNo = document.getElementById('linkChildRollNo').value.trim();
  if (!rollNo) {
    alert('Please enter your child\'s roll number');
    return;
  }
  
  const child = db.users.find(u => u.role === 'student' && u.rollNo === rollNo);
  if (!child) {
    alert('No student found with this roll number. Please check and try again.');
    return;
  }
  
  const alreadyLinked = db.parentChildLinks.some(link => link.parentId === currentUser.id && link.childId === child.id);
  if (alreadyLinked) {
    alert(`${child.name} is already linked to your account.`);
    closeLinkChildModal();
    return;
  }
  
  db.parentChildLinks.push({
    id: 'link_' + Date.now(),
    parentId: currentUser.id,
    childId: child.id,
    childName: child.name,
    childRollNo: child.rollNo,
    linkedAt: new Date().toISOString()
  });
  saveToLocalStorage();
  
  alert(`Successfully linked ${child.name} (${rollNo}) to your account!`);
  closeLinkChildModal();
  loadParentDashboard();
}

initDatabase();

const savedUser = localStorage.getItem('attendify_current_user');
if (savedUser) {
  currentUser = JSON.parse(savedUser);
  setTimeout(() => {
    document.getElementById('splashScreen').style.display = 'none';
    showApp();
  }, 1000);
}