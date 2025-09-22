# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# APK 파일 다운로드 (GitHub Releases에서 - 인증 포함)
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
        wget --header="Authorization: token $GITHUB_TOKEN" \
             -O /app/dist/app-onshim-20250922104100.apk \
             "https://github.com/Selvas-AI/lg-mental-healthcare-front/releases/download/v1.0.0-apk/app-onshim-20250922104100.apk"; \
    else \
        wget -O /app/dist/app-onshim-20250922104100.apk \
             "https://github.com/Selvas-AI/lg-mental-healthcare-front/releases/download/v1.0.0-apk/app-onshim-20250922104100.apk"; \
    fi

# 실제 서비스 단계
FROM nginx:1.25
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
