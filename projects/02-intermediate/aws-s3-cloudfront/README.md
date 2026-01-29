# 🪣 AWS S3 & CloudFront

Master AWS storage and CDN services.

## 🎯 Learning Objectives
- Create and manage S3 buckets
- Configure bucket policies
- Set up CloudFront CDN
- Implement static website hosting

---

## Lab 1: S3 Bucket Basics

### Create Bucket (CLI)
```bash
# Create bucket
aws s3 mb s3://my-unique-bucket-name

# List buckets
aws s3 ls

# Upload files
aws s3 cp file.txt s3://my-bucket/
aws s3 cp folder/ s3://my-bucket/folder/ --recursive

# Download
aws s3 cp s3://my-bucket/file.txt ./

# Sync directories
aws s3 sync ./local-folder s3://my-bucket/remote-folder
aws s3 sync s3://my-bucket/folder ./local --delete

# Delete
aws s3 rm s3://my-bucket/file.txt
aws s3 rm s3://my-bucket/folder/ --recursive
```

### Terraform
```hcl
resource "aws_s3_bucket" "website" {
  bucket = "my-website-bucket"
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}
```

---

## Lab 2: Bucket Policies

### Public Read Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/*"
        }
    ]
}
```

### Restrict by IP
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowFromVPN",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ],
            "Condition": {
                "IpAddress": {
                    "aws:SourceIp": ["10.0.0.0/8", "192.168.1.0/24"]
                }
            }
        }
    ]
}
```

---

## Lab 3: CloudFront CDN

### Terraform Configuration
```hcl
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_identity" "website" {
  comment = "OAI for website"
}
```

---

## Lab 4: Static Website

### Deploy Script
```bash
#!/bin/bash
BUCKET="my-website-bucket"
DISTRIBUTION_ID="E1234567890"

# Build site
npm run build

# Upload to S3
aws s3 sync ./dist s3://$BUCKET --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"

echo "Deployed successfully!"
```

---

## ✅ Completion Checklist
- [ ] Created S3 bucket
- [ ] Configured bucket policies
- [ ] Set up CloudFront distribution
- [ ] Deployed static website
- [ ] Implemented cache invalidation
