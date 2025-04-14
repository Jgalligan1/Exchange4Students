# Bash Script for Running Preliminary Code
#!/bin/bash
echo "Initializing the MySQL database..."

"C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p project1 < MySQLLocal.session.sql
if [ $? -ne 0 ]; then
    echo "Error: MySQL script failed. Please check your SQL file and credentials."
    exit 1
fi

echo "Database initialization complete."
echo "Starting Node.js server on port 3000..."
node server.js
