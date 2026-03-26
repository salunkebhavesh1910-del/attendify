function showApp() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  document.getElementById('userNameDisplay').innerText = currentUser.name;
  
  const badge = document.getElementById('userRoleBadge');
  badge.innerText = `Role: ${currentUser.role.toUpperCase()}`;
  badge.className = `badge badge-${currentUser.role}`;
  
  if (currentUser.role === 'student') {
    loadStudentDashboard();
  } else if (currentUser.role === 'teacher') {
    loadTeacherDashboard();
  } else if (currentUser.role === 'parent') {
    loadParentDashboard();
  }
}

function loadStudentDashboard() {
  const studentAttendance = db.attendance.filter(a => a.studentId === currentUser.id);
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'present').length;
  const attendancePercent = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 100;
  const studentLeaves = db.leaves.filter(l => l.studentId === currentUser.id);
  
  const dashboard = document.getElementById('dashboardContent');
  dashboard.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><h3><i class="fas fa-calendar"></i> Total Days</h3><div class="stat-number">${totalDays || 0}</div></div>
      <div class="stat-card"><h3><i class="fas fa-check-circle"></i> Present</h3><div class="stat-number">${presentDays}</div></div>
      <div class="stat-card"><h3><i class="fas fa-chart-line"></i> Attendance</h3><div class="stat-number">${attendancePercent}%</div></div>
    </div>
    
    <div class="features-grid">
      <div class="feature-card" onclick="showQRCode()">
        <div class="feature-icon"><i class="fas fa-qrcode"></i></div>
        <h3>My QR Code</h3>
        <p>Show your personal QR code to teacher for attendance scanning</p>
      </div>
      <div class="feature-card" onclick="viewAnnouncements()">
        <div class="feature-icon"><i class="fas fa-bullhorn"></i></div>
        <h3>Announcements</h3>
        <p>View latest school announcements</p>
      </div>
      <div class="feature-card" onclick="viewAttendanceHistory()">
        <div class="feature-icon"><i class="fas fa-history"></i></div>
        <h3>Attendance History</h3>
        <p>View your complete attendance records</p>
      </div>
      <div class="feature-card" onclick="showLeaveModal()">
        <div class="feature-icon"><i class="fas fa-calendar-alt"></i></div>
        <h3>Leave Application</h3>
        <p>Submit leave requests</p>
      </div>
      <div class="feature-card" onclick="showHelpSupport()">
        <div class="feature-icon"><i class="fas fa-headset"></i></div>
        <h3>Help & Support</h3>
        <p>Get assistance and FAQs</p>
      </div>
    </div>
    
    <div class="announcement-area">
      <h3><i class="fas fa-megaphone"></i> Latest Announcements</h3>
      <ul class="announcement-list">
        ${db.announcements.slice(0, 5).map(a => `
          <li><i class="fas fa-bullhorn" style="color:#2563eb;"></i><div><strong>${a.title}</strong><br><small>${a.content}</small><br><small style="color:#64748b;">📅 ${new Date(a.createdAt).toLocaleDateString()}</small></div></li>
        `).join('') || '<li style="color:#64748b;">No announcements yet</li>'}
      </ul>
    </div>
    
    <div class="announcement-area">
      <h3><i class="fas fa-file-alt"></i> My Leave Applications</h3>
      <ul class="announcement-list">
        ${studentLeaves.length > 0 ? studentLeaves.map(l => `
          <li><i class="fas fa-calendar-week" style="color:#10b981;"></i><div><strong>${l.fromDate} to ${l.toDate}</strong><br><small>${l.reason}</small></div><span class="status-badge status-${l.status}">${l.status.toUpperCase()}</span></li>
        `).join('') : '<li style="color:#64748b;">No leave applications found</li>'}
      </ul>
    </div>
  `;
}

function loadTeacherDashboard() {
  const students = db.users.filter(u => u.role === 'student');
  const today = new Date().toISOString().split('T')[0];
  const presentToday = db.attendance.filter(a => a.date === today && a.status === 'present').length;
  const attendancePercent = students.length ? ((presentToday / students.length) * 100).toFixed(1) : 0;
  
  const recentAttendance = [...db.attendance].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  const pendingLeaves = db.leaves.filter(l => l.status === 'pending');
  
  const dashboard = document.getElementById('dashboardContent');
  dashboard.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><h3><i class="fas fa-users"></i> Total Students</h3><div class="stat-number">${students.length}</div></div>
      <div class="stat-card"><h3><i class="fas fa-check-circle"></i> Present Today</h3><div class="stat-number">${presentToday}</div></div>
      <div class="stat-card"><h3><i class="fas fa-chart-line"></i> Today's Rate</h3><div class="stat-number">${attendancePercent}%</div></div>
    </div>
    
    <div class="features-grid">
      <div class="feature-card" onclick="openQRScanner()">
        <div class="feature-icon"><i class="fas fa-camera"></i></div>
        <h3>QR Code Scanner</h3>
        <p>Scan student QR codes to mark attendance instantly</p>
      </div>
      <div class="feature-card" onclick="showCreateAnnouncementModal()">
        <div class="feature-icon"><i class="fas fa-edit"></i></div>
        <h3>Create Announcement</h3>
        <p>Post announcements for students and parents</p>
      </div>
      <div class="feature-card" onclick="viewAllLeaveApplications()">
        <div class="feature-icon"><i class="fas fa-file-alt"></i></div>
        <h3>Leave Requests</h3>
        <p>Review student leave applications</p>
      </div>
      <div class="feature-card" onclick="viewAttendanceReport()">
        <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
        <h3>Attendance Report</h3>
        <p>View overall class attendance report</p>
      </div>
      <div class="feature-card" onclick="showHelpSupport()">
        <div class="feature-icon"><i class="fas fa-headset"></i></div>
        <h3>Help & Support</h3>
        <p>Teacher resources and support</p>
      </div>
    </div>
    
    <div class="announcement-area">
      <h3><i class="fas fa-bullhorn"></i> Recent Announcements</h3>
      <ul class="announcement-list">
        ${db.announcements.slice(0, 5).map(a => `
          <li><i class="fas fa-bullhorn" style="color:#2563eb;"></i><div><strong>${a.title}</strong><br><small>${a.content}</small><br><small style="color:#64748b;">Posted by ${a.postedBy} on ${new Date(a.createdAt).toLocaleDateString()}</small></div></li>
        `).join('') || '<li style="color:#64748b;">No announcements yet. Create one above!</li>'}
      </ul>
    </div>
    
    <div class="announcement-area">
      <h3><i class="fas fa-clock"></i> Recent Activity</h3>
      <ul class="announcement-list">
        ${recentAttendance.map(a => `
          <li><i class="fas fa-qrcode" style="color:#10b981;"></i> ${a.studentName} marked ${a.status} at ${a.time || 'N/A'} on ${a.date}</li>
        `).join('') || '<li>No recent activity</li>'}
      </ul>
    </div>
    
    ${pendingLeaves.length > 0 ? `
    <div class="announcement-area">
      <h3><i class="fas fa-file-alt"></i> Pending Leave Requests</h3>
      <ul class="announcement-list">
        ${pendingLeaves.map(l => `
          <li>
            <div style="flex: 1;">
              <strong>${l.studentName}</strong> (${l.rollNo})<br>
              <small>📅 ${l.fromDate} to ${l.toDate}</small><br>
              <small>📝 ${l.reason}</small>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-primary" onclick="approveLeave('${l.id}')" style="padding: 6px 12px; font-size: 0.8rem; width: auto; margin: 0;">Approve</button>
              <button class="btn-secondary" onclick="rejectLeave('${l.id}')" style="padding: 6px 12px; font-size: 0.8rem; width: auto; margin: 0;">Reject</button>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
  `;
}

function loadParentDashboard() {
  const links = db.parentChildLinks.filter(link => link.parentId === currentUser.id);
  
  let childrenHtml = '<div class="children-list"><h3><i class="fas fa-child"></i> My Children</h3><div class="children-list-items">';
  
  if (links.length === 0) {
    childrenHtml += `
      <div style="text-align: center; padding: 2rem;">
        <i class="fas fa-child" style="font-size: 4rem; color: #2563eb; margin-bottom: 1rem; display: block;"></i>
        <h3>No Children Linked Yet</h3>
        <p style="margin: 1rem 0;">Link your child using their roll number to view their attendance</p>
        <button class="btn-primary" onclick="showLinkChildModal()" style="width: auto; padding: 0.75rem 1.5rem;">Link Child</button>
      </div>
    `;
  } else {
    let totalPresent = 0;
    let totalDays = 0;
    
    links.forEach(link => {
      const child = db.users.find(u => u.id === link.childId);
      const childAttendance = db.attendance.filter(a => a.studentId === link.childId);
      const present = childAttendance.filter(a => a.status === 'present').length;
      const total = childAttendance.length;
      const percent = total ? ((present/total)*100).toFixed(1) : 0;
      
      totalPresent += present;
      totalDays += total;
      
      const recentAttendance = [...childAttendance].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
      
      childrenHtml += `
        <div class="child-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <strong style="font-size: 1.1rem;">${link.childName}</strong>
              <br>
              <small style="color: #64748b;">Roll No: ${link.childRollNo} | Class: ${child?.class || 'N/A'}</small>
            </div>
            <span class="status-badge" style="background: ${percent >= 75 ? '#dcfce7' : '#fed7aa'}; color: ${percent >= 75 ? '#166534' : '#9a3412'}">
              ${percent}% Attendance
            </span>
          </div>
          <div style="margin-top: 8px;">
            ${recentAttendance.map(a => `
              <span style="display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 12px; font-size: 0.7rem; background: ${a.status === 'present' ? '#dcfce7' : '#fee2e2'}; color: ${a.status === 'present' ? '#166534' : '#991b1b'}">
                ${a.date.split('-').slice(1).join('/')}: ${a.status}
              </span>
            `).join('') || '<small>No records yet</small>'}
          </div>
        </div>
      `;
    });
    
    const overallPercent = totalDays ? ((totalPresent/totalDays)*100).toFixed(1) : 0;
    
    childrenHtml = `
      <div class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-card"><h3><i class="fas fa-child"></i> My Children</h3><div class="stat-number">${links.length}</div></div>
        <div class="stat-card"><h3><i class="fas fa-check-circle"></i> Overall Present</h3><div class="stat-number">${totalPresent}/${totalDays}</div></div>
        <div class="stat-card"><h3><i class="fas fa-chart-line"></i> Overall Rate</h3><div class="stat-number">${overallPercent}%</div></div>
      </div>
      ${childrenHtml}
    `;
    childrenHtml += '</div></div>';
  }
  
  const dashboard = document.getElementById('dashboardContent');
  dashboard.innerHTML = `
    ${childrenHtml}
    
    <div class="features-grid">
      <div class="feature-card" onclick="showLinkChildModal()">
        <div class="feature-icon"><i class="fas fa-plus-circle"></i></div>
        <h3>Link Another Child</h3>
        <p>Add another child using their roll number</p>
      </div>
      <div class="feature-card" onclick="viewAnnouncements()">
        <div class="feature-icon"><i class="fas fa-bullhorn"></i></div>
        <h3>Announcements</h3>
        <p>School announcements</p>
      </div>
      <div class="feature-card" onclick="showHelpSupport()">
        <div class="feature-icon"><i class="fas fa-headset"></i></div>
        <h3>Help & Support</h3>
        <p>Parent support resources</p>
      </div>
    </div>
    
    <div class="announcement-area">
      <h3><i class="fas fa-megaphone"></i> Latest Announcements</h3>
      <ul class="announcement-list">
        ${db.announcements.slice(0, 5).map(a => `
          <li><i class="fas fa-bullhorn" style="color:#2563eb;"></i><div><strong>${a.title}</strong><br><small>${a.content}</small><br><small style="color:#64748b;">📅 ${new Date(a.createdAt).toLocaleDateString()}</small></div></li>
        `).join('') || '<li style="color:#64748b;">No announcements yet</li>'}
      </ul>
    </div>
  `;
}