# Coditor - Collaborative Code Editor

Coditor is a web application that provides a collaborative code editing experience, allowing users to edit code in real-time on the same file. It supports multiple programming languages, including Python, C, and JavaScript. Coditor features syntax highlighting for these languages, enhancing the coding experience for users.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time collaborative code editing
- Support for multiple programming languages (Python, C, JavaScript)
- Syntax highlighting for enhanced code readability
- Ability to run code within the browser
- Integration with Pusher library for real-time updates
- User-friendly Ace Editor for code editing

## Technologies Used

- Python Flask: Web framework for building the backend server
- HTML / CSS / JS: Frontend development technologies
- SQLite Database: Lightweight relational database for storing user data
- Docker: Containerization for secure code execution
- Ace Editor: Feature-rich code editor for the best coding experience
- Pusher Library: Real-time communication for collaborative editing
- jQuery: Simplifies client-side scripting for dynamic web pages

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/coditor.git
   cd coditor
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Initialize the database:

   ```bash
   flask init-db
   ```

4. Run the application:
   ```bash
   python app.py
   ```

The application will be accessible at [http://localhost:5000](http://localhost:5000).

## Usage

1. Open the Coditor application in your web browser.
2. Create an account or log in if you already have one.
3. Choose a programming language (default: 'Python').
4. Invite collaborators by username.
5. Start coding collaboratively in real-time!

## Contributing

Anyone is welcome to contribute to Coditor.
