FROM node:18

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
