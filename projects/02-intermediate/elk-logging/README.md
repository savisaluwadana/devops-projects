# 🔍 ELK Stack Logging

Implement centralized logging with Elasticsearch, Logstash, and Kibana.

## 🎯 Learning Objectives
- Deploy ELK stack
- Configure log shipping
- Create Kibana dashboards
- Set up alerting

---

## Lab 1: Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.10.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: elastic/filebeat:8.10.0
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/log:/var/log:ro
    depends_on:
      - logstash

volumes:
  esdata:
```

---

## Lab 2: Logstash Pipeline

```ruby
# logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
  }
  
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "nginx" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
    geoip {
      source => "clientip"
    }
  }
  
  if [type] == "app" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][beat]}-%{+YYYY.MM.dd}"
  }
}
```

---

## Lab 3: Filebeat Config

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/*.log
    fields:
      type: nginx
    
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/*.log
    fields:
      type: app
    json.keys_under_root: true

output.logstash:
  hosts: ["logstash:5044"]

processors:
  - add_host_metadata: ~
  - add_docker_metadata: ~
```

---

## Lab 4: Kibana Dashboards

### Create Index Pattern
1. Go to Kibana → Stack Management → Index Patterns
2. Create pattern: `filebeat-*`
3. Select `@timestamp` as time field

### Sample Queries
```
# Error logs
level:error

# Specific service
service.name:api AND level:error

# Time range
@timestamp:[now-1h TO now]

# Response codes
response:>=400 AND response:<500
```

---

## ✅ Completion Checklist
- [ ] Deployed ELK stack
- [ ] Configured Logstash pipeline
- [ ] Set up Filebeat shipping
- [ ] Created Kibana dashboards
- [ ] Implemented log search
