# The Global Kitchen API

## Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Configuration:** Dotenv

## Features
- **3-Tier Architecture:** Routes, Controllers, Services, and Models.
- **Full CRUD Support:** Create, Read, Update, and Delete recipes.
- **Validation:** Strict BSON schema validation for all recipe fields.
- **Categorization:** Filter recipes by category (Breakfast, Lunch, Dinner, etc.).
- **Error Handling:** Global middleware for clean error responses.
- **Performance:** Indexed fields for optimized category lookups.

## Installation & Setup
1. Clone the repository:
 ```bash
 git clone [https://github.com/808Brenda/NMB_KITCHEN_API]
 ```
2. Install dependencies:
 ```bash
 npm install
 ```
3. Create a `.env` file in the root directory and add:
 ```env
 PORT= http://localhost:3000/
 MONGODB_URI=your_mongodb_connection_string
 ```
4. Start the server:
 ```bash
 npm run dev
 ```
