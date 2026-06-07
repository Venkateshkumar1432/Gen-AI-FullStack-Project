pipeline {


agent any

environment {
    AWS_REGION = 'ap-south-1'

    FRONTEND_REPO = 'frontend'
    BACKEND_REPO = 'backend'

    ECR_REGISTRY = 'ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com'
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

            def previousCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
            def currentCommit = env.GIT_COMMIT

            if (!previousCommit) {
                echo "First build detected. Building everything."

                env.FRONTEND_CHANGED = 'true'
                env.BACKEND_CHANGED = 'true'

            } else {

                def changedFiles = sh(
                    script: """
                        git diff --name-only \
                        ${previousCommit} \
                        ${currentCommit}
                    """,
                    returnStdout: true
                ).trim()

                echo "Changed Files:"
                echo changedFiles

                env.FRONTEND_CHANGED =
                    changedFiles.contains('frontend/')
                        ? 'true'
                        : 'false'

                env.BACKEND_CHANGED =
                    changedFiles.contains('backend/')
                        ? 'true'
                        : 'false'
            }

            echo "Frontend Changed: ${env.FRONTEND_CHANGED}"
            echo "Backend Changed: ${env.BACKEND_CHANGED}"
        }
    }
}

    stage('Build Frontend') {
        when {
            expression { env.FRONTEND_CHANGED == 'true' }
        }

        steps {
            sh """
                docker build \
                -t ${FRONTEND_REPO}:latest \
                ./frontend
            """
        }
    }

    stage('Build Backend') {
        when {
            expression { env.BACKEND_CHANGED == 'true' }
        }

        steps {
            sh """
                docker build \
                -t ${BACKEND_REPO}:latest \
                ./backend
            """
        }
    }

    stage('Login To ECR') {
        when {
            expression {
                env.FRONTEND_CHANGED == 'true' ||
                env.BACKEND_CHANGED == 'true'
            }
        }

        steps {
            sh """
            aws ecr get-login-password \
            --region ${AWS_REGION} | \
            docker login \
            --username AWS \
            --password-stdin \
            ${ECR_REGISTRY}
            """
        }
    }

    stage('Push Frontend') {
        when {
            expression { env.FRONTEND_CHANGED == 'true' }
        }

        steps {
            sh """
            docker tag \
            ${FRONTEND_REPO}:latest \
            ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

            docker push \
            ${ECR_REGISTRY}/${FRONTEND_REPO}:latest
            """
        }
    }

    stage('Push Backend') {
        when {
            expression { env.BACKEND_CHANGED == 'true' }
        }

        steps {
            sh """
            docker tag \
            ${BACKEND_REPO}:latest \
            ${ECR_REGISTRY}/${BACKEND_REPO}:latest

            docker push \
            ${ECR_REGISTRY}/${BACKEND_REPO}:latest
            """
        }
    }

    stage('Deploy Frontend') {
        when {
            expression { env.FRONTEND_CHANGED == 'true' }
        }

        steps {
            sh """
            kubectl set image deployment/frontend \
            frontend=${ECR_REGISTRY}/${FRONTEND_REPO}:latest \
            -n production

            kubectl rollout status deployment/frontend \
            -n production
            """
        }
    }

    stage('Deploy Backend') {
        when {
            expression { env.BACKEND_CHANGED == 'true' }
        }

        steps {
            sh """
            kubectl set image deployment/backend \
            backend=${ECR_REGISTRY}/${BACKEND_REPO}:latest \
            -n production

            kubectl rollout status deployment/backend \
            -n production
            """
        }
    }
}


}
