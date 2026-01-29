# ⚙️ Complete Ansible Guide

A comprehensive guide covering Ansible for Configuration Management and Automation.

---

## Table of Contents
1. [Fundamentals](#1-fundamentals)
2. [Inventory Management](#2-inventory-management)
3. [Playbooks](#3-playbooks)
4. [Modules](#4-modules)
5. [Variables & Facts](#5-variables--facts)
6. [Conditionals & Loops](#6-conditionals--loops)
7. [Roles](#7-roles)
8. [Ansible Vault](#8-ansible-vault)
9. [Best Practices](#9-best-practices)

---

## 1. Fundamentals

### Installation
```bash
pip install ansible
ansible --version
```

### Core Concepts
- **Control Node**: Machine running Ansible
- **Managed Nodes**: Target servers
- **Inventory**: List of hosts
- **Playbook**: YAML automation scripts
- **Module**: Units of work
- **Role**: Reusable automation packages

### Ad-hoc Commands
```bash
ansible all -m ping
ansible webservers -m command -a "uptime"
ansible all -m apt -a "name=nginx state=present" --become
```

---

## 2. Inventory Management

### Static Inventory
```ini
# inventory/hosts
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com

[production:children]
webservers
dbservers

[webservers:vars]
ansible_user=ubuntu
```

### YAML Inventory
```yaml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
      vars:
        ansible_user: ubuntu
    dbservers:
      hosts:
        db1.example.com:
```

---

## 3. Playbooks

### Basic Structure
```yaml
---
- name: Configure webservers
  hosts: webservers
  become: yes
  
  vars:
    http_port: 80
  
  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
    
    - name: Start nginx
      service:
        name: nginx
        state: started
        enabled: yes
  
  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted
```

### Running Playbooks
```bash
ansible-playbook site.yml
ansible-playbook site.yml -i inventory/production
ansible-playbook site.yml --limit webservers
ansible-playbook site.yml --tags "config"
ansible-playbook site.yml --check --diff
```

---

## 4. Modules

### Common Modules
```yaml
# Package management
- apt:
    name: nginx
    state: present
    update_cache: yes

# File management
- copy:
    src: files/config.conf
    dest: /etc/app/config.conf
    mode: '0644'

- template:
    src: templates/config.j2
    dest: /etc/app/config.conf

- file:
    path: /var/log/app
    state: directory
    mode: '0755'

# Services
- service:
    name: nginx
    state: started
    enabled: yes

# Users
- user:
    name: appuser
    groups: sudo,docker
    shell: /bin/bash

# Commands
- command: /opt/app/setup.sh
  args:
    creates: /opt/app/.installed

- shell: |
    source venv/bin/activate
    pip install -r requirements.txt

# Git
- git:
    repo: https://github.com/org/repo.git
    dest: /opt/app
    version: main
```

---

## 5. Variables & Facts

### Variable Definition
```yaml
# In playbook
vars:
  app_name: myapp
  http_port: 80

# From files
vars_files:
  - vars/common.yml
  - vars/secrets.yml

# group_vars/webservers.yml
nginx_port: 80
app_root: /var/www
```

### Using Facts
```yaml
- debug:
    msg: "OS: {{ ansible_distribution }}"

- debug:
    msg: "IP: {{ ansible_default_ipv4.address }}"
```

### Registered Variables
```yaml
- command: cat /etc/version
  register: version_output

- debug:
    msg: "Version: {{ version_output.stdout }}"
```

---

## 6. Conditionals & Loops

### Conditionals
```yaml
- name: Install on Debian
  apt:
    name: nginx
  when: ansible_os_family == "Debian"

- name: Multiple conditions
  command: /opt/run.sh
  when:
    - ansible_distribution == "Ubuntu"
    - app_enabled | default(false)
```

### Loops
```yaml
- name: Install packages
  apt:
    name: "{{ item }}"
  loop:
    - nginx
    - python3
    - git

- name: Create users
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
  loop:
    - { name: alice, groups: sudo }
    - { name: bob, groups: docker }
```

### Error Handling
```yaml
- block:
    - name: Deploy app
      copy:
        src: app/
        dest: /opt/app/
  rescue:
    - name: Rollback
      command: /opt/rollback.sh
  always:
    - name: Cleanup
      file:
        path: /tmp/deploy
        state: absent
```

---

## 7. Roles

### Role Structure
```
roles/nginx/
├── defaults/main.yml
├── tasks/main.yml
├── handlers/main.yml
├── templates/
├── files/
└── meta/main.yml
```

### Using Roles
```yaml
- hosts: webservers
  roles:
    - common
    - role: nginx
      vars:
        nginx_port: 8080
    - role: app
      tags: [deploy]
```

### Ansible Galaxy
```bash
ansible-galaxy install geerlingguy.nginx
ansible-galaxy collection install community.docker
ansible-galaxy install -r requirements.yml
```

---

## 8. Ansible Vault

```bash
# Create encrypted file
ansible-vault create secrets.yml

# Encrypt existing file
ansible-vault encrypt vars/secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# Run with vault
ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

---

## 9. Best Practices

### Directory Structure
```
ansible/
├── ansible.cfg
├── inventory/
│   ├── production/
│   └── staging/
├── playbooks/
├── roles/
├── group_vars/
├── host_vars/
└── requirements.yml
```

### Quick Reference
```bash
# Execution
ansible-playbook site.yml
ansible-playbook site.yml --limit host1 --tags config

# Testing
ansible-playbook site.yml --check --diff
ansible-playbook site.yml --syntax-check

# Inventory
ansible-inventory --list
ansible-inventory --graph

# Ad-hoc
ansible all -m ping
ansible all -m setup -a "filter=ansible_os*"
```

---
*Continue to ArgoCD guide for GitOps.*
