**WSO2 API Manager Integration Guide**

Overview
- WSO2 API Manager (WSO2 AM) acts as the gateway and API management plane. In this architecture WSO2 will be deployed inside the Kind cluster and expose port 80/443 on the host. WSO2 will proxy requests to the internal `springboot-service` ClusterIP.

Helm install (quick)
```
helm repo add wso2 https://helm.wso2.com
helm repo update
helm install wso2-am wso2/am-pattern-1 --set wso2.deployment.am.ingress.enabled=true
```

Notes
- The chart above is a high-level example; WSO2 requires memory and CPU. For local Kind use, ensure Docker has enough resources (4+ GB RAM).
- The Terraform `kind` cluster created maps host port 80 to the control-plane container port 80 so WSO2 can be reached using `http://localhost`.

Expose the backend to WSO2 (internal DNS)
- When creating an API in WSO2 Publisher, set the endpoint to the internal service DNS name. Example:
  - Endpoint URL: `http://springboot-service.default.svc.cluster.local:8080`

Authentication and rate limiting
- Use WSO2's developer portal / publisher to configure OAuth2, API keys, throttling and rate-limiting policies.

Troubleshooting
- WSO2 pods may take several minutes to become ready due to startup time. Check pods: `kubectl get pods -n default` or if installed in `wso2` namespace, `kubectl -n wso2 get pods`.
- If WSO2 cannot reach the backend, verify the service name and port, and ensure the backend pod is healthy.

Scaling and production
- For production, run WSO2 on multi-node k8s or a managed cluster (AKS/EKS/GKE). Use persistent volumes, K8s secrets for credentials, and a proper TLS certificate for the WSO2 ingress.
