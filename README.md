## Production notes (important)

### Runtime data files (NOT in Git)
The live tournament state is stored locally on the EC2 instance:

- `data.json`
- `matches.json`

These files are **runtime data** and must not be tracked in Git, otherwise deploys will overwrite your live results.

They should be present on the EC2 instance in the repo directory (`~/FIFA_Leage/`) and are backed up automatically by the deploy script.

---

## Run as a Service (Recommended: systemd)

This project runs as a systemd service so it stays up after you disconnect and restarts automatically after reboot.

Create `/etc/systemd/system/fifa-league.service`:

```ini
[Unit]
Description=FIFA League Node server
After=network.target

[Service]
WorkingDirectory=/home/ec2-user/FIFA_Leage
Environment=NODE_ENV=production
ExecStart=/home/ec2-user/.nvm/versions/node/v22.21.1/bin/node server.js
Restart=always
RestartSec=5
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
````

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fifa-league
sudo systemctl start fifa-league
sudo systemctl status fifa-league --no-pager
```

---

## Nginx (port 80 -> app on 3000)

The app runs on port `3000`. Nginx listens on port `80` and reverse-proxies to `127.0.0.1:3000`.

Ensure your security group allows inbound **HTTP 80**.

---

## Deploy updates (GitHub -> EC2) using `deploy.sh`

On the EC2 instance:

```bash
cd ~/FIFA_Leage
./deploy.sh
```

What it does:

1. Backs up `data.json` + `matches.json` to `~/fifa-backups/`
2. `git pull --ff-only`
3. `npm install` + `npm run build`
4. Restores data from latest backup if missing
5. Restarts `fifa-league`
6. Verifies `http://localhost` returns `200`

---

## Backups

Backups are stored on the EC2 instance under:

```
~/fifa-backups/
```

Example filenames:

* `data.json.1764696634`
* `matches.json.1764696634`

To restore a specific backup manually:

```bash
cd ~/FIFA_Leage
cp ~/fifa-backups/data.json.<timestamp> data.json
cp ~/fifa-backups/matches.json.<timestamp> matches.json
sudo systemctl restart fifa-league