# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# APK 파일 다운로드 (간단한 curl 방식)
ARG GITHUB_TOKEN
RUN apk add --no-cache curl && \
    echo "APK 파일 다운로드 시작..." && \
    curl -L \
         -H "Authorization: Bearer ${GITHUB_TOKEN}" \
         -o /app/dist/app-onshim-20250922104100.apk \
         "https://github.com/Selvas-AI/lg-mental-healthcare-front/releases/download/v1.0.0-apk/app-onshim-20250922104100.apk" && \
    echo "다운로드 완료. 파일 크기 확인:" && \
    ls -lh /app/dist/app-onshim-20250922104100.apk && \
    FILE_SIZE=$(stat -c%s /app/dist/app-onshim-20250922104100.apk) && \
    echo "파일 크기: $FILE_SIZE bytes" && \
    if [ "$FILE_SIZE" -lt 1000000 ]; then \
        echo "파일이 너무 작습니다. 다운로드 실패로 판단됩니다." && \
        cat /app/dist/app-onshim-20250922104100.apk && \
        exit 1; \
    fi

# 실제 서비스 단계
FROM nginx:1.25
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
