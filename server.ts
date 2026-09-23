import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Persistence directory
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'server_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory + persisted DB structure
interface ServerDB {
  auditLogs: any[];
  appeals: any[];
  lockedWeeks: number[];
  lastUpdated: string;
}

function loadDB(): ServerDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading server DB:', err);
  }
  return {
    auditLogs: [],
    appeals: [],
    lockedWeeks: [1, 2, 3],
    lastUpdated: new Date().toISOString(),
  };
}

function saveDB(data: ServerDB) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server DB:', err);
  }
}

let db = loadDB();

// RBAC Middleware Helper
interface AuthUser {
  id: string;
  name: string;
  role: string;
  campusId?: string;
  classId?: string;
}

function extractUser(req: Request): AuthUser {
  const id = (req.headers['x-user-id'] as string) || 'u_admin';
  const name = (req.headers['x-user-name'] as string) || 'Thầy Nguyễn Văn Sơn';
  let role = (req.headers['x-user-role'] as string) || 'super_admin';
  const campusId = req.headers['x-user-campus'] as string;
  const classId = req.headers['x-user-class'] as string;

  // Normalize roles
  if (role === 'admin') role = 'super_admin';
  if (role === 'inspector') role = 'tpt_doi';
  if (role === 'campus_lead') role = 'campus_admin';
  if (role === 'teacher') role = 'gvcn';
  if (role === 'public') role = 'viewer';

  return { id, name, role, campusId, classId };
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = extractUser(req);
    if (user.role === 'super_admin') {
      return next(); // Super admin bypass
    }
    if (allowedRoles.includes(user.role)) {
      return next();
    }
    res.status(403).json({
      success: false,
      message: `Quyền truy cập bị từ chối. Thao tác này yêu cầu quyền: ${allowedRoles.join(', ')}`,
    });
  };
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    auditLogCount: db.auditLogs.length,
    appealCount: db.appeals.length,
    lockedWeeks: db.lockedWeeks,
  });
});

// Audit Logs API
app.get('/api/audit-logs', requireRole(['super_admin', 'bgh']), (req: Request, res: Response) => {
  const { action, role, userId, entityType, limit = '200' } = req.query;
  let logs = [...db.auditLogs];

  if (action) {
    logs = logs.filter((l) => l.action === action);
  }
  if (role) {
    logs = logs.filter((l) => l.userRole === role);
  }
  if (userId) {
    logs = logs.filter((l) => l.userId === userId);
  }
  if (entityType) {
    logs = logs.filter((l) => l.entityType === entityType);
  }

  // Sort descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    total: logs.length,
    data: logs.slice(0, Number(limit)),
  });
});

app.post('/api/audit-logs', (req: Request, res: Response) => {
  const user = extractUser(req);
  const logItem = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: req.body.action || 'THAO_TAC_HE_THONG',
    entityType: req.body.entityType || 'score_log',
    entityId: req.body.entityId || 'none',
    campusId: req.body.campusId || user.campusId,
    classId: req.body.classId || user.classId,
    beforeData: req.body.beforeData ?? null,
    afterData: req.body.afterData ?? null,
    details: req.body.details || '',
  };

  db.auditLogs.unshift(logItem);
  // Cap at 2000 logs to manage file size
  if (db.auditLogs.length > 2000) {
    db.auditLogs = db.auditLogs.slice(0, 2000);
  }
  saveDB(db);

  res.json({ success: true, data: logItem });
});

// Appeals API (GVCN đề nghị điều chỉnh)
app.get('/api/appeals', (req: Request, res: Response) => {
  const user = extractUser(req);
  let appeals = [...db.appeals];

  // GVCN can only view appeals for their class
  if (user.role === 'gvcn' && user.classId) {
    appeals = appeals.filter((a) => a.classId === user.classId);
  } else if (user.role === 'campus_admin' && user.campusId) {
    appeals = appeals.filter((a) => a.campusId === user.campusId);
  }

  appeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, data: appeals });
});

app.post('/api/appeals', requireRole(['gvcn', 'super_admin']), (req: Request, res: Response) => {
  const user = extractUser(req);
  const appeal = {
    id: `appeal_${Date.now()}`,
    createdAt: new Date().toISOString(),
    classId: req.body.classId,
    className: req.body.className,
    campusId: req.body.campusId,
    campusName: req.body.campusName,
    teacherId: user.id,
    teacherName: user.name,
    week: Number(req.body.week),
    scoreLogId: req.body.scoreLogId || null,
    criteriaName: req.body.criteriaName || 'Điểm thi đua',
    appealType: req.body.appealType || 'adjust_score',
    reason: req.body.reason,
    evidenceNotes: req.body.evidenceNotes || '',
    proposedPoints: req.body.proposedPoints !== undefined ? Number(req.body.proposedPoints) : 0,
    status: 'pending',
  };

  db.appeals.unshift(appeal);

  // Auto record Audit Log
  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'GUI_DE_NGHI_DIEU_CHINH',
    entityType: 'appeal',
    entityId: appeal.id,
    campusId: appeal.campusId,
    classId: appeal.classId,
    beforeData: null,
    afterData: appeal,
    details: `GVCN ${user.name} gửi phản hồi/đề nghị điều chỉnh điểm Tuần ${appeal.week} cho lớp ${appeal.className}: ${appeal.reason}`,
  };
  db.auditLogs.unshift(auditEntry);
  saveDB(db);

  res.json({ success: true, data: appeal });
});

app.put('/api/appeals/:id/review', requireRole(['super_admin', 'bgh', 'tpt_doi', 'campus_admin']), (req: Request, res: Response) => {
  const user = extractUser(req);
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  const idx = db.appeals.findIndex((a) => a.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu điều chỉnh' });
    return;
  }

  const beforeAppeal = { ...db.appeals[idx] };
  db.appeals[idx] = {
    ...db.appeals[idx],
    status,
    reviewerId: user.id,
    reviewerName: user.name,
    reviewedAt: new Date().toISOString(),
    reviewNotes: reviewNotes || '',
  };

  const action = status === 'approved' ? 'DUYET_DIEU_CHINH' : 'TU_CHOI_DIEU_CHINH';
  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'appeal',
    entityId: id,
    campusId: db.appeals[idx].campusId,
    classId: db.appeals[idx].classId,
    beforeData: beforeAppeal,
    afterData: db.appeals[idx],
    details: `${status === 'approved' ? 'Chấp thuận' : 'Từ chối'} đề nghị điều chỉnh của lớp ${db.appeals[idx].className} (Tuần ${db.appeals[idx].week}). Ghi chú: ${reviewNotes || 'Không có'}`,
  };
  db.auditLogs.unshift(auditEntry);
  saveDB(db);

  res.json({ success: true, data: db.appeals[idx] });
});

// Week Data Lock API (Only Super Admin and BGH)
app.post('/api/datalock/toggle', requireRole(['super_admin', 'bgh']), (req: Request, res: Response) => {
  const user = extractUser(req);
  const week = Number(req.body.week);

  if (!week || week < 1 || week > 35) {
    res.status(400).json({ success: false, message: 'Số tuần không hợp lệ (1 - 35)' });
    return;
  }

  const isCurrentlyLocked = db.lockedWeeks.includes(week);
  const beforeWeeks = [...db.lockedWeeks];

  if (isCurrentlyLocked) {
    db.lockedWeeks = db.lockedWeeks.filter((w) => w !== week);
  } else {
    db.lockedWeeks = [...db.lockedWeeks, week].sort((a, b) => a - b);
  }

  const action = isCurrentlyLocked ? 'MO_KHOA_TUAN' : 'CHOT_DU_LIEU_TUAN';
  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'week_lock',
    entityId: `week_${week}`,
    beforeData: { lockedWeeks: beforeWeeks, weekLocked: isCurrentlyLocked },
    afterData: { lockedWeeks: db.lockedWeeks, weekLocked: !isCurrentlyLocked },
    details: `${!isCurrentlyLocked ? 'Khóa chốt dữ liệu thi đua' : 'Mở khóa sửa đổi dữ liệu'} Tuần ${week}`,
  };
  db.auditLogs.unshift(auditEntry);
  saveDB(db);

  res.json({
    success: true,
    lockedWeeks: db.lockedWeeks,
    isLocked: !isCurrentlyLocked,
    message: !isCurrentlyLocked ? `Đã chốt khóa dữ liệu Tuần ${week}` : `Đã mở khóa dữ liệu Tuần ${week}`,
  });
});

// Server-side Backup & Restore APIs
app.get('/api/backup/download', requireRole(['super_admin', 'bgh']), (req: Request, res: Response) => {
  const user = extractUser(req);
  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SAO_LUU_HE_THONG',
    entityType: 'settings',
    entityId: `server_backup_${Date.now()}`,
    beforeData: null,
    afterData: { appealsCount: db.appeals.length, auditLogsCount: db.auditLogs.length },
    details: `${user.name} tải tệp sao lưu dữ liệu máy chủ server_db.json`,
  };
  db.auditLogs.unshift(auditEntry);
  saveDB(db);

  res.setHeader('Content-Disposition', `attachment; filename=server_db_backup_${new Date().toISOString().split('T')[0]}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/backup/restore', requireRole(['super_admin']), (req: Request, res: Response) => {
  const user = extractUser(req);
  const backupData = req.body;

  if (!backupData || typeof backupData !== 'object') {
    res.status(400).json({ success: false, message: 'Dữ liệu sao lưu không hợp lệ!' });
    return;
  }

  // Backup current state to emergency snapshot file
  try {
    const backupDir = path.resolve(DATA_DIR, 'snapshots');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.resolve(backupDir, `pre_restore_${Date.now()}.json`), JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error creating pre-restore snapshot:', err);
  }

  const beforeLogs = db.auditLogs.length;
  if (Array.isArray(backupData.auditLogs)) db.auditLogs = backupData.auditLogs;
  if (Array.isArray(backupData.appeals)) db.appeals = backupData.appeals;
  if (Array.isArray(backupData.lockedWeeks)) db.lockedWeeks = backupData.lockedWeeks;

  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PHUC_HOI_HE_THONG',
    entityType: 'settings',
    entityId: `server_restore_${Date.now()}`,
    beforeData: { auditLogsCount: beforeLogs },
    afterData: { auditLogsCount: db.auditLogs.length, appealsCount: db.appeals.length },
    details: `Super Admin ${user.name} khôi phục dữ liệu máy chủ từ tệp sao lưu`,
  };
  db.auditLogs.unshift(auditEntry);
  saveDB(db);

  res.json({
    success: true,
    message: 'Khôi phục dữ liệu máy chủ thành công!',
    auditLogsCount: db.auditLogs.length,
    appealsCount: db.appeals.length,
    lockedWeeks: db.lockedWeeks,
  });
});

// ---------------- VITE / STATIC SERVING ----------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THCS Lê Hữu Lập Full-Stack RBAC server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
