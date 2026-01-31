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

### What is Ansible?

Ansible is an open-source **configuration management and automation tool** developed by Red Hat. It uses a simple, human-readable language (YAML) to describe automation tasks, making it easy to learn and use. Ansible automates cloud provisioning, configuration management, application deployment, and many other IT needs.

**Key Characteristics:**
- **Agentless**: No software to install on managed nodes (uses SSH/WinRM)
- **Declarative**: Describe the desired state, not the steps to get there
- **Idempotent**: Running the same playbook multiple times produces the same result
- **Simple**: YAML-based syntax that's easy to read and write
- **Extensible**: Thousands of modules for every platform and use case

### Why Ansible Matters

In modern infrastructure, manually configuring servers is impractical:

**Manual Configuration Challenges:**
- Inconsistent environments ("snowflake servers")
- Time-consuming and error-prone
- No version control or audit trail
- Difficult to scale
- Knowledge trapped in individuals

**With Ansible:**
- **Infrastructure as Code**: Configuration is version-controlled
- **Consistency**: Every server configured identically
- **Speed**: Configure hundreds of servers in parallel
- **Repeatability**: Playbooks can be run anytime, anywhere
- **Self-Documenting**: YAML files describe the system state

### Ansible vs Other Configuration Management Tools

| Feature | Ansible | Puppet | Chef | SaltStack |
|---------|---------|--------|------|-----------|
| **Architecture** | Agentless (push) | Agent-based (pull) | Agent-based (pull) | Agent or agentless |
| **Language** | YAML | Ruby DSL | Ruby | YAML/Python |
| **Learning Curve** | Easy | Moderate | Steep | Moderate |
| **Speed** | Good | Good | Good | Very Fast |
| **State Management** | Implicit | Explicit | Explicit | Explicit |
| **Best For** | Simplicity, orchestration | Large enterprises | Developer teams | Large-scale environments |

### How Ansible Works

Ansible follows a simple workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                     ANSIBLE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               CONTROL NODE                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │   │
│  │  │ Playbook │  │ Inventory│  │      Ansible          │  │   │
│  │  │  (YAML)  │  │  (hosts) │  │   (executable)        │  │   │
│  │  └────┬─────┘  └────┬─────┘  └───────────┬───────────┘  │   │
│  │       │             │                    │               │   │
│  │       └─────────────┴────────────────────┘               │   │
│  │                          │                                │   │
│  └──────────────────────────┼────────────────────────────────┘   │
│                             │ SSH/WinRM (no agent required)      │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                     MANAGED NODES                            ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │   Server 1  │  │   Server 2  │  │   Server N  │          ││
│  │  │  (web)      │  │  (db)       │  │  (app)      │          ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘          ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Execution Flow:**
1. **Read Playbook**: Ansible reads tasks from YAML files
2. **Parse Inventory**: Identifies target hosts from inventory
3. **Connect via SSH**: Establishes secure connections (no agent needed)
4. **Execute Modules**: Runs Python modules on remote hosts
5. **Return Results**: Collects output and reports status

### Core Concepts

| Term | Description |
|------|-------------|
| **Control Node** | The machine where Ansible is installed and runs from |
| **Managed Nodes** | Target servers that Ansible configures |
| **Inventory** | List of managed nodes (static or dynamic) |
| **Playbook** | YAML file containing automation tasks in order |
| **Play** | Maps hosts to tasks in a playbook |
| **Task** | A single unit of work (calls a module) |
| **Module** | Reusable, standalone scripts that do the actual work |
| **Role** | A way to organize playbooks into reusable components |
| **Handler** | Tasks triggered by notifications from other tasks |
| **Facts** | Information gathered about managed nodes |

### Idempotency: A Key Concept

**Idempotency** means running a playbook multiple times produces the same result. This is fundamental to reliable infrastructure automation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Idempotency in Action                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  First Run:                    Second Run (same playbook):          │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ "Install nginx"         │  │ "Install nginx"                 │  │
│  │                         │  │                                 │  │
│  │ Current: not installed  │  │ Current: already installed      │  │
│  │ Desired: installed      │  │ Desired: installed              │  │
│  │ ─────────────────────── │  │ ───────────────────────────── │  │
│  │ Result: CHANGED         │  │ Result: OK (no action needed)   │  │
│  │ (nginx gets installed)  │  │ (nothing happens)               │  │
│  └─────────────────────────┘  └─────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Why Idempotency Matters

1. **Safe to re-run**: Accidentally running a playbook twice won't break anything
2. **Drift correction**: Running playbooks regularly enforces desired state
3. **Partial failure recovery**: If a run fails halfway, re-running fixes it
4. **Testing**: You can test playbooks repeatedly without side effects

```yaml
# This is idempotent - only installs if not present
- name: Install nginx
  apt:
    name: nginx
    state: present   # Desired state, not an action

# NOT idempotent - appends every time
- name: Add line to file (BAD)
  shell: echo "line" >> /etc/config

# Idempotent alternative
- name: Add line to file (GOOD)
  lineinfile:
    path: /etc/config
    line: "line"
    state: present
```

### Agentless Architecture Deep Dive

Unlike Puppet or Chef, Ansible doesn't require installing software on managed nodes:

```
┌─────────────────────────────────────────────────────────────────────┐
│              Agent-based vs Agentless Architecture                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  AGENT-BASED (Puppet/Chef):           AGENTLESS (Ansible):          │
│                                                                      │
│  ┌─────────┐    ┌───────────────┐    ┌─────────┐                   │
│  │ Master  │◀───│ Agent polls   │    │ Control │                   │
│  │ Server  │    │ for updates   │    │  Node   │                   │
│  └─────────┘    └───────────────┘    └────┬────┘                   │
│       │               │                    │                         │
│       ▼               ▼                    │ SSH/WinRM (push)       │
│  ┌─────────┐    ┌─────────┐              ▼                         │
│  │ Agent   │    │ Agent   │         ┌─────────┐                    │
│  │(always) │    │(always) │         │ Python  │◀─ runs temporarily │
│  └─────────┘    └─────────┘         │ modules │   then exits       │
│                                      └─────────┘                    │
│                                                                      │
│  Pros: Real-time, pull-based         Pros: No agent to maintain,   │
│  Cons: Agent maintenance, ports      simple, secure (SSH only)     │
└─────────────────────────────────────────────────────────────────────┘
```

#### How Ansible Executes Without an Agent

1. **SSH Connection**: Ansible connects via standard SSH (already on most systems)
2. **Module Transfer**: Copies Python module to target (usually to `/tmp`)
3. **Execute**: Runs the module with provided arguments
4. **Cleanup**: Removes the module file
5. **Return**: Reports results back to control node

This means:
- **No daemon process** running on managed nodes
- **No agent updates** to worry about
- **Minimal footprint** - only requires Python and SSH
- **Works through bastion hosts** - just standard SSH

### Playbook Execution Flow

Understanding how Ansible processes a playbook helps write better automation:

```
┌────────────────────────────────────────────────────────────────────┐
│                    Playbook Execution Order                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. VARIABLE LOADING                                               │
│     └──▶ Load vars from inventory, group_vars, host_vars           │
│                                                                     │
│  2. FACT GATHERING (if enabled)                                    │
│     └──▶ Run 'setup' module to collect system info                 │
│                                                                     │
│  3. PRE_TASKS                                                      │
│     └──▶ Run tasks before roles                                    │
│                                                                     │
│  4. ROLES                                                          │
│     └──▶ Execute roles in order listed                             │
│                                                                     │
│  5. TASKS                                                          │
│     └──▶ Run main task list                                        │
│                                                                     │
│  6. POST_TASKS                                                     │
│     └──▶ Run tasks after main tasks                                │
│                                                                     │
│  7. HANDLERS                                                       │
│     └──▶ Run notified handlers (once each, at end)                 │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Installation

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update
sudo apt install ansible

# Using pip (any platform)
pip install ansible

# Verify
ansible --version
```

### Ad-hoc Commands

Quick one-time tasks without writing a playbook:

```bash
# Ping all hosts
ansible all -m ping

# Run command on webservers
ansible webservers -m command -a "uptime"

# Install package with sudo
ansible all -m apt -a "name=nginx state=present" --become

# Copy file
ansible all -m copy -a "src=file.txt dest=/tmp/file.txt"

# Gather facts
ansible all -m setup -a "filter=ansible_os_family"
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

### Understanding Playbooks

A playbook is Ansible's configuration, deployment, and orchestration language. Think of it as a recipe that describes the desired state of your systems and the steps to achieve it.

**Playbook Execution Model:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  PLAYBOOK EXECUTION FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PLAYBOOK (site.yml)                                      │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ PLAY 1: Configure webservers                    │    │    │
│  │  │   hosts: webservers                              │    │    │
│  │  │                                                  │    │    │
│  │  │   ┌─────────────────────────────────────────┐   │    │    │
│  │  │   │ Gather Facts (implicit)                 │   │    │    │
│  │  │   └─────────────────────────────────────────┘   │    │    │
│  │  │              ▼                                   │    │    │
│  │  │   ┌─────────────────────────────────────────┐   │    │    │
│  │  │   │ Task 1: Install nginx                   │───┼───▶│ All hosts in parallel │
│  │  │   └─────────────────────────────────────────┘   │    │    │
│  │  │              ▼                                   │    │    │
│  │  │   ┌─────────────────────────────────────────┐   │    │    │
│  │  │   │ Task 2: Configure nginx                 │   │    │    │
│  │  │   │         notify: Restart nginx           │   │    │    │
│  │  │   └─────────────────────────────────────────┘   │    │    │
│  │  │              ▼                                   │    │    │
│  │  │   ┌─────────────────────────────────────────┐   │    │    │
│  │  │   │ HANDLERS: Restart nginx (if notified)  │   │    │    │
│  │  │   └─────────────────────────────────────────┘   │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                       ▼                                  │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ PLAY 2: Configure databases                     │    │    │
│  │  │   hosts: dbservers                               │    │    │
│  │  │   ...                                            │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Playbook Concepts:**

| Concept | Description |
|---------|-------------|
| **Play** | Maps a group of hosts to a set of tasks. A playbook contains one or more plays. |
| **Task** | A single action (module call) to be executed. Tasks run in order, one at a time. |
| **Handler** | Special tasks that only run when notified by other tasks. Run at end of play. |
| **Variables** | Data that can be used to customize task behavior. Multiple sources with precedence. |
| **Facts** | Information about target systems, gathered automatically at start of each play. |

**Execution Behavior:**

| Aspect | Behavior |
|--------|----------|
| **Play Order** | Plays run sequentially, in the order defined in the playbook |
| **Task Order** | Tasks within a play run sequentially, top to bottom |
| **Host Parallelism** | By default, tasks run on multiple hosts in parallel (controlled by `forks`) |
| **Failure Handling** | By default, failure on any host removes it from subsequent tasks |
| **Handler Execution** | Handlers run once at the end of the play, regardless of how many times notified |

### Basic Structure

This example shows a complete Ansible playbook with detailed explanations:

```yaml
# ============================================================
# ANSIBLE PLAYBOOK
# ============================================================
# A playbook is a YAML file containing one or more "plays".
# Each play maps a group of hosts to tasks to execute.
#
# The '---' marks the start of a YAML document.
# It's optional but conventional for playbooks.
# ============================================================
---
# --------------------------------------------------------
# PLAY: Configure webservers
# --------------------------------------------------------
# This is a single "play" - it runs tasks on a group of hosts.
# You can have multiple plays in one playbook, each targeting
# different hosts with different tasks.
- name: Configure webservers    # Descriptive name, shown in output
  
  # HOSTS
  # --------------------------------------------------------
  # Which machines to run on. Must match your inventory file.
  # Can be: 'all', 'webservers', 'db[0:5]', '!excluded_group'
  hosts: webservers
  
  # BECOME (privilege escalation)
  # --------------------------------------------------------
  # Run tasks as root (sudo). Required for installing packages,
  # managing services, etc. on most systems.
  become: yes
  # Alternative become options:
  #   become_user: root     # Which user to become
  #   become_method: sudo   # How to escalate (sudo, su, pbrun)
  
  # VARIABLES
  # --------------------------------------------------------
  # Define values to use throughout this play.
  # These have higher precedence than defaults but lower
  # than extra vars (--extra-vars on command line).
  vars:
    http_port: 80
  
  # TASKS
  # --------------------------------------------------------
  # The list of actions to perform, in order.
  # Each task calls a module with specific parameters.
  # Tasks run sequentially, but across hosts in parallel.
  tasks:
    # Task 1: Install nginx package
    # ----------------------------------------------------
    # - 'name': Description shown in output
    # - 'apt': The Ansible module to use (package manager for Debian)
    # - Parameters are module-specific:
    #   - 'name': Package name to install
    #   - 'state: present': Ensure package is installed
    #                       (use 'absent' to remove)
    - name: Install nginx
      apt:
        name: nginx
        state: present
    
    # Task 2: Ensure nginx is running
    # ----------------------------------------------------
    # 'service' module manages system services.
    # - 'state: started': Ensure service is running now
    # - 'enabled: yes': Start service on boot
    #
    # TIP: Add 'notify' to trigger handlers when a task
    # makes a change. See handlers section below.
    - name: Start nginx
      service:
        name: nginx
        state: started
        enabled: yes
  
  # HANDLERS
  # --------------------------------------------------------
  # Special tasks that ONLY run when "notified" by other tasks.
  # Used for actions that should run once, at the end,
  # regardless of how many tasks triggered them.
  #
  # Example use case: Reload nginx once after multiple config changes.
  #
  # To use: Add 'notify: Restart nginx' to any task.
  handlers:
    - name: Restart nginx       # Name must match the 'notify' directive
      service:
        name: nginx
        state: restarted        # Could also be 'reloaded' for config changes
```

**Playbook Keywords Explained:**

| Keyword | Purpose | Example |
|---------|---------|---------|
| `name` | Human-readable description for output | `name: Configure web servers` |
| `hosts` | Target hosts from inventory | `hosts: webservers` or `hosts: all` |
| `become` | Enable privilege escalation (sudo) | `become: yes` |
| `vars` | Define variables for this play | `vars: { http_port: 80 }` |
| `tasks` | List of tasks to execute | See structure above |
| `handlers` | Tasks triggered by notify | Restart services after config change |
| `gather_facts` | Collect system information | `gather_facts: no` to disable |
| `serial` | Rolling update batch size | `serial: 2` for 2 hosts at a time |

### Running Playbooks

```bash
# Basic execution
ansible-playbook site.yml

# Specify inventory
ansible-playbook site.yml -i inventory/production

# Limit to specific hosts
ansible-playbook site.yml --limit webservers

# Run only specific tags
ansible-playbook site.yml --tags "config"

# Dry run (check mode) with diff
ansible-playbook site.yml --check --diff
```

**Execution Options Explained:**

| Option | Purpose | Use Case |
|--------|---------|----------|
| `--check` | Dry run, don't make changes | Testing before applying |
| `--diff` | Show file changes | Review what will be modified |
| `--limit <pattern>` | Restrict to hosts matching pattern | Target specific servers |
| `--tags <tags>` | Only run tagged tasks | Partial deployments |
| `--skip-tags <tags>` | Skip tagged tasks | Exclude certain steps |
| `-v`, `-vv`, `-vvv` | Increase verbosity | Debugging failures |
| `--step` | Confirm each task | Interactive execution |
| `--start-at-task` | Start at specific task | Resume failed runs |

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

### Understanding Ansible Roles

Roles are **self-contained, reusable units of automation**. They package tasks, handlers, variables, templates, and files together in a standardized structure. Think of roles as the building blocks of your infrastructure automation.

**Why Use Roles?**

| Without Roles | With Roles |
|---------------|------------|
| Long, monolithic playbooks | Modular, organized code |
| Copy-paste code between projects | Reusable components |
| Hard to test individual components | Isolated, testable units |
| Inconsistent configurations | Standardized patterns |
| Difficult collaboration | Clear responsibilities |

**Role Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE STRUCTURE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  roles/nginx/                                                    │
│  │                                                               │
│  ├── defaults/main.yml    ← Default variables (lowest priority) │
│  │                          Can be overridden by user            │
│  │                                                               │
│  ├── vars/main.yml        ← Variables (higher priority)         │
│  │                          Internal role variables              │
│  │                                                               │
│  ├── tasks/main.yml       ← Main task list                      │
│  │                          What the role actually does          │
│  │                                                               │
│  ├── handlers/main.yml    ← Handlers (service restarts, etc.)   │
│  │                          Triggered by notify                  │
│  │                                                               │
│  ├── templates/           ← Jinja2 templates                    │
│  │   └── nginx.conf.j2      Dynamically generated configs       │
│  │                                                               │
│  ├── files/               ← Static files                        │
│  │   └── index.html         Copied as-is to target              │
│  │                                                               │
│  ├── meta/main.yml        ← Role metadata and dependencies      │
│  │                          Specifies role dependencies          │
│  │                                                               │
│  └── README.md            ← Documentation                       │
│                             How to use this role                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Role Execution Order:**

When Ansible runs a role, it processes directories in this order:
1. `meta/` - Load dependencies first
2. `vars/` - Load role variables
3. `defaults/` - Load default variables
4. `tasks/` - Run the tasks
5. Handlers are queued and run at end of play

**Where to Find Roles:**

| Source | Description |
|--------|-------------|
| **Ansible Galaxy** | Community roles repository (`ansible-galaxy install nginx`) |
| **Private roles** | Your organization's internal roles in Git |
| **Collections** | Curated bundles of roles and modules |

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
