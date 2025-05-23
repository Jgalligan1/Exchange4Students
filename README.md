# Exchange4Students

Exchange4Students is a campus item exchange platform for Stevens students. The application allows students to post items for sale, search and add items to their cart, and complete an order—all while enabling sellers to edit or delete their listings. Future enhancements include full user account management with signup/login, robust checkout processes, and improved error handling.

## Features
- **Item Posting:** Sellers can post and update items (books, clothing, furniture, electronics, and sports gear) for sale.
- **Browsing & Searching:** Buyers can search items by category or keyword.
- **Cart & Checkout:** Buyers add items to their cart and checkout, which removes ordered items from the listings.
- **Editing & Deleting:** Sellers can edit or delete their posted items.
- **Account Management:** (Upcoming) Create and log in to an account to personalize the experience.
- **Error Handling:** (Upcoming) Improved feedback for error conditions.
  
## Tech Stack
- **Backend:** Node.js, Express, MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Authentication:** Planned integration using bcrypt (for hashing passwords)
- **Version Control:** Git & GitHub

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jgalligan1/Exchange4Students.git
   cd Exchange4Students

2. **Configure MySQL:**
- Create a database named **project1**.
- Run the SQL script (**MySQLLocal.session.sql**) to create the **items** table.

3. **Install dependencies:**
   ```bash
   npm install

4. **Run the application:** Use the provided bash script:
   ```bash
   ./run.sh

   This script initializes your database and starts the Node.js server on port 3000.

5. Launch the Front-End: Open the HTML files (e.g., MainDashboard.html, SearchBrowser.html, SellItem.html) in your live server environment.
