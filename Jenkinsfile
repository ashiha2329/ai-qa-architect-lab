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
        withCredentials([
            string(
                credentialsId: 'openai-api-key',
                variable: 'OPENAI_API_KEY'
            )
        ]) {
            sh 'node scripts/ai-failure-analyzer.js'
        }
        
        sh '''
        echo "=== AI Failure Analysis ==="
        cat ai-analysis/failure-analysis.md
        '''

        archiveArtifacts artifacts: 'ai-analysis/**/*',
                         allowEmptyArchive: true

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
}
