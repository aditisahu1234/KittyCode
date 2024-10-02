# KittyCode

## Introduction

KittyCode is a secure end-to-end communication platform designed for messaging, voice, and video chats with a focus on privacy. Built with advanced encryption techniques, it offers a secure way for businesses, professionals, and privacy-conscious individuals to communicate without fear of surveillance or data breaches.

**Key Features:**
- End-to-end encryption using the Signal Protocol.
- On-device sentiment analysis for adaptive encryption.

## Setup and Run

### Prerequisites
- **Node.js** (backend)
- **JDK**
- **Android Studio**

### Step-by-Step Setup
1. **Development Environment Setup :**
     Refer to this webpage if you don't have a development environment or the prerequisites ->  https://reactnative.dev/docs/set-up-your-environment
2. **Clone the Repository:**
   ```bash
   git clone https://github.com/aditisahu1234/KittyCode.git
   cd KittyCode
3. **Backend Setup: Navigate to the backend folder and install dependencies:**
   ```bash
    cd backend
    npm install
4. **(OPTIONAL) NGROK:**
   
      The backend has been hosted on AWS but if wanting to test locally then ngrok is needed.
      Refer to this webpage for setting up ngrok 
       https://ngrok.com/docs/getting-started/
   
      Then Run :
    ```bash
    ngrok http 3000
    ```
      Then change the url in every frontend file where api calls are being made.
      The backend server is running on a AWS EC2 instance so no need to do these steps if just for testing.
4. **Run the frontend:**
   
    **Install the dependencies required for frontend:**
     ```bash
      cd frontend
      cd kittycode
      npm install
     ```
    **Creating a Prebuild for the react native expo project to use native modlues for encryption**
     ```bash
       npx expo prebuild
     ```
     **Running the file and opening on android (Android Studio is required)**
     ```bash
       npm run android
     ```


