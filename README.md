# Fuel Cell Systems FIFA League

A self-contained web application for recording FIFA matches, managing players, and tracking league standings.  
Everything runs locally inside a single Node/Express server — no external database required.

---

## Repository
https://github.com/Fuel-Cell-Systems-Ltd/FIFA_Leage

---

## Features
- Player registration with FIFA team selection  
- Match recording and automatic table updates  
- Real-time league standings  
- Match history viewer  
- Dark mode  
- Fully self-contained — data stored in a JSON file  
- Portable and easy to deploy on any Node-capable server  

---

## Technology Stack
**Frontend:** React + TypeScript + Tailwind + Vite  
**Backend:** Express.js  
**Data Storage:** `data.json` file (auto-created on first run)  
**Deployment Target:** AWS EC2 (Amazon Linux)

---

# **AWS Deployment Guide**

This application is designed to run as a single Express server on **port 3000**, serving both:

- The built React frontend  
- The backend API (`/api/...`)

## **Prerequisites**
- AWS EC2 t3.micro instance (Amazon Linux 2023 recommended)  
- Node.js 20+ (we use Node 22 with nvm)  
- Git installed  
- Port **3000** open in your EC2 Security Group  

---

# 1. Connect to your EC2 instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
````

---

# 2. Install Node.js via nvm (recommended)

```bash
cd ~
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

---

# 3. Clone the repository

```bash
git clone git@github.com:Fuel-Cell-Systems-Ltd/FIFA_Leage.git
cd FIFA_Leage
```

> ⚠️ If using SSH deploy keys, add them under `~/.ssh/` and register the public key as a *Deploy Key* in GitHub.

---

# 4. Install dependencies

```bash
npm install
```

---

# 5. Build the frontend

```bash
npm run build
```

This generates the production UI inside the `dist/` folder.

---

# 6. Start the server

```bash
npm start
```

This starts the Express server on **port 3000**, serving:

* React frontend (from `dist/`)
* API routes (`/api/standings`, `/api/matches`, ...)

---

# **Application URL**

```
http://your-instance-ip:3000
```

---

# **Run as a Service (Recommended)**

Using PM2 ensures the server restarts on boot and stays running in the background.

## Install PM2

```bash
sudo npm install -g pm2
```

## Start the app

```bash
pm2 start server.js --name fifa-league
```

## Save the process list

```bash
pm2 save
```

## Enable PM2 at boot

```bash
pm2 startup
```

To check logs:

```bash
pm2 logs fifa-league
```

To restart after a code pull:

```bash
pm2 restart fifa-league
```

---

# **AWS Security Group Rule**

Add inbound rule:

* **Type:** Custom TCP
* **Port:** 3000
* **Source:** 0.0.0.0/0 (or restrict to office IPs)

---

# **Data Storage**

All match and player data is stored in:

```
data.json
```

This file is created automatically and updated on every match submission.

To back it up:

```bash
cp data.json data-backup.json
```

---

# **Local Development Workflow**

Terminal 1 (backend):

```bash
npm start
```

Terminal 2 (frontend with hot reload):

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Run production server locally:

```bash
npm start
```

---

# **Deployment Updates (Git → EC2)**

On the EC2 instance:

```bash
cd ~/FIFA_Leage
git pull
npm install
npm run build
pm2 restart fifa-league
```

This updates both frontend and backend.

---

# **Summary**

This application is designed for simplicity:

* One Node server
* One JSON data file
* One port to expose
* Zero external dependencies
* Easy updates via `git pull + pm2 restart`

Perfect for small internal tournaments like the FCSL FIFA League.

Just say the word and I’ll extend the README.
```
