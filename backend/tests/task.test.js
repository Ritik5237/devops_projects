const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

let mongoServer;
let user1Token;
let user2Token;
let user1Id;
let user2Id;

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

  // Seed User 1
  const u1 = await request(app).post('/api/auth/register').send({
    name: 'User One',
    email: 'user1@example.com',
    password: 'Password123'
  });
  user1Token = u1.body.token;
  user1Id = u1.body.user._id;

  // Seed User 2
  const u2 = await request(app).post('/api/auth/register').send({
    name: 'User Two',
    email: 'user2@example.com',
    password: 'Password123'
  });
  user2Token = u2.body.token;
  user2Id = u2.body.user._id;
});

describe('Task Endpoints', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Implement Jenkins Pipeline',
          description: 'Set up Jenkinsfile with lint, test and docker stages',
          priority: 'High',
          status: 'Pending'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual('Implement Jenkins Pipeline');
      expect(res.body.data.priority).toEqual('High');
      expect(res.body.data.status).toEqual('Pending');
      expect(res.body.data.user.toString()).toEqual(user1Id);
    });

    it('should reject task creation without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          description: 'No title provided'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: 'Setup Kubernetes Cluster',
          description: 'Deploy minikube or k8s cluster',
          status: 'In Progress',
          priority: 'High',
          user: user1Id
        },
        {
          title: 'Write Ansible Playbooks',
          description: 'Docker and k8s automation',
          status: 'Pending',
          priority: 'Medium',
          user: user1Id
        },
        {
          title: 'Other User Secret Task',
          description: 'Should not be visible to user 1',
          status: 'Pending',
          priority: 'Low',
          user: user2Id
        }
      ]);
    });

    it('should return only tasks owned by authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toEqual(2);
      expect(res.body.data.every((t) => t.user.toString() === user1Id)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=In Progress')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].title).toEqual('Setup Kubernetes Cluster');
    });

    it('should filter tasks by search term', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Ansible')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].title).toEqual('Write Ansible Playbooks');
    });
  });

  describe('GET /api/tasks/:id, PUT /api/tasks/:id, DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Configure Terraform Modules',
        description: 'VPC and EC2 configuration',
        status: 'Pending',
        priority: 'High',
        user: user1Id
      });
      taskId = task._id.toString();
    });

    it('should fetch single task by ID for the owner', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.title).toEqual('Configure Terraform Modules');
    });

    it('should forbid other users from accessing task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('should update task details', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'Completed',
          priority: 'Low'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toEqual('Completed');
      expect(res.body.data.priority).toEqual('Low');
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      const check = await Task.findById(taskId);
      expect(check).toBeNull();
    });
  });

  describe('GET /api/tasks/stats/summary', () => {
    it('should return aggregated metrics for dashboard', async () => {
      await Task.create([
        { title: 'T1', status: 'Pending', priority: 'High', user: user1Id },
        { title: 'T2', status: 'In Progress', priority: 'Medium', user: user1Id },
        { title: 'T3', status: 'Completed', priority: 'Low', user: user1Id }
      ]);

      const res = await request(app)
        .get('/api/tasks/stats/summary')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.stats.total).toEqual(3);
      expect(res.body.stats.pending).toEqual(1);
      expect(res.body.stats.inProgress).toEqual(1);
      expect(res.body.stats.completed).toEqual(1);
      expect(res.body.stats.priority.high).toEqual(1);
    });
  });

  describe('GET /health probe', () => {
    it('should respond with 200 OK and service status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('UP');
      expect(res.body.service).toEqual('taskflow-api');
    });
  });
});
