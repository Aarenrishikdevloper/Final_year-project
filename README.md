

# 🚀 Getting Started Guide  

### 1️⃣ **Install Dependencies**  
- Run `npm install` in **both** the `client` and root directories.  

### 2️⃣ **Set Up Ganache**  
- Download & install [Ganache](https://trufflesuite.com/ganache/).  
- Open Ganache and create a **New Workspace** with:  
  - **Ethereum balance**: 1000 (default).  

### 3️⃣ **Configure MetaMask**  
- Open **MetaMask** and:  
  - Click **"Add a Network"** → **"Add a Custom RPC"**  
  - **Network Name**: `Local Ganache` (or any name)  
  - **RPC URL**: (Copy from Ganache)  
  - **Chain ID**: `1337` (if not auto-filled)  
  - **Save** the network.  

#### 🔑 **Import an Account**  
- In MetaMask:  
  - Click the **account dropdown** → **"Import Account"**  
  - Go to **Ganache** → Click the **key icon** 🔑 beside an account.  
  - Copy the **private key** and paste it into MetaMask.  
  - Click **"Import"**.  

### 4️⃣ **Compile & Deploy Smart Contracts**  
- In **VS Code terminal**:  
  - `npx truffle compile`  
  - `truffle migrate --reset --network development`  

### 5️⃣ **Link Contracts in Ganache**  
- In **Ganache**:  
  - Go to **Contracts** tab → **"Link Truffle Projects"**  
  - Click **"Add Project"** and select `truffle-config.js` from your project.  
  - **Save & Restart**.  

### 6️⃣ **Run the Frontend**  
- Open a new terminal:  
  - `cd client`  
  - `npm run dev`  

### ✉️ **Enable Email Notifications (Optional)**  
- Create a `.env.local` file in `client` (same level as `package.json`) and add:  
  ```plaintext
  EMAIL_USER=your-email@gmail.com  
  EMAIL_PASSWORD=your-app-password  
  ```  
- To get an **App Password**:  
  - Visit 🔗 [Google App Passwords](https://myaccount.google.com/apppasswords)  
  - Generate a password and paste it in `EMAIL_PASSWORD`.  

---

Now you're all set! 🎉 The app should work smoothly, including email notifications. 🚀  

