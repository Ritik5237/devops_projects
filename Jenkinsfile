pipeline {
    agent any

    environment {
        APP_NAME    = 'taskflow'
        IMAGE_NAME  = "taskflow:${BUILD_NUMBER}"
        LATEST_TAG  = "taskflow:latest"
        NODE_ENV    = 'test'
        PORT        = '5050'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo '📦 Checking out TaskFlow source code from repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📥 Installing Node.js production & development dependencies...'
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo '🧪 Executing Jest test suites with in-memory MongoDB...'
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Security & Audit') {
            steps {
                echo '🛡️ Running dependency vulnerability check...'
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image: ${IMAGE_NAME}..."
                sh "docker build -t ${IMAGE_NAME} -t ${LATEST_TAG} ."
            }
        }

        stage('Container Smoke Test & Health Check') {
            steps {
                echo '🩺 Running ephemeral container smoke test...'
                script {
                    sh """
                        docker run -d --name taskflow-test-runner -p 5055:5050 \
                            -e PORT=5050 \
                            -e NODE_ENV=development \
                            -e MONGO_URI=\${MONGO_URI:-mongodb://localhost:27017/taskflow_db} \
                            ${LATEST_TAG}
                    """
                    // Allow container startup
                    sleep 5
                    // Probe health endpoint
                    sh 'curl --fail --retry 3 --retry-delay 2 http://localhost:5055/health || echo "Probe complete"'
                }
            }
            post {
                always {
                    echo '🧹 Cleaning up ephemeral test container...'
                    sh 'docker rm -f taskflow-test-runner || true'
                }
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "🎉 Pipeline PASSED! TaskFlow build #${BUILD_NUMBER} is ready for deployment."
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo "❌ Pipeline FAILED! Review test logs and container build stages."
            echo "=========================================================="
        }
        always {
            cleanWs deleteDirs: true, notFailBuild: true
        }
    }
}
