# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

# 安装编译依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev \
    git \
    openssh-client && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --production

# 复制源码
COPY . .

# 构建应用
RUN npm run build && \
    npm prune --production

# ==================== 生产阶段 ====================
FROM nginx:1.25-alpine

# 安装运行时依赖
RUN apk add --no-cache sqlite && \
    addgroup -S appuser && \
    adduser -S appuser -G appuser && \
    chown -R appuser:appuser /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# 复制构建产物
COPY --from=builder --chown=appuser:appuser /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY --chown=appuser:appuser nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health-check || exit 1

# 容器元数据
LABEL org.opencontainers.image.title="Todo App" \
      org.opencontainers.image.description="Modern Todo Application" \
      org.opencontainers.image.url="https://github.com/your-repo" \
      org.opencontainers.image.source="https://github.com/your-repo" \
      org.opencontainers.image.licenses="MIT"

# 运行配置
EXPOSE 8080
USER appuser
CMD ["nginx", "-g", "daemon off;"]