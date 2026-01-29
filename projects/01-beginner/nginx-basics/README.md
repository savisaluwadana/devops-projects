# 🌐 Nginx Web Server Basics

Learn to configure and deploy web applications with Nginx.

## 🎯 Learning Objectives
- Install and configure Nginx
- Serve static content
- Configure virtual hosts
- Set up reverse proxy
- Implement SSL/TLS

## 📋 Prerequisites
- Linux basics
- Command line proficiency

---

## Lab 1: Installation & Basic Config

### Install Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx

# Verify
curl http://localhost
```

### Directory Structure
```
/etc/nginx/
├── nginx.conf           # Main config
├── sites-available/     # Available sites
├── sites-enabled/       # Enabled sites (symlinks)
├── conf.d/              # Additional configs
└── snippets/            # Reusable snippets

/var/www/html/           # Default web root
/var/log/nginx/          # Logs
```

### Basic Configuration
```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    gzip on;
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

---

## Lab 2: Virtual Hosts

### Create Site Config
```nginx
# /etc/nginx/sites-available/mysite.conf
server {
    listen 80;
    server_name mysite.local www.mysite.local;
    
    root /var/www/mysite;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location /images/ {
        alias /var/www/images/;
    }
    
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### Enable Site
```bash
# Create web directory
sudo mkdir -p /var/www/mysite
echo "<h1>My Site</h1>" | sudo tee /var/www/mysite/index.html

# Enable site
sudo ln -s /etc/nginx/sites-available/mysite.conf /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Lab 3: Reverse Proxy

### Proxy to Backend
```nginx
# /etc/nginx/sites-available/app.conf
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name app.local;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://backend/api;
        proxy_read_timeout 90;
    }
    
    location /static {
        alias /var/www/static;
        expires 30d;
    }
}
```

---

## Lab 4: SSL/TLS Configuration

### Self-Signed Certificate
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt
```

### HTTPS Config
```nginx
server {
    listen 443 ssl http2;
    server_name secure.local;
    
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    root /var/www/secure;
    index index.html;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name secure.local;
    return 301 https://$server_name$request_uri;
}
```

---

## ✅ Completion Checklist
- [ ] Installed and started Nginx
- [ ] Created static website
- [ ] Configured virtual hosts
- [ ] Set up reverse proxy
- [ ] Implemented SSL/TLS
- [ ] Tested all configurations
