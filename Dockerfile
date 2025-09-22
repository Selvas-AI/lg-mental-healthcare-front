# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# APK 파일 다운로드 (GitHub API 사용)
ARG GITHUB_TOKEN
RUN apk add --no-cache curl jq && \
    if [ -n "$GITHUB_TOKEN" ]; then \
        ASSET_ID=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
                   "https://api.github.com/repos/Selvas-AI/lg-mental-healthcare-front/releases/tags/v1.0.0-apk" \
                   | jq -r '.assets[] | select(.name=="app-onshim-20250922104100.apk") | .id') && \
        curl -L -H "Authorization: Bearer $GITHUB_TOKEN" \
             -H "Accept: application/octet-stream" \
             -o /app/dist/app-onshim-20250922104100.apk \
             "https://api.github.com/repos/Selvas-AI/lg-mental-healthcare-front/releases/assets/$ASSET_ID"; \
    else \
        curl -L -o /app/dist/app-onshim-20250922104100.apk \
             "https://github.com/Selvas-AI/lg-mental-healthcare-front/releases/download/v1.0.0-apk/app-onshim-20250922104100.apk"; \
    fi

# 실제 서비스 단계
FROM nginx:1.25
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
