let scanner = null;
let isScanning = false;

function showQRCode() {
  const qrData = currentUser.rollNo;
  const qrcodeContainer = document.getElementById('qrcode');
  qrcodeContainer.innerHTML = '';
  
  const qrDiv = document.createElement('div');
  qrDiv.style.display = 'flex';
  qrDiv.style.justifyContent = 'center';
  qrDiv.style.alignItems = 'center';
  qrDiv.style.margin = '0 auto';
  qrcodeContainer.appendChild(qrDiv);
  
  new QRCode(qrDiv, {
    text: qrData,
    width: 250,
    height: 250,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  const qrCanvas = qrDiv.querySelector('canvas');
  if (qrCanvas) {
    qrCanvas.style.width = '250px';
    qrCanvas.style.height = '250px';
    qrCanvas.style.margin = '0 auto';
    qrCanvas.style.display = 'block';
  }
  
  document.getElementById('qrStudentId').innerHTML = `${qrData}<br>${currentUser.name}<br>${currentUser.class || ''}`;
  document.getElementById('qrModal').style.display = 'flex';
}

function closeQRModal() {
  document.getElementById('qrModal').style.display = 'none';
}

async function openQRScanner() {
  const modal = document.getElementById('qrScannerModal');
  modal.style.display = 'flex';
  const statusDiv = document.getElementById('scannerStatus');
  statusDiv.innerHTML = '<div class="scanner-status info">Requesting camera access...</div>';
  document.getElementById('manualStudentId').value = '';
  
  try {
    if (scanner) {
      try {
        await scanner.stop();
      } catch(e) {}
      scanner = null;
    }
    
    const readerDiv = document.getElementById('qr-reader');
    readerDiv.innerHTML = '';
    
    scanner = new Html5Qrcode("qr-reader");
    
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) {
      statusDiv.innerHTML = '<div class="scanner-status error">No cameras found. Please use manual entry.</div>';
      return;
    }
    
    const cameraId = cameras[0].id;
    statusDiv.innerHTML = '<div class="scanner-status info">Camera ready. Position QR code in frame.</div>';
    isScanning = true;
    
    await scanner.start(
      cameraId,
      {
        fps: 30,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0
      },
      (decodedText) => {
        console.log("QR DETECTED:", decodedText);
        statusDiv.innerHTML = `<div class="scanner-status info">Detected: ${decodedText}</div>`;
        if (isScanning) {
          handleQRResult(decodedText);
        }
      },
      (error) => {
        console.log("Scanning...");
      }
    );
  } catch (err) {
    console.error("Scanner error:", err);
    statusDiv.innerHTML = '<div class="scanner-status error">Failed to start camera. Please check permissions.</div>';
    isScanning = false;
  }
}

function handleQRResult(decodedText) {
  console.log("Processing QR result:", decodedText);
  
  if (!isScanning) {
    console.log("Not scanning, ignoring");
    return;
  }
  
  isScanning = false;
  
  if (scanner) {
    console.log("Stopping scanner");
    scanner.stop().catch(e => console.log("Stop error:", e));
  }
  
  const statusDiv = document.getElementById('scannerStatus');
  statusDiv.innerHTML = `<div class="scanner-status info">Found: ${decodedText} - Checking student...</div>`;
  
  console.log("Looking for student with rollNo:", decodedText);
  console.log("All students:", db.users.filter(u => u.role === 'student').map(s => ({name: s.name, rollNo: s.rollNo})));
  
  const student = db.users.find(u => u.role === 'student' && u.rollNo === decodedText);
  
  if (student) {
    console.log("Student found:", student.name);
    const today = new Date().toISOString().split('T')[0];
    const existing = db.attendance.find(a => a.studentId === student.id && a.date === today);
    
    if (existing) {
      console.log("Already marked present");
      statusDiv.innerHTML = `<div class="scanner-status error">${student.name} already marked present today!</div>`;
      setTimeout(() => {
        if (document.getElementById('qrScannerModal').style.display === 'flex') {
          isScanning = false;
          openQRScanner();
        }
      }, 2000);
    } else {
      console.log("Marking attendance for:", student.name);
      db.attendance.push({
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        date: today,
        status: 'present',
        time: new Date().toLocaleTimeString(),
        markedBy: currentUser.name,
        timestamp: new Date().toISOString()
      });
      saveToLocalStorage();
      
      statusDiv.innerHTML = `<div class="scanner-status success">✅ Attendance marked for ${student.name}!</div>`;
      console.log("Attendance saved. Total records:", db.attendance.length);
      
      if (currentUser.role === 'teacher') loadTeacherDashboard();
      
      setTimeout(() => {
        stopScannerAndClose();
      }, 2000);
    }
  } else {
    console.log("Student NOT found for rollNo:", decodedText);
    statusDiv.innerHTML = `<div class="scanner-status error">Student not found: ${decodedText}</div>`;
    setTimeout(() => {
      if (document.getElementById('qrScannerModal').style.display === 'flex') {
        isScanning = false;
        openQRScanner();
      }
    }, 2000);
  }
}

function markManualAttendance() {
  const studentId = document.getElementById('manualStudentId').value.trim();
  if (!studentId) {
    alert('Please enter Student Roll Number');
    return;
  }
  
  console.log("Manual attendance for:", studentId);
  const student = db.users.find(u => u.role === 'student' && u.rollNo === studentId);
  const statusDiv = document.getElementById('scannerStatus');
  
  if (student) {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.attendance.find(a => a.studentId === student.id && a.date === today);
    
    if (existing) {
      statusDiv.innerHTML = `<div class="scanner-status error">${student.name} already marked present today!</div>`;
    } else {
      db.attendance.push({
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        date: today,
        status: 'present',
        time: new Date().toLocaleTimeString(),
        markedBy: currentUser.name,
        timestamp: new Date().toISOString()
      });
      saveToLocalStorage();
      
      statusDiv.innerHTML = `<div class="scanner-status success">✅ Attendance marked for ${student.name}!</div>`;
      document.getElementById('manualStudentId').value = '';
      
      if (currentUser.role === 'teacher') loadTeacherDashboard();
    }
  } else {
    alert(`Student not found with roll number: ${studentId}`);
  }
}

async function switchCamera() {
  if (!scanner || !isScanning) return;
  
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (cameras && cameras.length > 1) {
      const currentCameraId = scanner.getCurrentCameraId ? scanner.getCurrentCameraId() : cameras[0].id;
      const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const newCameraId = cameras[nextIndex].id;
      
      await scanner.stop();
      const statusDiv = document.getElementById('scannerStatus');
      statusDiv.innerHTML = '<div class="scanner-status info">Switching camera...</div>';
      
      isScanning = true;
      await scanner.start(
        newCameraId,
        {
          fps: 30,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          console.log("QR DETECTED:", decodedText);
          statusDiv.innerHTML = `<div class="scanner-status info">Detected: ${decodedText}</div>`;
          if (isScanning) {
            handleQRResult(decodedText);
          }
        },
        (error) => {}
      );
      
      statusDiv.innerHTML = '<div class="scanner-status info">Camera switched. Position QR code in frame.</div>';
    } else {
      alert('Only one camera available');
    }
  } catch (err) {
    console.error("Switch camera error:", err);
    alert('Failed to switch camera');
  }
}

function stopScannerAndClose() {
  console.log("Stopping scanner and closing modal");
  isScanning = false;
  if (scanner) {
    scanner.stop().catch(e => console.log("Stop error:", e));
    scanner = null;
  }
  document.getElementById('qrScannerModal').style.display = 'none';
  document.getElementById('scannerStatus').innerHTML = '';
}

function testQRScan() {
  const testData = prompt("Enter student roll number to test (e.g., STU001):", "STU001");
  if (testData) {
    handleQRResult(testData);
  }
}