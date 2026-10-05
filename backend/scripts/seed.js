const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Task = require('../models/Task');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('[Seed] Cleaned existing collections');

    // Create Demo User
    const demoUser = await User.create({
      name: 'Ritik Bhardwaj',
      email: 'ritik@taskflow.dev',
      password: 'Password123'
    });
    console.log(`[Seed] Created Demo User: ${demoUser.email} (Password: Password123)`);

    // Sample DevOps Tasks
    const sampleTasks = [
      {
        title: 'Configure GitHub Repository & Branch Protections',
        description: 'Initialize Git repo, set main branch protections, create feature branches and demonstrate PR merge conflict resolution.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 2),
        user: demoUser._id
      },
      {
        title: 'Containerize TaskFlow with Docker & Compose',
        description: 'Author multi-stage Dockerfile for Node.js backend & frontend, configure docker-compose.yml with MongoDB and volume persistence.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 4),
        user: demoUser._id
      },
      {
        title: 'Build Automated CI Pipeline in Jenkins',
        description: 'Set up Jenkins declarative pipeline with Git checkout, dependency install, unit test execution, and Docker image build stages.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 6),
        user: demoUser._id
      },
      {
        title: 'Author Kubernetes Manifests & Deploy to Cluster',
        description: 'Create Deployments, Services, ConfigMaps, Secrets, PVC, and Ingress. Demonstrate replica scaling, rolling update, and rollback.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 8),
        user: demoUser._id
      },
      {
        title: 'Automate Server Configuration with Ansible',
        description: 'Develop Ansible playbooks to provision Docker, configure firewall, and deploy application containers on Ubuntu target nodes.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 10),
        user: demoUser._id
      },
      {
        title: 'Provision Cloud Infrastructure using Terraform',
        description: 'Define VPC, subnets, security groups, and EC2 instances with Terraform modules and output variables for reproducibility.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 12),
        user: demoUser._id
      },
      {
        title: 'Set Up Prometheus & Grafana Monitoring',
        description: 'Instrument TaskFlow with Prometheus metrics endpoint, scrape metrics, and build Grafana visual dashboards for CPU and throughput.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(Date.now() + 86400000 * 14),
        user: demoUser._id
      }
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[Seed] Inserted ${sampleTasks.length} sample DevOps tasks`);

    console.log('[Seed] Seeding completed successfully! 🌱');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

seedData();
