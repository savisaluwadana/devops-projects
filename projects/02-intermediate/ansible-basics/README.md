# ⚙️ Ansible Configuration Management

Automate server configuration and application deployment with Ansible.

## 🎯 Learning Objectives

- Understand Ansible architecture (agentless)
- Write playbooks and roles
- Manage inventories
- Use variables and templates
- Handle secrets with Vault

## 📋 Prerequisites

- Ansible installed (`pip install ansible`)
- SSH access to target servers
- Basic YAML knowledge

## 🔬 Hands-On Labs

### Lab 1: First Playbook
```yaml
# playbook.yml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
      when: ansible_os_family == "Debian"

    - name: Install nginx
      package:
        name: nginx
        state: present

    - name: Start nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Create index page
      copy:
        content: "<h1>Hello from Ansible!</h1>"
        dest: /var/www/html/index.html
```

```bash
# Run playbook
ansible-playbook -i inventory playbook.yml

# Dry run (check mode)
ansible-playbook -i inventory playbook.yml --check

# Verbose output
ansible-playbook -i inventory playbook.yml -vvv
```

### Lab 2: Inventory Management
```ini
# inventory/hosts.ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com ansible_user=dbadmin

[production:children]
webservers
databases

[production:vars]
ansible_ssh_private_key_file=~/.ssh/prod_key.pem
environment=production
```

```yaml
# inventory/hosts.yml (YAML format)
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
      vars:
        http_port: 80
    databases:
      hosts:
        db1.example.com:
          ansible_user: dbadmin
  vars:
    ansible_python_interpreter: /usr/bin/python3
```

### Lab 3: Variables and Templates
```yaml
# group_vars/webservers.yml
---
nginx_worker_processes: auto
nginx_worker_connections: 1024
app_name: myapp
app_port: 8080
```

```jinja2
# templates/nginx.conf.j2
user nginx;
worker_processes {{ nginx_worker_processes }};

events {
    worker_connections {{ nginx_worker_connections }};
}

http {
    server {
        listen 80;
        server_name {{ inventory_hostname }};

        location / {
            proxy_pass http://127.0.0.1:{{ app_port }};
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

```yaml
# playbook.yml
- name: Configure nginx
  hosts: webservers
  become: yes
  
  tasks:
    - name: Deploy nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        validate: nginx -t -c %s
      notify: Reload nginx

  handlers:
    - name: Reload nginx
      service:
        name: nginx
        state: reloaded
```

### Lab 4: Roles Structure
```
roles/
└── webserver/
    ├── defaults/
    │   └── main.yml        # Default variables
    ├── files/
    │   └── ssl-cert.pem    # Static files
    ├── handlers/
    │   └── main.yml        # Handlers
    ├── meta/
    │   └── main.yml        # Role dependencies
    ├── tasks/
    │   └── main.yml        # Main tasks
    ├── templates/
    │   └── nginx.conf.j2   # Templates
    └── vars/
        └── main.yml        # Role variables
```

```yaml
# roles/webserver/tasks/main.yml
---
- name: Install packages
  package:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - certbot
    - python3-certbot-nginx

- name: Deploy nginx config
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: Reload nginx

- name: Ensure directories exist
  file:
    path: "{{ item }}"
    state: directory
    mode: '0755'
  loop:
    - /var/www/html
    - /var/log/nginx

# roles/webserver/handlers/main.yml
---
- name: Reload nginx
  service:
    name: nginx
    state: reloaded

- name: Restart nginx
  service:
    name: nginx
    state: restarted

# Using roles in playbook
# site.yml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  roles:
    - webserver
    - security
```

### Lab 5: Ansible Vault
```bash
# Create encrypted file
ansible-vault create secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# Encrypt existing file
ansible-vault encrypt plain.yml

# Run playbook with vault
ansible-playbook site.yml --ask-vault-pass

# Or use vault password file
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

```yaml
# secrets.yml (encrypted)
---
db_password: supersecret123
api_key: abc123xyz

# Use in playbook
- name: Configure app
  template:
    src: app.conf.j2
    dest: /etc/app/config
  vars:
    database_password: "{{ db_password }}"
```

## 📝 Project: Server Hardening Playbook

```yaml
# security-hardening.yml
---
- name: Security Hardening
  hosts: all
  become: yes
  
  vars:
    ssh_port: 22
    allowed_users:
      - admin
      - deploy
    
  tasks:
    # Update system
    - name: Update all packages
      apt:
        upgrade: dist
        update_cache: yes
      when: ansible_os_family == "Debian"

    # Configure SSH
    - name: Configure SSH security
      template:
        src: sshd_config.j2
        dest: /etc/ssh/sshd_config
        validate: sshd -t -f %s
      notify: Restart sshd

    # Configure firewall
    - name: Install UFW
      apt:
        name: ufw
        state: present

    - name: Allow SSH
      ufw:
        rule: allow
        port: "{{ ssh_port }}"
        proto: tcp

    - name: Allow HTTP/HTTPS
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - "80"
        - "443"

    - name: Enable UFW
      ufw:
        state: enabled
        policy: deny

    # Fail2ban
    - name: Install fail2ban
      apt:
        name: fail2ban
        state: present

    - name: Configure fail2ban
      copy:
        src: jail.local
        dest: /etc/fail2ban/jail.local
      notify: Restart fail2ban

    # Disable root login
    - name: Disable root password
      user:
        name: root
        password_lock: yes

    # Set up automatic updates
    - name: Install unattended-upgrades
      apt:
        name: unattended-upgrades
        state: present

    - name: Enable automatic updates
      copy:
        dest: /etc/apt/apt.conf.d/20auto-upgrades
        content: |
          APT::Periodic::Update-Package-Lists "1";
          APT::Periodic::Unattended-Upgrade "1";

  handlers:
    - name: Restart sshd
      service:
        name: sshd
        state: restarted

    - name: Restart fail2ban
      service:
        name: fail2ban
        state: restarted
```

## 🔧 Essential Commands

```bash
# Ad-hoc commands
ansible all -m ping
ansible webservers -m shell -a "uptime"
ansible all -m apt -a "name=htop state=present" --become

# Playbook execution
ansible-playbook site.yml --limit webservers
ansible-playbook site.yml --tags "nginx,security"
ansible-playbook site.yml --skip-tags "slow"
ansible-playbook site.yml --start-at-task "Install nginx"

# Galaxy roles
ansible-galaxy install geerlingguy.docker
ansible-galaxy collection install community.general

# Testing
ansible-lint playbook.yml
molecule test
```

## ✅ Completion Checklist

- [ ] Write basic playbooks
- [ ] Manage inventory files
- [ ] Use variables and templates
- [ ] Create reusable roles
- [ ] Encrypt secrets with Vault
- [ ] Use handlers
- [ ] Implement server hardening
- [ ] Test with molecule

## 📚 Resources

- [Ansible Docs](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)

---

**Next Project:** [Prometheus & Grafana](../prometheus-grafana/)
