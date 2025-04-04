CREATE DATABASE project1;
USE project1;
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Clothing', 'Books', 'Furniture', 'Electronics', 'Sports Gear') NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NULL,
    color VARCHAR(50) NULL,
    size VARCHAR(50) NULL,
    user_id INT NULL,
    weight DECIMAL(10,2) NULL,
    dimension VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
