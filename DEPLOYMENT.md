# 🚢 SPRNT Simplified Kubernetes & Docker Guide

SPRNT has been streamlined into a **single full-stack container**:
- **FastAPI** serves both the REST API (`/auth`, `/sessions`, `/tasks`, `/health`) **and** the compiled React Single Page Application directly.
- **No Nginx proxy needed.**
- **No PVC or volume provisioning headaches needed** (uses local SQLite file inside container).
- **1 Docker image to build.**
- **1 Kubernetes Deployment & 1 Service.**

---

## 1. Build the Docker Image

From the project root:

```bash
docker build -t sprnt:latest .
```

To test it locally with Docker:
```bash
docker run -p 8000:8000 sprnt:latest
```
Open `http://localhost:8000` in your browser.

---

## 2. Deploy to Kubernetes with Helm

### Step 1: Load image into your local cluster (Minikube / Kind)

If using **Minikube**:
```bash
minikube image load sprnt:latest
```

If using **Kind**:
```bash
kind load docker-image sprnt:latest
```

*(Or push `sprnt:latest` to your container registry: Docker Hub, GHCR, etc.)*

### Step 2: Install via Helm

```bash
# Basic deployment (runs built-in rule-based coaching)
helm install sprnt ./helm/sprnt

# Or with your Gemini API key for live AI coaching:
helm install sprnt ./helm/sprnt --set geminiApiKey="your_gemini_api_key"
```

### Step 3: Access the App

```bash
# Port forward port 80 to localhost:8000
kubectl port-forward svc/sprnt 8000:80
```

Now open:
- 🌐 **Web App**: `http://localhost:8000`
- 📚 **API Docs**: `http://localhost:8000/docs`

---

## 3. Helm Chart Structure

```
helm/sprnt/
├── Chart.yaml             # Chart metadata
├── values.yaml            # Configuration (image, ports, env, resources)
└── templates/
    ├── _helpers.tpl       # Label and naming helpers
    ├── deployment.yaml    # Single full-stack Deployment
    ├── service.yaml       # Single Service (port 80 -> 8000)
    └── NOTES.txt          # Post-installation instructions
```

---

## 4. Useful Commands

```bash
# View pod status
kubectl get pods -l app.kubernetes.io/name=sprnt

# View logs
kubectl logs -l app.kubernetes.io/name=sprnt -f

# Upgrade release
helm upgrade sprnt ./helm/sprnt

# Uninstall release
helm uninstall sprnt
```
