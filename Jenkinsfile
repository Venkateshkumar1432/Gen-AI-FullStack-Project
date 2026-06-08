pipeline {


agent any

environment {

    AWS_REGION = 'ap-south-1'

    ECR_REGISTRY = '443915510355.dkr.ecr.ap-south-1.amazonaws.com'

    FRONTEND_REPO = 'frontend'
    BACKEND_REPO  = 'backend'

    BASTION_HOST = '35.154.199.206'
    BASTION_USER = 'ubuntu'
}

stages {

    stage('Checkout') {

        steps {
            checkout scm
        }
    }

    stage('Detect Changes') {

        steps {

            script {

                def changedFiles = sh(
                    script: '''
                    git diff --name-only HEAD~1 HEAD
                    ''',
                    returnStdout: true
                ).trim()

                echo "Changed Files:"
                echo changedFiles

                env.FRONTEND_CHANGED =
                    changedFiles.readLines().any {
                        it.startsWith("Frontend/")
                    } ? "true" : "false"

                env.BACKEND_CHANGED =
                    changedFiles.readLines().any {
                        it.startsWith("Backend/")
                    } ? "true" : "false"

                env.K8S_CHANGED =
                    changedFiles.readLines().any {
                        it.startsWith("k8s/")
                    } ? "true" : "false"

                env.CHANGED_K8S_FILES =
                    changedFiles.readLines()
                        .findAll { it.startsWith("k8s/") }
                        .join(",")

                echo "Frontend Changed : ${env.FRONTEND_CHANGED}"
                echo "Backend Changed  : ${env.BACKEND_CHANGED}"
                echo "K8S Changed      : ${env.K8S_CHANGED}"
            }
        }
    }

    stage('Build Frontend') {

        when {
            expression {
                env.FRONTEND_CHANGED == "true"
            }
        }

        steps {

            sh """
            docker build \
            -t ${ECR_REGISTRY}/${FRONTEND_REPO}:latest \
            ./Frontend
            """
        }
    }

    stage('Build Backend') {

        when {
            expression {
                env.BACKEND_CHANGED == "true"
            }
        }

        steps {

            sh """
            docker build \
            -t ${ECR_REGISTRY}/${BACKEND_REPO}:latest \
            ./Backend
            """
        }
    }

    stage('Login To ECR') {

        when {

            anyOf {
                expression { env.FRONTEND_CHANGED == "true" }
                expression { env.BACKEND_CHANGED == "true" }
            }
        }

        steps {

            sh """
            aws ecr get-login-password \
            --region ${AWS_REGION} | \
            docker login \
            --username AWS \
            --password-stdin ${ECR_REGISTRY}
            """
        }
    }

    stage('Push Images') {

        steps {

            script {

                if (env.FRONTEND_CHANGED == "true") {

                    sh """
                    docker push \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:latest
                    """
                }

                if (env.BACKEND_CHANGED == "true") {

                    sh """
                    docker push \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:latest
                    """
                }
            }
        }
    }

    stage('Deploy To EKS') {

        when {

            anyOf {
                expression { env.FRONTEND_CHANGED == "true" }
                expression { env.BACKEND_CHANGED == "true" }
            }
        }

        steps {

            sshagent(['bastion-ssh-key']) {

                script {

                    def commands = ""

                    if (env.FRONTEND_CHANGED == "true") {

                        commands += """
                        echo "Deploying Frontend"

                        kubectl set image deployment/frontend \
                        frontend=${ECR_REGISTRY}/${FRONTEND_REPO}:latest \
                        -n production

                        kubectl rollout status \
                        deployment/frontend \
                        -n production
                        """
                    }

                    if (env.BACKEND_CHANGED == "true") {

                        commands += """
                        echo "Deploying Backend"

                        kubectl set image deployment/backend \
                        backend=${ECR_REGISTRY}/${BACKEND_REPO}:latest \
                        -n production

                        kubectl rollout status \
                        deployment/backend \
                        -n production
                        """
                    }

                    sh """
                    ssh \
                    -o StrictHostKeyChecking=no \
                    ${BASTION_USER}@${BASTION_HOST} '
                    ${commands}
                    '
                    """
                }
            }
        }
    }
}

post {

    success {

        echo "Deployment Completed Successfully"
    }

    failure {

        echo "Deployment Failed"
    }
}

}
