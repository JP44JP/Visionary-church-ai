#!/bin/bash
# =============================================================================
# COMPREHENSIVE MONITORING DEPLOYMENT SCRIPT
# VisionaryChurch-AI SaaS Platform
# =============================================================================

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-visionary-church}"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${CLUSTER_NAME:-visionary-church-production}"
MONITORING_DOMAIN="${MONITORING_DOMAIN:-monitoring.visionarychurch.ai}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    local dependencies=("kubectl" "helm" "aws" "curl" "jq")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install the missing dependencies and retry."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Verify cluster access
verify_cluster_access() {
    log_info "Verifying cluster access..."
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        log_error "Please check your kubeconfig and cluster connectivity"
        exit 1
    fi
    
    local cluster_context=$(kubectl config current-context)
    log_success "Connected to cluster: $cluster_context"
}

# Create namespace if it doesn't exist
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_warning "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace "$NAMESPACE"
        log_success "Created namespace: $NAMESPACE"
    fi
    
    # Label the namespace
    kubectl label namespace "$NAMESPACE" monitoring=enabled --overwrite
    kubectl label namespace "$NAMESPACE" environment="$ENVIRONMENT" --overwrite
}

# Deploy secrets
deploy_secrets() {
    log_info "Deploying monitoring secrets..."
    
    # Check if secrets already exist
    if kubectl get secret monitoring-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warning "Monitoring secrets already exist. Updating..."
        kubectl delete secret monitoring-secrets -n "$NAMESPACE"
    fi
    
    # Create secrets from environment variables or prompt user
    local datadog_api_key="${DATADOG_API_KEY:-}"
    local grafana_admin_password="${GRAFANA_ADMIN_PASSWORD:-}"
    local webhook_token="${WEBHOOK_TOKEN:-}"
    
    if [ -z "$datadog_api_key" ]; then
        read -p "Enter Datadog API Key: " -s datadog_api_key
        echo
    fi
    
    if [ -z "$grafana_admin_password" ]; then
        read -p "Enter Grafana Admin Password: " -s grafana_admin_password
        echo
    fi
    
    if [ -z "$webhook_token" ]; then
        webhook_token=$(openssl rand -hex 32)
        log_info "Generated webhook token: $webhook_token"
    fi
    
    kubectl create secret generic monitoring-secrets -n "$NAMESPACE" \
        --from-literal=datadog-api-key="$datadog_api_key" \
        --from-literal=grafana-admin-password="$grafana_admin_password" \
        --from-literal=webhook-token="$webhook_token" \
        --from-literal=postgres-monitor-user="$POSTGRES_MONITOR_USER" \
        --from-literal=postgres-monitor-password="$POSTGRES_MONITOR_PASSWORD" \
        --from-literal=redis-password="$REDIS_PASSWORD"
    
    log_success "Monitoring secrets deployed"
}

# Add Helm repositories
add_helm_repos() {
    log_info "Adding Helm repositories..."
    
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo add datadog https://helm.datadoghq.com
    helm repo add elastic https://helm.elastic.co
    helm repo add jaeger https://jaegertracing.github.io/helm-charts
    
    helm repo update
    log_success "Helm repositories added and updated"
}

# Deploy Prometheus stack
deploy_prometheus() {
    log_info "Deploying Prometheus stack..."
    
    # Create custom values file
    cat > prometheus-values.yaml <<EOF
prometheus:
  prometheusSpec:
    retention: 15d
    retentionSize: 50GB
    replicas: 2
    resources:
      requests:
        memory: 2Gi
        cpu: 1000m
      limits:
        memory: 4Gi
        cpu: 2000m
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
    externalUrl: https://${MONITORING_DOMAIN}/prometheus
    routePrefix: /prometheus
    
    # Custom configuration
    additionalScrapeConfigs:
      - job_name: 'church-business-metrics'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names: ['${NAMESPACE}']
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape_business]
            action: keep
            regex: true
        metrics_path: /metrics/business
        scrape_interval: 30s

alertmanager:
  alertmanagerSpec:
    replicas: 2
    resources:
      requests:
        memory: 256Mi
        cpu: 100m
      limits:
        memory: 512Mi
        cpu: 200m
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
    externalUrl: https://${MONITORING_DOMAIN}/alertmanager
    routePrefix: /alertmanager

grafana:
  enabled: true
  adminPassword: "${GRAFANA_ADMIN_PASSWORD}"
  grafana.ini:
    server:
      root_url: https://${MONITORING_DOMAIN}/grafana
      serve_from_sub_path: true
    security:
      allow_embedding: true
    auth.anonymous:
      enabled: false
    dashboards:
      default_home_dashboard_path: /tmp/dashboards/overview.json
  resources:
    requests:
      memory: 512Mi
      cpu: 250m
    limits:
      memory: 1Gi
      cpu: 500m
  persistence:
    enabled: true
    storageClassName: gp3
    size: 20Gi

nodeExporter:
  enabled: true

prometheusOperator:
  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 200m

kubeStateMetrics:
  enabled: true

defaultRules:
  create: true
  rules:
    alertmanager: true
    etcd: true
    general: true
    k8s: true
    kubeApiserver: true
    kubeApiserverAvailability: true
    kubeApiserverError: true
    kubeApiserverSlos: true
    kubelet: true
    kubePrometheusGeneral: true
    kubePrometheusNodeAlerting: true
    kubePrometheusNodeRecording: true
    kubernetesAbsent: true
    kubernetesApps: true
    kubernetesResources: true
    kubernetesStorage: true
    kubernetesSystem: true
    node: true
    prometheus: true
    prometheusOperator: true

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - ${MONITORING_DOMAIN}
  paths:
    - /prometheus
    - /grafana
    - /alertmanager
  tls:
    - secretName: monitoring-tls
      hosts:
        - ${MONITORING_DOMAIN}
EOF

    helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
        --namespace "$NAMESPACE" \
        --values prometheus-values.yaml \
        --set global.storageClass=gp3 \
        --wait --timeout=10m
    
    log_success "Prometheus stack deployed"
    rm -f prometheus-values.yaml
}

# Deploy Datadog
deploy_datadog() {
    log_info "Deploying Datadog monitoring..."
    
    # Apply Datadog configuration
    kubectl apply -f datadog-config.yaml -n "$NAMESPACE"
    
    # Deploy Datadog using Helm
    helm upgrade --install datadog datadog/datadog \
        --namespace "$NAMESPACE" \
        --set datadog.apiKey="$DATADOG_API_KEY" \
        --set datadog.site="datadoghq.com" \
        --set datadog.logs.enabled=true \
        --set datadog.apm.enabled=true \
        --set datadog.processAgent.enabled=true \
        --set datadog.orchestratorExplorer.enabled=true \
        --set clusterAgent.enabled=true \
        --set clusterAgent.metricsProvider.enabled=true \
        --set clusterAgent.metricsProvider.useDatadogMetrics=true \
        --wait --timeout=10m
    
    log_success "Datadog monitoring deployed"
}

# Deploy ELK Stack
deploy_elk_stack() {
    log_info "Deploying ELK stack for logging..."
    
    # Deploy Elasticsearch
    cat > elasticsearch-values.yaml <<EOF
clusterName: "church-elasticsearch"
nodeGroup: "master"
masterService: "church-elasticsearch"
replicas: 3
minimumMasterNodes: 2

esConfig:
  elasticsearch.yml: |
    cluster.name: "church-elasticsearch"
    network.host: 0.0.0.0
    discovery.seed_hosts: "church-elasticsearch-master-headless"
    cluster.initial_master_nodes: "church-elasticsearch-master-0,church-elasticsearch-master-1,church-elasticsearch-master-2"
    
resources:
  requests:
    cpu: "1000m"
    memory: "2Gi"
  limits:
    cpu: "2000m"
    memory: "4Gi"

volumeClaimTemplate:
  accessModes: [ "ReadWriteOnce" ]
  storageClassName: gp3
  resources:
    requests:
      storage: 100Gi

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: elasticsearch-auth
  hosts:
    - host: elasticsearch.${MONITORING_DOMAIN}
      paths:
        - path: /
  tls:
    - secretName: elasticsearch-tls
      hosts:
        - elasticsearch.${MONITORING_DOMAIN}
EOF

    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace "$NAMESPACE" \
        --values elasticsearch-values.yaml \
        --wait --timeout=15m
    
    # Deploy Logstash
    kubectl apply -f logging-config.yaml -n "$NAMESPACE"
    
    helm upgrade --install logstash elastic/logstash \
        --namespace "$NAMESPACE" \
        --set replicas=2 \
        --set resources.requests.cpu=500m \
        --set resources.requests.memory=1Gi \
        --set resources.limits.cpu=1000m \
        --set resources.limits.memory=2Gi \
        --wait --timeout=10m
    
    # Deploy Kibana
    cat > kibana-values.yaml <<EOF
elasticsearchHosts: "http://elasticsearch-master:9200"
replicas: 1

kibanaConfig:
  kibana.yml: |
    server.name: kibana
    server.host: 0.0.0.0
    elasticsearch.hosts: [ "http://elasticsearch-master:9200" ]
    server.basePath: /kibana
    server.rewriteBasePath: true

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1000m
    memory: 2Gi

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
  hosts:
    - host: ${MONITORING_DOMAIN}
      paths:
        - path: /kibana(/|$)(.*)
  tls:
    - secretName: kibana-tls
      hosts:
        - ${MONITORING_DOMAIN}
EOF

    helm upgrade --install kibana elastic/kibana \
        --namespace "$NAMESPACE" \
        --values kibana-values.yaml \
        --wait --timeout=10m
    
    log_success "ELK stack deployed"
    rm -f elasticsearch-values.yaml kibana-values.yaml
}

# Deploy Fluent Bit
deploy_fluent_bit() {
    log_info "Deploying Fluent Bit for log collection..."
    
    # Apply Fluent Bit configuration
    kubectl apply -f logging-config.yaml -n "$NAMESPACE"
    
    # Deploy using Helm
    helm upgrade --install fluent-bit fluent/fluent-bit \
        --namespace "$NAMESPACE" \
        --set config.service="[SERVICE]\n    Flush 1\n    Log_Level info\n    Daemon off\n    HTTP_Server On\n    HTTP_Listen 0.0.0.0\n    HTTP_Port 2020" \
        --set config.inputs="[INPUT]\n    Name tail\n    Path /var/log/containers/*.log\n    Parser cri\n    Tag kube.*\n    Mem_Buf_Limit 5MB" \
        --set config.outputs="[OUTPUT]\n    Name es\n    Match *\n    Host elasticsearch-master\n    Port 9200\n    Index church-logs\n    Logstash_Format On" \
        --wait --timeout=10m
    
    log_success "Fluent Bit deployed"
}

# Deploy Jaeger for distributed tracing
deploy_jaeger() {
    log_info "Deploying Jaeger for distributed tracing..."
    
    helm upgrade --install jaeger jaeger/jaeger \
        --namespace "$NAMESPACE" \
        --set provisionDataStore.cassandra=false \
        --set provisionDataStore.elasticsearch=true \
        --set storage.type=elasticsearch \
        --set storage.elasticsearch.host=elasticsearch-master \
        --set storage.elasticsearch.port=9200 \
        --set agent.resources.requests.memory=128Mi \
        --set agent.resources.requests.cpu=100m \
        --set agent.resources.limits.memory=256Mi \
        --set agent.resources.limits.cpu=200m \
        --set collector.resources.requests.memory=512Mi \
        --set collector.resources.requests.cpu=250m \
        --set collector.resources.limits.memory=1Gi \
        --set collector.resources.limits.cpu=500m \
        --wait --timeout=10m
    
    log_success "Jaeger deployed"
}

# Deploy Blackbox Exporter
deploy_blackbox_exporter() {
    log_info "Deploying Blackbox Exporter for uptime monitoring..."
    
    cat > blackbox-values.yaml <<EOF
config:
  modules:
    http_2xx:
      prober: http
      timeout: 10s
      http:
        method: GET
        valid_status_codes: []
        valid_http_versions: ["HTTP/1.1", "HTTP/2"]
        follow_redirects: true
        preferred_ip_protocol: "ip4"
    http_post_2xx:
      prober: http
      timeout: 10s
      http:
        method: POST
        headers:
          Content-Type: application/json
        body: '{"test": true}'
        valid_status_codes: []
    tcp_connect:
      prober: tcp
      timeout: 10s
    dns:
      prober: dns
      timeout: 10s
      dns:
        query_name: "visionarychurch.ai"
        query_type: "A"

serviceMonitor:
  enabled: true
  defaults:
    labels:
      release: prometheus-stack
    interval: 30s
    scrapeTimeout: 30s
  targets:
    - name: visionarychurch.ai
      url: https://visionarychurch.ai
      module: http_2xx
    - name: api.visionarychurch.ai
      url: https://api.visionarychurch.ai/health
      module: http_2xx
    - name: chat.visionarychurch.ai
      url: https://chat.visionarychurch.ai/health
      module: http_2xx

resources:
  requests:
    memory: 64Mi
    cpu: 50m
  limits:
    memory: 128Mi
    cpu: 100m
EOF

    helm upgrade --install blackbox-exporter prometheus-community/prometheus-blackbox-exporter \
        --namespace "$NAMESPACE" \
        --values blackbox-values.yaml \
        --wait --timeout=10m
    
    log_success "Blackbox Exporter deployed"
    rm -f blackbox-values.yaml
}

# Import Grafana dashboards
import_grafana_dashboards() {
    log_info "Importing Grafana dashboards..."
    
    # Wait for Grafana to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n "$NAMESPACE" --timeout=300s
    
    # Get Grafana admin credentials
    local grafana_password
    grafana_password=$(kubectl get secret --namespace "$NAMESPACE" prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode)
    
    # Port-forward to Grafana (in background)
    kubectl port-forward -n "$NAMESPACE" svc/prometheus-stack-grafana 3000:80 &
    local portforward_pid=$!
    
    # Wait for port-forward to be ready
    sleep 5
    
    # Import dashboards using Grafana API
    local dashboards_file="grafana-dashboards.json"
    if [ -f "$dashboards_file" ]; then
        jq -c '.dashboards[]' "$dashboards_file" | while read dashboard; do
            local title=$(echo "$dashboard" | jq -r '.dashboard.title')
            log_info "Importing dashboard: $title"
            
            curl -s -X POST \
                -H "Content-Type: application/json" \
                -d "$dashboard" \
                "http://admin:${grafana_password}@localhost:3000/api/dashboards/db"
        done
    fi
    
    # Kill port-forward
    kill $portforward_pid 2>/dev/null || true
    
    log_success "Grafana dashboards imported"
}

# Apply custom alerting rules
apply_alerting_rules() {
    log_info "Applying custom alerting rules..."
    
    kubectl apply -f alerting-rules.yml -n "$NAMESPACE"
    
    log_success "Custom alerting rules applied"
}

# Deploy custom metrics exporters
deploy_custom_exporters() {
    log_info "Deploying custom metrics exporters..."
    
    # PostgreSQL Exporter
    helm upgrade --install postgres-exporter prometheus-community/prometheus-postgres-exporter \
        --namespace "$NAMESPACE" \
        --set config.datasource.host="$POSTGRES_HOST" \
        --set config.datasource.port=5432 \
        --set config.datasource.database="postgres" \
        --set config.datasource.user="$POSTGRES_MONITOR_USER" \
        --set config.datasource.password="$POSTGRES_MONITOR_PASSWORD" \
        --set config.datasource.sslmode="require" \
        --wait --timeout=10m
    
    # Redis Exporter
    helm upgrade --install redis-exporter prometheus-community/prometheus-redis-exporter \
        --namespace "$NAMESPACE" \
        --set redisAddress="redis://$REDIS_HOST:6379" \
        --set auth.enabled=true \
        --set auth.redisPassword="$REDIS_PASSWORD" \
        --wait --timeout=10m
    
    log_success "Custom exporters deployed"
}

# Configure SSL certificates
configure_ssl() {
    log_info "Configuring SSL certificates..."
    
    # Deploy cert-manager if not already present
    if ! kubectl get namespace cert-manager &> /dev/null; then
        kubectl create namespace cert-manager
        helm repo add jetstack https://charts.jetstack.io
        helm repo update
        
        helm upgrade --install cert-manager jetstack/cert-manager \
            --namespace cert-manager \
            --set installCRDs=true \
            --wait --timeout=10m
    fi
    
    # Create ClusterIssuer
    cat > cluster-issuer.yaml <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@visionarychurch.ai
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
    
    kubectl apply -f cluster-issuer.yaml
    rm -f cluster-issuer.yaml
    
    log_success "SSL certificates configured"
}

# Validate deployment
validate_deployment() {
    log_info "Validating monitoring deployment..."
    
    # Check if all pods are running
    local max_retries=60
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        local not_ready_pods
        not_ready_pods=$(kubectl get pods -n "$NAMESPACE" --no-headers | grep -v Running | grep -v Completed | wc -l)
        
        if [ "$not_ready_pods" -eq 0 ]; then
            log_success "All monitoring pods are running"
            break
        fi
        
        log_info "Waiting for $not_ready_pods pods to be ready... (attempt $((retry_count + 1))/$max_retries)"
        sleep 10
        ((retry_count++))
    done
    
    if [ $retry_count -eq $max_retries ]; then
        log_warning "Some pods may not be ready. Please check manually:"
        kubectl get pods -n "$NAMESPACE" --no-headers | grep -v Running | grep -v Completed
    fi
    
    # Check ingress
    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        log_success "Ingress resources created"
        kubectl get ingress -n "$NAMESPACE"
    fi
    
    # Check services
    log_info "Monitoring services:"
    kubectl get svc -n "$NAMESPACE" | grep -E "(prometheus|grafana|alertmanager|elasticsearch|kibana)"
}

# Display access information
display_access_info() {
    log_success "Monitoring deployment completed successfully!"
    echo
    echo "=== ACCESS INFORMATION ==="
    echo "Grafana Dashboard: https://${MONITORING_DOMAIN}/grafana"
    echo "Prometheus: https://${MONITORING_DOMAIN}/prometheus"
    echo "Alertmanager: https://${MONITORING_DOMAIN}/alertmanager"
    echo "Kibana: https://${MONITORING_DOMAIN}/kibana"
    echo
    echo "Default Credentials:"
    echo "Grafana: admin / ${GRAFANA_ADMIN_PASSWORD}"
    echo
    echo "=== NEXT STEPS ==="
    echo "1. Configure your DNS to point ${MONITORING_DOMAIN} to your ingress IP"
    echo "2. Update your application to include monitoring instrumentation"
    echo "3. Configure notification channels in Alertmanager"
    echo "4. Set up backup and retention policies"
    echo
    echo "=== MONITORING ENDPOINTS ==="
    echo "Health Check: https://api.visionarychurch.ai/health"
    echo "Metrics: https://api.visionarychurch.ai/metrics"
    echo "Business Metrics: https://api.visionarychurch.ai/metrics/business"
    echo "Security Metrics: https://api.visionarychurch.ai/metrics/security"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f ./*-values.yaml
    rm -f cluster-issuer.yaml
}

# Main deployment function
main() {
    log_info "Starting comprehensive monitoring deployment for VisionaryChurch-AI"
    echo "Environment: $ENVIRONMENT"
    echo "Namespace: $NAMESPACE"
    echo "AWS Region: $AWS_REGION"
    echo "Cluster: $CLUSTER_NAME"
    echo "Monitoring Domain: $MONITORING_DOMAIN"
    echo
    
    # Trap cleanup function
    trap cleanup EXIT
    
    # Pre-deployment checks
    check_dependencies
    verify_cluster_access
    
    # Core deployment steps
    create_namespace
    deploy_secrets
    add_helm_repos
    configure_ssl
    
    # Monitoring stack deployment
    deploy_prometheus
    deploy_datadog
    deploy_elk_stack
    deploy_fluent_bit
    deploy_jaeger
    deploy_blackbox_exporter
    deploy_custom_exporters
    
    # Configuration
    apply_alerting_rules
    import_grafana_dashboards
    
    # Validation
    validate_deployment
    display_access_info
    
    log_success "Monitoring deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "cleanup")
        log_info "Cleaning up monitoring deployment..."
        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
        log_success "Cleanup completed"
        ;;
    "status")
        log_info "Checking monitoring deployment status..."
        kubectl get all -n "$NAMESPACE"
        ;;
    "logs")
        log_info "Showing monitoring logs..."
        kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=prometheus --tail=50
        ;;
    *)
        echo "Usage: $0 {deploy|cleanup|status|logs}"
        echo "  deploy  - Deploy the complete monitoring stack"
        echo "  cleanup - Remove the monitoring deployment"
        echo "  status  - Show deployment status"
        echo "  logs    - Show recent logs"
        exit 1
        ;;
esac