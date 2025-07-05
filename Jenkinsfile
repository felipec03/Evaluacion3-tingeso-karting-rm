pipeline {
    agent any // Run most stages on any available agent with Docker, Maven, Node.js

    tools {
        maven 'maven_3_8_1' // Ensure this name matches Global Tool Config
        nodejs 'NodeJS_20'   // Ensure this name matches Global Tool Config
    }

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-pw'
        DOCKERHUB_USERNAME       = 'felipec03'
        BACKEND_IMAGE_NAME       = "${env.DOCKERHUB_USERNAME}/backend-karting:latest"
        BACKEND_PROJECT_SUBDIR   = 'backend'
        FRONTEND_IMAGE_NAME      = "${env.DOCKERHUB_USERNAME}/frontend-karting:latest"
        FRONTEND_PROJECT_SUBDIR  = 'frontend'
        REPO_URL                 = 'https://github.com/felipec03/Evaluacion1-tingeso-karting-rm.git'

        // Azure VM deployment configuration
        AZURE_VM_IP              = '4.206.99.242' // Replace with your VM's IP
        AZURE_VM_USER            = 'felipec03'    // User on the VM (MUST be in 'docker' group on VM)
        AZURE_VM_CREDENTIALS_ID  = 'azure-vm-ssh-key' // SSH key credential ID in Jenkins
        // Use absolute path on the VM for clarity and reliability
        AZURE_DEPLOY_DIR_ABS     = "/home/${AZURE_VM_USER}/karting-deploy"
    }

    stages {
        stage('Verify Tools') {
            steps {
                sh 'mvn --version'
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version' // Verify Docker client is available on Jenkins agent
            }
        }

        stage('Checkout Code') {
            steps {
                echo "Checking out code from ${env.REPO_URL} branch main"
                cleanWs() // Clean workspace before checkout
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: env.REPO_URL,
                        credentialsId: 'github-pat-felipec03' // Ensure this credential ID is correct
                    ]]
                )
                echo "Checkout complete. Workspace contents:"
                sh 'ls -la'
            }
        }
        
        // --- Backend Stages ---
        stage('Build Backend (Maven Project)') {
            steps {
                dir(env.BACKEND_PROJECT_SUBDIR) {
                    echo "Building Backend in: ${pwd()}"
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        

        // Dockerize
        stage('Build Backend Docker Image') {
            steps {
                dir(env.BACKEND_PROJECT_SUBDIR) {
                    echo "Building Backend Docker image: ${env.BACKEND_IMAGE_NAME}"
                    // Unset DOCKER_HOST to force use of local socket
                    sh """
                        unset DOCKER_HOST
                        docker build -t ${env.BACKEND_IMAGE_NAME} .
                    """
                }
            }
        }
        
        stage('Push Backend Image to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, variable: 'DOCKERHUB_PASSWORD')]) {
                    sh """
                        unset DOCKER_HOST
                        echo ${DOCKERHUB_PASSWORD} | docker login -u ${env.DOCKERHUB_USERNAME} --password-stdin
                        docker push ${env.BACKEND_IMAGE_NAME}
                    """
                }
            }
        }
        
        // --- Frontend Stages ---
        stage('Build Frontend (Node.js Project)') {
            steps {
                // Use the nodejs tool directly on the current agent
                nodejs('NodeJS_20') {
                    dir(env.FRONTEND_PROJECT_SUBDIR) {
                        echo "Building Frontend in: ${pwd()}"
                        echo "Running npm ci..."
                        sh 'npm ci' // Clean install based on package-lock.json
                        echo "Running npm run build..."
                        sh 'npm run build' // Create production build (e.g., into 'dist' folder)
                    }
                }
            }
        }
        
        // Dockerize
        stage('Build Frontend Docker Image') {
            steps {
                dir(env.FRONTEND_PROJECT_SUBDIR) {
                    echo "Building Frontend Docker image: ${env.FRONTEND_IMAGE_NAME}"
                    // Unset DOCKER_HOST to force use of local socket
                    sh """
                        unset DOCKER_HOST
                        docker build -t ${env.FRONTEND_IMAGE_NAME} .
                    """
                }
            }
        }

        stage('Push Frontend Image to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, variable: 'DOCKERHUB_PASSWORD')]) {
                    sh """
                        unset DOCKER_HOST
                        echo ${DOCKERHUB_PASSWORD} | docker login -u ${env.DOCKERHUB_USERNAME} --password-stdin
                        docker push ${env.FRONTEND_IMAGE_NAME}
                    """
                }
            }
        }
        
        // --- Azure VM Deployment Stages ---
        stage('Prepare Deployment Directory on Azure VM') {
            steps {
                sshagent([env.AZURE_VM_CREDENTIALS_ID]) {
                    sh """
                        echo "Creating deployment directory ${env.AZURE_DEPLOY_DIR_ABS} on VM ${env.AZURE_VM_IP}..."
                        ssh -o StrictHostKeyChecking=no ${env.AZURE_VM_USER}@${env.AZURE_VM_IP} '
                            mkdir -p ${env.AZURE_DEPLOY_DIR_ABS}/nginx
                            echo "Directory structure created/ensured."
                            ls -ld ${env.AZURE_DEPLOY_DIR_ABS} ${env.AZURE_DEPLOY_DIR_ABS}/nginx
                        '
                    """
                }
            }
        }
        

        stage('Transfer Deployment Files to Azure VM') {
            steps {
                sshagent([env.AZURE_VM_CREDENTIALS_ID]) {
                    sh """
                        echo "Transferring deployment files to ${env.AZURE_VM_USER}@${env.AZURE_VM_IP}:${env.AZURE_DEPLOY_DIR_ABS}"

                        # Transfer docker-compose.yml (assuming it's at the workspace root)
                        scp -o StrictHostKeyChecking=no docker-compose.yml ${env.AZURE_VM_USER}@${env.AZURE_VM_IP}:${env.AZURE_DEPLOY_DIR_ABS}/docker-compose.yml

                        # Transfer frontend nginx conf (adjust path if needed)
                        scp -o StrictHostKeyChecking=no ${env.FRONTEND_PROJECT_SUBDIR}/nginx.conf ${env.AZURE_VM_USER}@${env.AZURE_VM_IP}:${env.AZURE_DEPLOY_DIR_ABS}/nginx.conf

                        # Transfer backend nginx conf (assuming it's at workspace root in 'nginx' dir - ADJUST PATH IF NEEDED)
                        if [ -f nginx/backend.conf ]; then
                           scp -o StrictHostKeyChecking=no nginx/backend.conf ${env.AZURE_VM_USER}@${env.AZURE_VM_IP}:${env.AZURE_DEPLOY_DIR_ABS}/nginx/backend.conf
                        else
                           echo "Warning: nginx/backend.conf not found in workspace. Skipping transfer."
                           # Optionally create a default one on the VM if required:
                           # ssh -o StrictHostKeyChecking=no ${env.AZURE_VM_USER}@${env.AZURE_VM_IP} "echo 'server { listen 80; location / { proxy_pass http://backend:8080; } }' > ${env.AZURE_DEPLOY_DIR_ABS}/nginx/backend.conf"
                        fi

                        echo "File transfer complete. Verifying files on VM:"
                        ssh -o StrictHostKeyChecking=no ${env.AZURE_VM_USER}@${env.AZURE_VM_IP} 'ls -l ${env.AZURE_DEPLOY_DIR_ABS} ${env.AZURE_DEPLOY_DIR_ABS}/nginx'
                    """
                }
            }
        }

        stage('Deploy Application on Azure VM') {
            steps {
                // We need Docker Hub credentials to potentially pull private images via docker compose
                withCredentials([string(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, variable: 'DOCKERHUB_PASSWORD')]) {
                    sshagent(credentials: [env.AZURE_VM_CREDENTIALS_ID]) {
                        sh """
                            echo "Deploying application using Docker Compose on ${env.AZURE_VM_IP}..."
                            ssh -o StrictHostKeyChecking=no ${env.AZURE_VM_USER}@${env.AZURE_VM_IP} '
                                echo "Changing directory to ${env.AZURE_DEPLOY_DIR_ABS}"
                                cd ${env.AZURE_DEPLOY_DIR_ABS}

                                echo "Logging into Docker Hub (needed for docker compose pull)..."
                                # Ensure the VM user (${env.AZURE_VM_USER}) can run Docker commands without sudo!
                                # (User must be in the docker group on the VM: sudo usermod -aG docker ${env.AZURE_VM_USER})
                                echo "${DOCKERHUB_PASSWORD}" | docker login -u ${env.DOCKERHUB_USERNAME} --password-stdin

                                echo "Stopping existing services (if any)..."
                                docker compose down --remove-orphans || echo "No existing services to stop or already stopped."

                                echo "Pulling latest images..."
                                docker compose pull -d --force-recreate # Pulls images defined in docker-compose.yml

                                echo "Starting services in detached mode..."
                                docker compose up -d # Start containers in background

                                echo "Deployment commands sent. Checking running containers:"
                                docker ps
                            '
                        """
                    }
                }
            }
        }
    } // End of stages

    post {
        always {
            echo "Pipeline finished. Cleaning up workspace and logging out from Docker Hub on Jenkins agent."
            // Logout from Docker Hub on the Jenkins agent
            sh 'docker logout || true'
            // Clean the Jenkins workspace
            cleanWs()
        }
        // Add success/failure/unstable blocks if needed
        // success {
        //     echo 'Pipeline succeeded!'
        // }
        // failure {
        //     echo 'Pipeline failed!'
        // }
    }
}