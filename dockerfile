# Usa la imagen oficial de Node.js
FROM node:20-alpine as builder


WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Servidor web ligero
FROM nginx:alpine
COPY --from=builder /app/dist/MeridianOps/browser /usr/share/nginx/html

# Copiamos un nginx.conf optimizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]