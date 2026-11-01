const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});

  const u = await request(app).post('/api/auth/register').send({
    name: 'AI Test User',
    email: 'aitest@example.com',
    password: 'Password123'
  });
  token = u.body.token;
});

describe('Gemini AI Endpoints', () => {
  describe('POST /api/ai/breakdown', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/ai/breakdown')
        .send({ title: 'Deploy Docker container' });

      expect(res.statusCode).toBe(401);
    });

    it('should validate missing title', async () => {
      const res = await request(app)
        .post('/api/ai/breakdown')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return a structured breakdown for a task', async () => {
      const res = await request(app)
        .post('/api/ai/breakdown')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Deploy Docker container to Kubernetes',
          description: 'Package node app and apply deployment yaml',
          priority: 'High'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('subtasks');
      expect(Array.isArray(res.body.data.subtasks)).toBe(true);
      expect(res.body.data.subtasks.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/ai/parse-task', () => {
    it('should parse natural language text into a task structure', async () => {
      const res = await request(app)
        .post('/api/ai/parse-task')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Urgent fix login token expiration bug by tomorrow' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data).toHaveProperty('dueDate');
    });
  });

  describe('GET /api/ai/briefing', () => {
    it('should generate a morning standup briefing from active tasks', async () => {
      // Seed an active task
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Configure Prometheus and Grafana alerts',
          priority: 'High',
          status: 'In Progress'
        });

      const res = await request(app)
        .get('/api/ai/briefing')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('greeting');
      expect(res.body.data).toHaveProperty('topPriorities');
      expect(Array.isArray(res.body.data.topPriorities)).toBe(true);
    });
  });
});
