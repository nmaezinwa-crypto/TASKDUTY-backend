# TaskDuty Backend

REST API for the TaskDuty task management application built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- dotenv

## Getting Started

### Install dependencies
npm install

### Run development server
npm run dev

## API Endpoints
- GET    /api/tasks        - Get all tasks
- POST   /api/tasks        - Create a task
- PUT    /api/tasks/:id    - Update a task
- DELETE /api/tasks/:id    - Delete a task

## Environment Variables
Create a .env file with:
PORT=5000
MONGODB_URI=your_mongodb_connection_string