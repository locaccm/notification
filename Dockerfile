FROM node:20-alpine

# 1. Environment variable
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG AUTH_SERVICE_URL
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL}

ARG MAIL_HOST
ENV MAIL_HOST=${MAIL_HOST}

ARG MAIL_PORT
ENV MAIL_PORT=${MAIL_PORT}

ARG MAIL_USER
ENV MAIL_USER=${MAIL_USER}

ARG MAIL_PASS
ENV MAIL_PASS=${MAIL_PASS}

# 2. Set working directory
WORKDIR /app

# 3. Install git if needed — remove if not using it
RUN apk add --no-cache git

# 4. Copy dependency files
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy the rest of the app source code
COPY . .

# 7. Generate Prisma client
RUN npm run prisma:generate

# 8. Build the app
RUN npm run build

# 9. Expose port
EXPOSE 3000

# 10. Start the app
CMD ["npm", "start"]