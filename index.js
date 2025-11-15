require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

function readData(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ return { menuItems:[], users:[], orders:[], settings:{}, stats:{ totalUsers:0, totalOrders:0, revenue:0 } }; }
}
function writeData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// Ping
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Simple admin auth - demo only. Use real auth in production.
function checkAdmin(req, res, next){
  const token = req.headers['x-admin-token'] || '';
  if (process.env.ADMIN_API_KEY && token === process.env.ADMIN_API_KEY) return next();
  return res.status(401).json({ error:'unauthorized' });
}

// Get all data (read-only)
app.get('/api/data', checkAdmin, (req, res) => {
  const d = readData();
  res.json(d);
});

// Users endpoints
app.get('/api/users', checkAdmin, (req, res) => { res.json(readData().users || []); });
app.post('/api/users', checkAdmin, (req, res) => {
  const d = readData();
  const id = Date.now();
  const user = { id, name: req.body.name, email: req.body.email, role: req.body.role, joinDate: req.body.joinDate || new Date().toISOString().split('T')[0], status: req.body.status || 'active' };
  d.users.push(user);
  d.stats.totalUsers = d.users.length;
  writeData(d);
  res.json({ ok:true, user });
});
app.delete('/api/users/:id', checkAdmin, (req, res) => {
  const d = readData();
  d.users = d.users.filter(u => String(u.id)!==String(req.params.id));
  d.stats.totalUsers = d.users.length;
  writeData(d);
  res.json({ ok:true });
});

// Menu endpoints
app.get('/api/menu', checkAdmin, (req, res) => { res.json(readData().menuItems || []); });
app.post('/api/menu', checkAdmin, upload.single('photo'), (req, res) => {
  const d = readData();
  const id = Date.now();
  let photoPath = '';
  if (req.file){ photoPath = '/uploads/' + req.file.filename; }
  const item = { id, name:req.body.name, description:req.body.description, price: Number(req.body.price)||0, category:req.body.category, photo: photoPath, orders:0 };
  d.menuItems.push(item);
  writeData(d);
  res.json({ ok:true, item });
});
app.delete('/api/menu/:id', checkAdmin, (req, res) => { const d = readData(); d.menuItems = d.menuItems.filter(m => String(m.id)!==String(req.params.id)); writeData(d); res.json({ ok:true }); });

// Orders endpoints
app.get('/api/orders', checkAdmin, (req, res) => { res.json(readData().orders || []); });
app.post('/api/orders', checkAdmin, (req, res) => {
  const d = readData();
  const id = Date.now();
  const order = { id, user:req.body.user, total: Number(req.body.total)||0, date:req.body.date||new Date().toISOString().split('T')[0], status:req.body.status||'completed' };
  d.orders.push(order);
  d.stats.totalOrders = d.orders.length;
  d.stats.revenue = (d.orders || []).reduce((s,o)=>s+(Number(o.total)||0),0);
  writeData(d);
  res.json({ ok:true, order });
});

// CSV export for credentials history (demo: exports users list without passwords)
app.get('/api/export/credentials', checkAdmin, (req, res) => {
  const d = readData();
  const users = d.users || [];
  const headers = ['id','name','email','role','joinDate','status'];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition','attachment; filename="credentials_export.csv"');
  res.write(headers.join(',') + '\n');
  users.forEach(u => {
    const row = [u.id, u.name, u.email, u.role, u.joinDate, u.status].map(v=>`"${String(v||'').replace(/"/g,'""')}"");
    res.write(row.join(',') + '\n');
  });
  res.end();
});

// Payment intent stub (demo only) - integrate Stripe on server with proper secret in PROD
app.post('/api/payments/create-intent', checkAdmin, async (req, res) => {
  // In production: use Stripe SDK with process.env.STRIPE_SECRET
  // This is a stub that returns a fake clientSecret for demo
  const clientSecret = 'pi_demo_client_secret_' + Date.now();
  res.json({ clientSecret, mode: 'demo' });
});

// Static uploads serving (for demo only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`MoodCafe backend listening on port ${port}`));
