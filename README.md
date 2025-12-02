# Fuel Cell Systems FIFA League

A self-contained web application for tracking FIFA game matches and league standings.

## Repository
https://github.com/Fuel-Cell-Systems-Ltd/FIFA_Leage

## Features
- Player registration with FIFA team selection
- Match recording
- Real-time league standings
- Match history
- Dark mode support
- Fully self-contained (no external database required)

## Technology
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js
- Data Storage: JSON file (simple and portable)

## AWS Deployment Instructions

### Prerequisites
- AWS EC2 t3.micro instance
- Node.js 18+ installed
- Git installed

### Deployment Steps

1. **Connect to your AWS instance:**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js (if not already installed):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

3. **Clone the repository:**
```bash
git clone https://github.com/Fuel-Cell-Systems-Ltd/FIFA_Leage.git
cd FIFA_Leage
```

4. **Install dependencies:**
```bash
npm install
```

5. **Build the frontend:**
```bash
npm run build
```

6. **Start the server:**
```bash
npm start
```

The application will run on port 3000 by default.

### Running as a Service (Optional)

To keep the application running permanently, use PM2:

```bash
# Install PM2
sudo npm install -g pm2

# Start the application
pm2 start server.js --name fifa-league

# Save the PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Accessing the Application

Once running, access the application at:
- `http://your-instance-ip:3000`

### Firewall Configuration

Make sure port 3000 is open in your AWS Security Group:
1. Go to EC2 Dashboard
2. Security Groups
3. Edit inbound rules
4. Add rule: Custom TCP, Port 3000, Source: 0.0.0.0/0

## Data Storage

All data is stored in `data.json` file in the project root. This file is automatically created when the server starts. To backup your data, simply copy this file.

## Local Development

```bash
# Install dependencies
npm install

# Start the API in one terminal (port 3000)
npm start

# In another terminal, start the Vite dev server (frontend, port 5173 with API proxy)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
