const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
let users = [
  { id: 1, name: 'נפתלי', email: 'w5700611@gmail.com', password: '123456' },
  { id: 2, name: 'דני כהן', email: 'danny@example.com', password: '123456' },
  { id: 3, name: 'שרה לוי', email: 'sarah@example.com', password: '123456' }
];

let teams = [
  { id: 1, name: 'צוות פיתוח', description: 'צוות הפיתוח הראשי', created_at: new Date(), member_count: 2 },
  { id: 2, name: 'צוות עיצוב', description: 'צוות העיצוב והUI/UX', created_at: new Date(), member_count: 1 }
];

let projects = [
  { id: 1, team_id: 1, name: 'פרויקט ראשון', description: 'תיאור הפרויקט', due_date: new Date('2026-02-15'), created_at: new Date() }
];

let tasks = [
  { id: 1, project_id: 1, title: 'משימה 1', description: 'תיאור', status: 'todo', priority: 'high', due_date: new Date('2026-02-10'), created_at: new Date() },
  { id: 2, project_id: 1, title: 'משימה 2', description: 'תיאור', status: 'in_progress', priority: 'medium', due_date: new Date('2026-02-12'), created_at: new Date() },
  { id: 3, project_id: 1, title: 'משימה 3', description: 'תיאור', status: 'done', priority: 'low', due_date: new Date('2026-02-08'), created_at: new Date() }
];

let teamMembers = [
  { team_id: 1, user_id: 1 },
  { team_id: 1, user_id: 2 },
  { team_id: 2, user_id: 3 }
];

let comments = []; // Comments will be created with userName from authenticated user

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password
  };
  
  users.push(newUser);
  
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });
  
  res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
  
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email })));
});

// Teams routes
app.get('/api/teams', authenticateToken, (req, res) => {
  // Update member_count for each team before sending
  const teamsWithCount = teams.map(team => ({
    ...team,
    member_count: teamMembers.filter(tm => tm.team_id === team.id).length
  }));
  res.json(teamsWithCount);
});

app.post('/api/teams', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  
  const newTeam = {
    id: teams.length + 1,
    name,
    description,
    created_at: new Date(),
    member_count: 1
  };
  
  teams.push(newTeam);
  teamMembers.push({ team_id: newTeam.id, user_id: req.user.id });
  
  res.status(201).json(newTeam);
});

app.delete('/api/teams/:id', authenticateToken, (req, res) => {
  const teamId = parseInt(req.params.id);
  teams = teams.filter(t => t.id !== teamId);
  teamMembers = teamMembers.filter(tm => tm.team_id !== teamId);
  res.status(204).send();
});

// Team members routes
app.get('/api/teams/:id/members', authenticateToken, (req, res) => {
  const teamId = parseInt(req.params.id);
  const members = teamMembers
    .filter(tm => tm.team_id === teamId)
    .map(tm => {
      const user = users.find(u => u.id === tm.user_id);
      return user ? { id: user.id, name: user.name, email: user.email } : null;
    })
    .filter(m => m !== null);
  
  res.json(members);
});

app.post('/api/teams/:id/members', authenticateToken, (req, res) => {
  const teamId = parseInt(req.params.id);
  const { username, userId } = req.body;
  
  let user;
  if (username) {
    user = users.find(u => u.email === username || u.name === username);
  } else if (userId) {
    user = users.find(u => u.id === userId);
  }
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const existingMember = teamMembers.find(tm => tm.team_id === teamId && tm.user_id === user.id);
  if (existingMember) {
    return res.status(400).json({ message: 'User is already a member of this team' });
  }
  
  teamMembers.push({ team_id: teamId, user_id: user.id });
  
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.member_count = teamMembers.filter(tm => tm.team_id === teamId).length;
  }
  
  res.status(201).json({ message: 'Member added successfully' });
});

app.delete('/api/teams/:teamId/members/:userId', authenticateToken, (req, res) => {
  const teamId = parseInt(req.params.teamId);
  const userId = parseInt(req.params.userId);
  
  teamMembers = teamMembers.filter(tm => !(tm.team_id === teamId && tm.user_id === userId));
  
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.member_count = teamMembers.filter(tm => tm.team_id === teamId).length;
  }
  
  res.status(204).send();
});

// Projects routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const { teamId } = req.query;
  let filteredProjects = projects;
  
  if (teamId) {
    filteredProjects = projects.filter(p => p.team_id === parseInt(teamId));
  }
  
  res.json(filteredProjects);
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, description, teamId, dueDate } = req.body;
  
  const newProject = {
    id: projects.length + 1,
    team_id: teamId,
    name,
    description,
    due_date: dueDate ? new Date(dueDate) : undefined,
    created_at: new Date()
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const projectId = parseInt(req.params.id);
  projects = projects.filter(p => p.id !== projectId);
  res.status(204).send();
});

// Tasks routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { projectId } = req.query;
  let filteredTasks = tasks;
  
  if (projectId) {
    filteredTasks = tasks.filter(t => t.project_id === parseInt(projectId));
  }
  
  res.json(filteredTasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, status, priority, projectId, dueDate } = req.body;
  
  const newTask = {
    id: tasks.length + 1,
    project_id: projectId,
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    due_date: dueDate ? new Date(dueDate) : undefined,
    created_at: new Date()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== taskId);
  res.status(204).send();
});

// Comments routes
app.get('/api/comments', authenticateToken, (req, res) => {
  const { taskId } = req.query;
  let filteredComments = comments;
  
  if (taskId) {
    filteredComments = comments.filter(c => c.task_id === parseInt(taskId));
  }
  
  // Add user names to comments
  const commentsWithUserNames = filteredComments.map(comment => {
    const user = users.find(u => u.id === comment.user_id);
    return {
      id: comment.id,
      task_id: comment.task_id,
      user_id: comment.user_id,
      userName: user ? user.name : 'User',
      body: comment.body,
      created_at: comment.created_at
    };
  });
  
  res.json(commentsWithUserNames);
});

app.post('/api/comments', authenticateToken, (req, res) => {
  const { body, taskId } = req.body;
  
  const user = users.find(u => u.id === req.user.id);
  
  const newComment = {
    id: comments.length + 1,
    task_id: taskId,
    user_id: req.user.id,
    body,
    created_at: new Date()
  };
  
  comments.push(newComment);
  
  // Return comment with user name
  res.status(201).json({
    ...newComment,
    userName: user ? user.name : 'User'
  });
});

app.delete('/api/comments/:id', authenticateToken, (req, res) => {
  const commentId = parseInt(req.params.id);
  comments = comments.filter(c => c.id !== commentId);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});
