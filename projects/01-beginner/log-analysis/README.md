# 📊 Log Analysis with Linux Tools

Master log analysis using grep, awk, sed, and other essential Linux text processing tools.

## 🎯 Learning Objectives

- Parse and filter logs efficiently with grep
- Transform data with awk and sed
- Build log analysis pipelines
- Create monitoring scripts
- Generate reports from log data

## 📋 Prerequisites

- Basic Linux command line
- Understanding of file systems
- Text editor (vim/nano)

## 🏗️ Project Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOG ANALYSIS PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Log Sources          Processing           Output               │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐          │
│  │ /var/log │──┐     │  grep    │        │ Reports  │          │
│  │ messages │  │     │  awk     │───────▶│ Alerts   │          │
│  ├──────────┤  ├────▶│  sed     │        │ Metrics  │          │
│  │ nginx    │  │     │  sort    │        └──────────┘          │
│  │ access   │──┘     │  uniq    │                               │
│  └──────────┘        └──────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Generate Sample Logs

First, create sample log files to work with:

```bash
# Create project directory
mkdir -p ~/log-analysis && cd ~/log-analysis

# Generate sample web server access logs
cat << 'EOF' > access.log
192.168.1.100 - - [15/Jan/2024:10:15:32 +0000] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
192.168.1.101 - - [15/Jan/2024:10:15:33 +0000] "POST /api/login HTTP/1.1" 200 567 "-" "curl/7.68.0"
192.168.1.102 - - [15/Jan/2024:10:15:34 +0000] "GET /api/products HTTP/1.1" 500 89 "-" "Mozilla/5.0"
10.0.0.50 - - [15/Jan/2024:10:15:35 +0000] "GET /admin HTTP/1.1" 403 45 "-" "python-requests/2.25"
192.168.1.100 - - [15/Jan/2024:10:15:36 +0000] "GET /api/users/1 HTTP/1.1" 200 234 "-" "Mozilla/5.0"
192.168.1.103 - - [15/Jan/2024:10:15:37 +0000] "DELETE /api/users/5 HTTP/1.1" 401 23 "-" "curl/7.68.0"
10.0.0.51 - - [15/Jan/2024:10:15:38 +0000] "GET /api/products HTTP/1.1" 200 5678 "-" "Mozilla/5.0"
192.168.1.102 - - [15/Jan/2024:10:15:39 +0000] "POST /api/orders HTTP/1.1" 201 890 "-" "Mozilla/5.0"
192.168.1.104 - - [15/Jan/2024:10:15:40 +0000] "GET /health HTTP/1.1" 200 15 "-" "kube-probe/1.25"
10.0.0.50 - - [15/Jan/2024:10:15:41 +0000] "GET /api/admin/users HTTP/1.1" 403 45 "-" "python-requests/2.25"
EOF

# Generate sample application logs
cat << 'EOF' > app.log
2024-01-15 10:15:32 INFO  [main] Application started successfully
2024-01-15 10:15:33 DEBUG [http-thread-1] Processing request: GET /api/users
2024-01-15 10:15:34 ERROR [http-thread-2] Database connection failed: timeout after 30s
2024-01-15 10:15:35 WARN  [scheduler] High memory usage detected: 85%
2024-01-15 10:15:36 INFO  [http-thread-1] User authenticated: user123
2024-01-15 10:15:37 ERROR [http-thread-3] NullPointerException at UserService.java:45
2024-01-15 10:15:38 INFO  [http-thread-2] Order created: ORDER-12345
2024-01-15 10:15:39 DEBUG [cache] Cache hit for key: products_list
2024-01-15 10:15:40 ERROR [http-thread-1] Connection refused: payment-service:8080
2024-01-15 10:15:41 WARN  [scheduler] CPU usage spike: 92%
EOF

echo "Sample logs created!"
```

### Lab 2: grep Fundamentals

```bash
# Basic pattern matching
grep "ERROR" app.log                    # Find all errors
grep -i "error" app.log                 # Case insensitive
grep -v "DEBUG" app.log                 # Exclude DEBUG lines
grep -c "ERROR" app.log                 # Count matches

# Regular expressions
grep -E "ERROR|WARN" app.log            # Multiple patterns (extended regex)
grep "^2024-01-15 10:15:3" app.log      # Lines starting with pattern
grep "200$" access.log                  # Lines ending with 200 (won't work - need field)

# Context around matches  
grep -B 2 "ERROR" app.log               # 2 lines before each match
grep -A 2 "ERROR" app.log               # 2 lines after each match
grep -C 2 "ERROR" app.log               # 2 lines before and after

# File operations
grep -l "ERROR" *.log                   # List files containing pattern
grep -r "ERROR" /var/log/ 2>/dev/null   # Recursive search
grep -n "ERROR" app.log                 # Show line numbers
```

### Lab 3: awk for Data Extraction

```bash
# Field extraction (access.log fields: $1=IP, $7=URL, $9=status, $10=bytes)
awk '{print $1}' access.log                     # Extract IP addresses
awk '{print $1, $9}' access.log                 # IP and status code
awk '{print $7, $9}' access.log                 # URL and status

# Filtering with conditions
awk '$9 == 500' access.log                      # Only 500 errors
awk '$9 >= 400' access.log                      # All error responses
awk '$10 > 1000' access.log                     # Large responses

# Calculations
awk '{sum += $10} END {print "Total bytes:", sum}' access.log
awk '{sum += $10; count++} END {print "Avg:", sum/count}' access.log

# Pattern matching in awk
awk '/ERROR/ {print $0}' app.log                # Lines containing ERROR
awk '/api/ && $9 == 200' access.log             # API requests with 200

# Multiple actions
awk '
    $9 == 200 {success++}
    $9 >= 400 {errors++}
    END {
        print "Success:", success
        print "Errors:", errors
        print "Error rate:", errors/(success+errors)*100 "%"
    }
' access.log
```

### Lab 4: sed for Text Transformation

```bash
# Basic substitution
sed 's/ERROR/🔴 ERROR/g' app.log               # Replace text
sed 's/INFO/🟢 INFO/g' app.log                 # Color-code log levels

# In-place editing (use with caution!)
sed -i.bak 's/old/new/g' file.log              # Edit file, keep backup

# Delete lines
sed '/DEBUG/d' app.log                          # Remove DEBUG lines
sed '1,3d' app.log                              # Remove first 3 lines

# Address ranges
sed -n '5,10p' app.log                          # Print lines 5-10
sed -n '/ERROR/p' app.log                       # Print only ERROR lines

# Multiple commands
sed -e 's/ERROR/🔴 ERROR/g' -e 's/WARN/🟡 WARN/g' -e 's/INFO/🟢 INFO/g' app.log

# Advanced: Extract timestamps
sed 's/\([0-9-]* [0-9:]*\).*/\1/' app.log       # Extract datetime only
```

### Lab 5: Building Analysis Pipelines

```bash
# Top 5 IP addresses by request count
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -5

# HTTP status code distribution
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Find all unique error messages
grep "ERROR" app.log | awk '{$1=$2=$3=""; print $0}' | sort | uniq

# Requests per second analysis
awk '{print $4}' access.log | cut -d: -f1-3 | uniq -c

# Top requested URLs
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# Failed authentication attempts
grep -E "(401|403)" access.log | awk '{print $1}' | sort | uniq -c | sort -rn

# Memory/CPU warnings over time
grep -E "(memory|CPU)" app.log | awk '{print $1, $2, $NF}'
```

## 📝 Project: Log Monitoring Dashboard Script

Create a comprehensive log analysis script:

```bash
#!/bin/bash
# log_analyzer.sh - Comprehensive log analysis tool

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ACCESS_LOG="${1:-access.log}"
APP_LOG="${2:-app.log}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              📊 LOG ANALYSIS DASHBOARD                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Access Log Analysis
if [[ -f "$ACCESS_LOG" ]]; then
    echo -e "${GREEN}━━━ ACCESS LOG ANALYSIS ━━━${NC}"
    
    total_requests=$(wc -l < "$ACCESS_LOG")
    echo -e "Total Requests: ${YELLOW}$total_requests${NC}"
    
    echo -e "\n${BLUE}HTTP Status Distribution:${NC}"
    awk '{print $9}' "$ACCESS_LOG" | sort | uniq -c | sort -rn | while read count status; do
        if [[ $status -ge 500 ]]; then
            echo -e "  ${RED}$status${NC}: $count"
        elif [[ $status -ge 400 ]]; then
            echo -e "  ${YELLOW}$status${NC}: $count"
        else
            echo -e "  ${GREEN}$status${NC}: $count"
        fi
    done
    
    echo -e "\n${BLUE}Top 5 Client IPs:${NC}"
    awk '{print $1}' "$ACCESS_LOG" | sort | uniq -c | sort -rn | head -5 | while read count ip; do
        echo -e "  $ip: $count requests"
    done
    
    echo -e "\n${BLUE}Top 5 Requested Endpoints:${NC}"
    awk '{print $7}' "$ACCESS_LOG" | sort | uniq -c | sort -rn | head -5 | while read count url; do
        echo -e "  $url: $count"
    done
    
    # Calculate error rate
    errors=$(awk '$9 >= 400' "$ACCESS_LOG" | wc -l)
    error_rate=$(echo "scale=2; $errors * 100 / $total_requests" | bc)
    echo -e "\n${BLUE}Error Rate:${NC} ${YELLOW}$error_rate%${NC}"
fi

echo ""

# Application Log Analysis
if [[ -f "$APP_LOG" ]]; then
    echo -e "${GREEN}━━━ APPLICATION LOG ANALYSIS ━━━${NC}"
    
    echo -e "\n${BLUE}Log Level Distribution:${NC}"
    awk '{print $3}' "$APP_LOG" | sort | uniq -c | sort -rn | while read count level; do
        case $level in
            ERROR) echo -e "  ${RED}$level${NC}: $count" ;;
            WARN)  echo -e "  ${YELLOW}$level${NC}: $count" ;;
            INFO)  echo -e "  ${GREEN}$level${NC}: $count" ;;
            DEBUG) echo -e "  ${BLUE}$level${NC}: $count" ;;
            *)     echo -e "  $level: $count" ;;
        esac
    done
    
    error_count=$(grep -c "ERROR" "$APP_LOG")
    warn_count=$(grep -c "WARN" "$APP_LOG")
    
    if [[ $error_count -gt 0 ]]; then
        echo -e "\n${RED}⚠️  ERRORS DETECTED ($error_count):${NC}"
        grep "ERROR" "$APP_LOG" | head -5 | while read line; do
            echo -e "  ${RED}•${NC} $line"
        done
    fi
    
    if [[ $warn_count -gt 0 ]]; then
        echo -e "\n${YELLOW}⚡ WARNINGS ($warn_count):${NC}"
        grep "WARN" "$APP_LOG" | head -3 | while read line; do
            echo -e "  ${YELLOW}•${NC} $line"
        done
    fi
fi

echo ""
echo -e "${BLUE}━━━ Analysis Complete ━━━${NC}"
echo -e "Generated at: $(date)"
```

Save and run:
```bash
chmod +x log_analyzer.sh
./log_analyzer.sh access.log app.log
```

## 🔧 Quick Reference

### grep Cheat Sheet
| Command | Description |
|---------|-------------|
| `grep pattern file` | Basic search |
| `grep -i pattern file` | Case insensitive |
| `grep -v pattern file` | Invert match |
| `grep -c pattern file` | Count matches |
| `grep -n pattern file` | Show line numbers |
| `grep -E 'p1\|p2' file` | Multiple patterns |
| `grep -r pattern dir/` | Recursive search |

### awk Cheat Sheet
| Command | Description |
|---------|-------------|
| `awk '{print $1}' file` | Print first field |
| `awk '$3 > 100' file` | Conditional filter |
| `awk '/pattern/' file` | Pattern match |
| `awk -F: '{print $1}' file` | Custom delimiter |
| `awk 'NR==5' file` | Specific line number |
| `awk 'END {print NR}' file` | Count lines |

### sed Cheat Sheet
| Command | Description |
|---------|-------------|
| `sed 's/old/new/' file` | Replace first occurrence |
| `sed 's/old/new/g' file` | Replace all |
| `sed -n '5,10p' file` | Print lines 5-10 |
| `sed '/pattern/d' file` | Delete matching lines |
| `sed -i 's/old/new/g' file` | In-place edit |

## ✅ Completion Checklist

- [ ] Create and understand sample log formats
- [ ] Master grep for pattern matching
- [ ] Use awk for field extraction and calculations
- [ ] Apply sed for text transformations
- [ ] Build analysis pipelines with pipes
- [ ] Create log monitoring script
- [ ] Analyze real system logs (/var/log/)

## 📚 Resources

- [GNU Grep Manual](https://www.gnu.org/software/grep/manual/)
- [AWK Tutorial](https://www.grymoire.com/Unix/Awk.html)
- [Sed Tutorial](https://www.grymoire.com/Unix/Sed.html)

---

**Next Project:** [Cron Automation](../cron-automation/)
