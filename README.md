# KubeView

## Overview

KubeView is a Kubernetes preview environment tool that allows you to create, manage, and monitor preview environments directly from your GitHub repository. It provides both a GitHub Actions integration and a command-line interface (CLI) tool for seamless integration into your development workflow.

## Demo 
<video controls src="./assets/KubernetesPreviewEnvDemo.mp4" title="Title"></video>

### Prerequisites

- Node.js and npm installed on your machine
- Access to a Kubernetes cluster

### Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/Nikunj0601/KubeView.git
   ```

2. **Navigate to Project Directory:**
   ```bash
   cd KubeView
   cd kube-view
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Set Environment Variables:**
   Create a `.env` file based on the provided example `.env.example` file and update the variables as required.

5. **Provide Kubernetes Cluster Configuration:**
   Ensure you have access to a Kubernetes cluster and provide the cluster configuration in `./kube-view/config` file.

6. **Start KubeView Server:**
   ```bash
   npm run start
   ```

7. **Install CLI Tool:**
   ```bash
   cd ../kubeview-cli
   npm install -g .
   ```

To use KubeView, you have two options: GitHub Actions integration or CLI tool. 

### GitHub Actions Integration

1. **Export GitHub Token:** Before using the KubeView CLI, export your GitHub token by executing:
   ```
   export GITHUB_TOKEN='your_token'
   ```
2. **Generate API Key:** First, generate an API key using the `kubeview api-key create` command.
3. **Export API Key:** Before using the other KubeView CLI commands, export your API Key that you created earlier by executing:
   ```
   export KUBEVIEW_API_KEY='you_api_key'
   ```


### CLI Tool

1. **Export GitHub Token:** Before using the KubeView CLI, export your GitHub token by executing:
   ```
   export GITHUB_TOKEN='your_token'
   ```
2. **Generate API Key:** First, generate an API key using the `kubeview api-key create` command.
3. **Export API Key:** Before using the other KubeView CLI commands, export your API Key that you created earlier by executing:
   ```
   export KUBEVIEW_API_KEY='you_api_key'
   ```
4. **Install CLI:** Install the CLI tool using npm:
   ```bash
   npm install -g kubeview
   ```

## Usage

### CLI Commands

Here are the available commands and their usage:

#### 1. Create Environment
   ```bash
   kubeview createEnvironment -u <username> -r <repoName> -p <pullRequest> -f <filePath> 
   ```
   This command creates a preview environment for the specified pull request.

#### 2. Get Environment Details
   ```bash
   kubeview environment -u <username> -r <repoName> -p <pullRequest>
   ```
   Use this command to retrieve details about a specific preview environment for a pull request.

#### 3. Get All Environments
   ```bash
   kubeview environments -u <username>
   ```
   Retrieve all environments created by the specified user.

#### 4. Delete Environment
   ```bash
   kubeview deleteEnvironment -u <username> -r <repoName> -p <pullRequest>
   ```
   Delete the preview environment associated with the specified pull request.

#### 5. Get Pod Logs
   ```bash
   kubeview getPodLogs -r <repo> -p <pull> -n <podName>
   ```
   Retrieve logs from a specific pod in the preview environment.

### Additional Command
```bash
kubeview api-key list
```
Use this command to list all available API keys.

### CURL apis to integrate in Github Actions

#### 1. Create Environment
   ```bash
   curl --location 'http://localhost:8080/github/repos/{username}/{repo}/createEnvironment/{pull}' \
    --header 'x-api-key: your_api_key' \
    --header 'github-token: your_github_token' \
    --header 'Content-Type: application/json' \
    --data '{
        "filePaths": []
    }'
   ```
   This curl api can be integrated to creates a preview environment for the specified pull request.

#### 2. Get Environment Details
   ```bash
   curl --location 'http://localhost:8080/kube/environment/{username}/{repo}/{pull}' \
    --header 'x-api-key: your_api_key' \
    --header 'github-token: your_github_token' 
   ```
   Use this command to retrieve details about a specific preview environment for a pull request.

#### 3. Get All Environments
   ```bash
   curl --location 'http://localhost:8080/kube/environments/{username}' \
    --header 'x-api-key: your_api_key' \
    --header 'github-token: your_github_token'
   ```
   Retrieve all environments created by the specified user.

#### 4. Delete Environment
   ```bash
   curl --location 'http://localhost:8080/github/repos/{username}/{repo}/deleteEnviornment/{pull}' \
    --header 'x-api-key: your_api_key' \
    --header 'github-token: your_github_token'  
   ```
   Delete the preview environment associated with the specified pull request.

#### 5. Get Pod Logs
   ```bash
   curl --location 'http://localhost:8080/kube/logs/{repo}/{pull}/{podName}' \
    --header 'x-api-key: your_api_key' \
    --header 'github-token: your_github_token' 
   ```
   Retrieve logs from a specific pod in the preview environment.
### Example Github Actions yaml
   ```
   name: Docker Build and Push
   
   on:
     pull_request:
       branches:
         - main
         - developer
   
   jobs:
     build-and-push:
       runs-on: ubuntu-latest
   
       steps:
         - name: Checkout repository
           uses: actions/checkout@v2
   
         - name: Login to Docker Hub
           uses: docker/login-action@v1
           with:
             username: ${{ secrets.DOCKERHUB_USERNAME }}
             password: ${{ secrets.DOCKERHUB_TOKEN }}
   
         - name: Get commit SHA
           id: commit_sha
           run: echo "::set-output name=sha::$(git rev-parse HEAD)"
   
         - name: Build Docker image
           run: |
             docker build -t username/imageName:tag .
         
         - name: Push Docker image to Docker Hub
           run: |
             docker push username/imageName:tag
             
         - name: Call API
           run: |
             curl --location 'http://backendhost:port/github/repos/{owner}/{repo}/createEnvironment/${{ github.event.pull_request.number }}' \
                 --header 'x-api-key: your_api_key' \
                 --header 'github-token: github_token' \
                 --header 'Content-Type: application/json' \
                 --data '{
                     "filePaths": ["/kube-deployment.yaml", "/kube-service.yaml", "/kube-pvc.yaml"]
                 }'
   ```
