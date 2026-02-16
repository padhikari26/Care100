FROM node:18

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Explicitly set module type
ENV NODE_OPTIONS="--experimental-modules"

# Start command
CMD ["node", "--experimental-modules", "src/app.js"]