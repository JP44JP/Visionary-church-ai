#!/bin/bash

# =============================================================================
# VisionaryChurch-AI Deployment Script
# Automated deployment for multi-tenant SaaS platform
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="/tmp/church-deploy-${TIMESTAMP}.log"

# Default values
ENVIRONMENT="${ENVIRONMENT:-staging}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="${NAMESPACE:-visionary-church}"
KUBECTL_CONTEXT="${KUBECTL_CONTEXT:-}"
SKIP_TESTS="${SKIP_TESTS:-false}"
DRY_RUN="${DRY_RUN:-false}"
ROLLBACK="${ROLLBACK:-false}"
ROLLBACK_REVISION="${ROLLBACK_REVISION:-}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy VisionaryChurch-AI to Kubernetes

OPTIONS:
    -e, --environment    Environment (staging|production) [default: staging]
    -t, --tag           Docker image tag [default: latest]
    -n, --namespace     Kubernetes namespace [default: visionary-church]
    -c, --context       Kubectl context to use
    -s, --skip-tests    Skip running tests before deployment
    -d, --dry-run       Show what would be deployed without applying
    -r, --rollback      Rollback to previous revision
    -R, --rollback-to   Rollback to specific revision
    -h, --help          Show this help message

EXAMPLES:
    $0 --environment production --tag v1.2.3
    $0 --dry-run --environment staging
    $0 --rollback --environment production

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -c|--context)
            KUBECTL_CONTEXT="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -r|--rollback)
            ROLLBACK="true"
            shift
            ;;
        -R|--rollback-to)
            ROLLBACK="true"
            ROLLBACK_REVISION="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    print_error "Environment must be 'staging' or 'production'"
    exit 1
fi

# Set namespace based on environment
if [[ "$ENVIRONMENT" == "staging" ]]; then
    NAMESPACE="visionary-church-staging"
else
    NAMESPACE="visionary-church"
fi

# Set kubectl context if provided
if [[ -n "$KUBECTL_CONTEXT" ]]; then
    kubectl config use-context "$KUBECTL_CONTEXT"
fi

print_status "Starting deployment to $ENVIRONMENT environment"
print_status "Namespace: $NAMESPACE"
print_status "Image tag: $IMAGE_TAG"
print_status "Log file: $LOG_FILE"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required tools are installed
    for tool in kubectl docker helm; do
        if ! command -v $tool &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_status "Creating namespace: $NAMESPACE"
        kubectl apply -f "$PROJECT_ROOT/k8s/namespace.yml"
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        print_warning "Skipping tests as requested"
        return
    fi
    
    print_status "Running tests..."
    cd "$PROJECT_ROOT"
    
    if [[ -f "package.json" ]]; then
        npm run test:coverage 2>&1 | tee -a "$LOG_FILE"
        if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
            print_error "Tests failed"
            exit 1
        fi
    fi
    
    print_success "Tests passed"
}

# Function to build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    cd "$PROJECT_ROOT"
    
    local image_name="ghcr.io/your-org/visionary-church-ai:$IMAGE_TAG"
    
    docker build -t "$image_name" .
    docker push "$image_name"
    
    print_success "Image built and pushed: $image_name"
}

# Function to update Kubernetes manifests
update_manifests() {
    print_status "Updating Kubernetes manifests..."
    
    # Create temporary directory for modified manifests
    local temp_dir=$(mktemp -d)
    cp -r "$PROJECT_ROOT/k8s" "$temp_dir/"
    
    # Update image tags in deployment files
    find "$temp_dir/k8s" -name "*.yml" -type f -exec \
        sed -i "s|ghcr.io/your-org/visionary-church-ai:latest|ghcr.io/your-org/visionary-church-ai:$IMAGE_TAG|g" {} \;
    
    echo "$temp_dir"
}

# Function to perform rollback
perform_rollback() {
    print_status "Performing rollback..."
    
    if [[ -n "$ROLLBACK_REVISION" ]]; then
        print_status "Rolling back to revision: $ROLLBACK_REVISION"
        kubectl rollout undo deployment/church-api --to-revision="$ROLLBACK_REVISION" -n "$NAMESPACE"
        kubectl rollout undo deployment/church-worker --to-revision="$ROLLBACK_REVISION" -n "$NAMESPACE"
    else
        print_status "Rolling back to previous revision"
        kubectl rollout undo deployment/church-api -n "$NAMESPACE"
        kubectl rollout undo deployment/church-worker -n "$NAMESPACE"
    fi
    
    # Wait for rollback to complete
    kubectl rollout status deployment/church-api -n "$NAMESPACE" --timeout=600s
    kubectl rollout status deployment/church-worker -n "$NAMESPACE" --timeout=600s
    
    print_success "Rollback completed"
}

# Function to deploy to Kubernetes
deploy_to_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    local temp_dir=$(update_manifests)
    local kubectl_cmd="kubectl apply"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        kubectl_cmd="kubectl apply --dry-run=client"
        print_status "DRY RUN MODE - No changes will be applied"
    fi
    
    # Apply ConfigMaps and Secrets first
    $kubectl_cmd -f "$temp_dir/k8s/configmap.yml" | tee -a "$LOG_FILE"
    
    # Apply Services
    $kubectl_cmd -f "$temp_dir/k8s/service.yml" | tee -a "$LOG_FILE"
    
    # Apply Deployments with rolling update strategy
    $kubectl_cmd -f "$temp_dir/k8s/deployment.yml" | tee -a "$LOG_FILE"
    
    # Apply Ingress
    $kubectl_cmd -f "$temp_dir/k8s/ingress.yml" | tee -a "$LOG_FILE"
    
    # Apply HPA and other resources
    $kubectl_cmd -f "$temp_dir/k8s/hpa.yml" | tee -a "$LOG_FILE"
    
    # Clean up
    rm -rf "$temp_dir"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        print_success "Manifests applied successfully"
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    print_status "Waiting for deployment to complete..."
    
    # Wait for deployments to be ready
    kubectl rollout status deployment/church-api -n "$NAMESPACE" --timeout=600s | tee -a "$LOG_FILE"
    kubectl rollout status deployment/church-worker -n "$NAMESPACE" --timeout=600s | tee -a "$LOG_FILE"
    
    print_success "Deployment completed successfully"
}

# Function to run smoke tests
run_smoke_tests() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    print_status "Running smoke tests..."
    
    # Get service endpoint
    local service_ip
    if [[ "$ENVIRONMENT" == "production" ]]; then
        service_ip=$(kubectl get ingress church-api-ingress -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    else
        service_ip=$(kubectl get service church-api-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    fi
    
    if [[ -z "$service_ip" ]]; then
        service_ip="localhost"
        print_warning "Could not get external IP, using localhost for smoke tests"
    fi
    
    # Wait for service to be ready
    sleep 30
    
    # Basic health check
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        print_status "Health check attempt $attempt/$max_attempts"
        
        if curl -sf "http://$service_ip/health" > /dev/null; then
            print_success "Health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            print_error "Health check failed after $max_attempts attempts"
            exit 1
        fi
        
        sleep 30
        ((attempt++))
    done
    
    # API endpoint test
    if curl -sf "http://$service_ip/api/public/health" > /dev/null; then
        print_success "API endpoint test passed"
    else
        print_warning "API endpoint test failed"
    fi
    
    print_success "Smoke tests completed"
}

# Function to update monitoring
update_monitoring() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    print_status "Updating monitoring configuration..."
    
    # Update Prometheus rules if they exist
    if [[ -f "$PROJECT_ROOT/monitoring/alerting-rules.yml" ]]; then
        kubectl apply -f "$PROJECT_ROOT/monitoring/alerting-rules.yml" -n monitoring 2>/dev/null || true
    fi
    
    print_success "Monitoring configuration updated"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # You can integrate with Slack, Teams, or other notification systems here
    print_status "Notification: $status - $message"
    
    # Example Slack webhook (uncomment and configure)
    # if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"Deployment $status: $message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
}

# Function to save deployment info
save_deployment_info() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    local info_file="/tmp/deployment-info-${TIMESTAMP}.json"
    
    cat > "$info_file" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "environment": "${ENVIRONMENT}",
    "namespace": "${NAMESPACE}",
    "image_tag": "${IMAGE_TAG}",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "deployed_by": "$(whoami)",
    "log_file": "${LOG_FILE}"
}
EOF
    
    print_status "Deployment info saved to: $info_file"
}

# Main deployment function
main() {
    print_status "=== VisionaryChurch-AI Deployment Started ==="
    
    # Handle rollback
    if [[ "$ROLLBACK" == "true" ]]; then
        check_prerequisites
        perform_rollback
        run_smoke_tests
        send_notification "SUCCESS" "Rollback completed for $ENVIRONMENT"
        print_success "=== Rollback Completed Successfully ==="
        return
    fi
    
    # Normal deployment flow
    check_prerequisites
    run_tests
    
    if [[ "$DRY_RUN" == "false" ]]; then
        build_and_push_image
    fi
    
    deploy_to_kubernetes
    wait_for_deployment
    run_smoke_tests
    update_monitoring
    save_deployment_info
    
    send_notification "SUCCESS" "Deployment completed for $ENVIRONMENT with tag $IMAGE_TAG"
    print_success "=== Deployment Completed Successfully ==="
}

# Trap to handle script interruption
trap 'print_error "Deployment interrupted"; exit 130' INT TERM

# Run main function
main "$@"