FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm i --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
CMD ["npm","run","start"]

