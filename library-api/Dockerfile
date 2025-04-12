# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Ensure node_modules is not copied from the host
COPY package.json package-lock.json ./
RUN npm install

# Rebuild native modules for the container's architecture
RUN npm rebuild sqlite3

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV RUNNING_IN_DOCKER=true

# Command to run the application
CMD ["node", "dist/index.js"]