pipeline {
    agent any

    stages {
        stage('Environment') {
            steps {
                sh '''
                    echo "=== CI Environment ==="
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Playwright') {
            steps {
                sh 'npx playwright install chromium'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test --project=chromium'
            }
        }
    }

    post {
    always {

        archiveArtifacts artifacts: 'test-results/**/*',
                         allowEmptyArchive: true

        archiveArtifacts artifacts: 'playwright-report/**/*',
                         allowEmptyArchive: true

        archiveArtifacts artifacts: 'allure-results/**/*',
                         allowEmptyArchive: true

        allure([
            includeProperties: false,
            jdk: '',
            results: [[path: 'allure-results']]
        ])
    }
}
